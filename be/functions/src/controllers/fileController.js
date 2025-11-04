const fileService = require("../services/fileService");
const Busboy = require("busboy");
const {Readable} = require("stream");
const path = require("path");

// 파일 업로드 관련 상수
const FILES_FOLDER = "files";// 스토리지에 저장되는 기본 폴더 이름
const MAX_UPLOAD_FILES = 5; // 5개 - 업로드 가능한 파일의 개수(이미지, 파일 등)
const FILE_UPLOAD_MAX_SIZE = 10 * 1024 * 1024; // 한 파일 최대 크기 (10MB)
const FILE_UPLOAD_MAX_FIELDS = 10; // 파일 외 필드 최대 개수 (여유롭게 10개)
const BUSBOY_PARAM_CHARSET = "utf8"; // 업로드 파라미터 문자셋 (일반적으로 utf8)
const BUSBOY_HIGH_WATER_MARK = 64 * 1024; // 스트림 버퍼 크기 (안전한 기본값)
const FILE_UPLOAD_TIMEOUT_MS = 120000; // 업로드 타임아웃 (2분, 너무 오래 걸리면 중단)

class FileController {
  /**
   * 여러 파일을 동시에 업로드합니다.
   * @param {Object} req - Express request 객체 (multipart/form-data)
   * @param {Object} res - Express response 객체
   * @param {Function} next - Express next 미들웨어 함수
   * @returns {Promise<void>} 업로드 결과를 포함한 201 응답 또는 에러
   */
  async uploadMultipleFiles(req, res, next) {
    const startTime = Date.now();
    const userId = req.user?.uid;

    try {
      const contentType = req.headers["content-type"];
      if (!contentType || !contentType.includes("multipart/form-data")) {
        return res.error(400, "Content-Type은 multipart/form-data여야 합니다");
      }

      if (
        req.body &&
        typeof req.body === "object" &&
        !Buffer.isBuffer(req.body)
      ) {
        return res.error(400, "요청 본문이 이미 파싱되었습니다. raw multipart 데이터를 사용해주세요.");
      }


      let stream = req;
      if (Buffer.isBuffer(req.body)) {
        stream = new Readable();
        stream.push(req.body);
        stream.push(null);
      }

      const busboy = Busboy({
        headers: req.headers,
        limits: {
          fileSize: FILE_UPLOAD_MAX_SIZE,
          files: MAX_UPLOAD_FILES,
          fields: FILE_UPLOAD_MAX_FIELDS,
        },
        defParamCharset: BUSBOY_PARAM_CHARSET,
        highWaterMark: BUSBOY_HIGH_WATER_MARK,
      });

      const files = [];
      const activeFileStreams = [];
      let fileCount = 0;
      let fileReceived = false;
      let responseSent = false;
      let pendingUploads = 0;

      const sendResponse = (statusCode, data) => {
        if (responseSent) return;
        responseSent = true;
        if (statusCode === 201) {
          return res.created(data);
        }
        return res.status(statusCode).json({
          status: statusCode,
          data: data,
        });
      };

      const cleanupStreams = () => {
        activeFileStreams.forEach((fileStream) => {
          if (fileStream && typeof fileStream.destroy === "function") {
            try {
              fileStream.destroy();
            } catch (err) {
              console.error("파일 스트림 종료 중 오류:", err);
            }
          }
        });
        activeFileStreams.length = 0;

        try {
          busboy.destroy();
        } catch (err) {
          console.error("Busboy 인스턴스 종료 중 오류:", err);
        }

        // 요청 스트림 종료
        if (stream && typeof stream.destroy === "function") {
          try {
            stream.destroy();
          } catch (err) {
            console.error("요청 스트림 종료 중 오류:", err);
          }
        }
      };

      const checkAndSendResponse = () => {
        if (pendingUploads === 0 && fileReceived && !responseSent) {
          clearTimeout(timeout);

          sendResponse(201, {
            uploaded: files.filter(f => f.success).length,
            failed: files.filter(f => !f.success).length,
            files: files,
            errors: files.filter(f => !f.success).map(f => f.message),
          });
        }
      };

      busboy.on("file", async (fieldname, file, info) => {
        const fileIndex = fileCount++;

        if (fileIndex >= MAX_UPLOAD_FILES) {
          file.destroy();
          return;
        }

        const validation = fileService.validateFileType(
          info?.filename || "",
          info?.mimeType || ""
        );

        if (!validation.isValid) {
          fileReceived = true;
          files.push({
            success: false,
            message: validation.error,
          });
          file.resume();
          return;
        }

        fileReceived = true;
        pendingUploads++;

        // 활성 스트림 추적
        activeFileStreams.push(file);

        const {filename, mimeType: fileMimeType} = info;

        let fileName = `upload_${fileIndex}`;
        let mimeType = "application/octet-stream";

        if (filename) {
          try {
            const decoded = decodeURIComponent(filename);
            const base = path.basename(decoded); // 경로 제거
            fileName = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 128);
          } catch (error) {
            const base = path.basename(filename);
            fileName = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 128);
          }
        }
        if (fileMimeType) {
          mimeType = fileMimeType;
        }

        // 스트림을 직접 사용하여 업로드 (메모리 효율적)
        try {
          const result = await fileService.uploadFileStream(
              file,
              fileName,
              mimeType,
              FILES_FOLDER,
              userId,
          );

          if (result.success) {
            files.push({
              success: true,
              data: result.data,
            });
          } else {
            files.push({
              success: false,
              message: result.error,
            });
          }
        } catch (error) {
          files.push({
            success: false,
            message: error.message,
          });
        } finally {
          pendingUploads--;
          // 완료된 스트림 제거
          const streamIndex = activeFileStreams.indexOf(file);
          if (streamIndex > -1) {
            activeFileStreams.splice(streamIndex, 1);
          }
          checkAndSendResponse();
        }
      });

      const timeout = setTimeout(() => {
        if (responseSent) return; // 이미 응답했으면 무시
        
        console.error(`파일 업로드 타임아웃 - 사용자: ${userId || "알 수 없음"}`);
        responseSent = true;
        
        // 모든 활성 스트림 종료
        cleanupStreams();
        
        return res.error(408, "파일 업로드 시간이 초과되었습니다");
      }, FILE_UPLOAD_TIMEOUT_MS); 

      busboy.on("finish", () => {
        if (!fileReceived) {
          if (responseSent) return;
          
          console.error(`파일을 받지 못함 - 사용자: ${userId || "알 수 없음"}`);
          clearTimeout(timeout);
          responseSent = true;
          
          return res.error(400, "업로드된 파일이 없습니다");
        } else {
          checkAndSendResponse();
        }
      });

      busboy.on("error", (error) => {
        if (responseSent) return;
        
        clearTimeout(timeout);
        responseSent = true;
        
        // 에러 발생 시 스트림 정리
        cleanupStreams();
        
        // 에러를 중앙 errorHandler로 위임
        error.code = "BAD_REQUEST";
        error.message = "파일 업로드 중 오류가 발생했습니다: " + error.message;
        return next(error);
      });

      stream.pipe(busboy);
    } catch (error) {
      return res.error(500, error.message);
    }
  }

  /**
   * 파일을 삭제합니다 (소유권 검증 포함).
   * @param {Object} req - Express request 객체
   * @param {Object} res - Express response 객체
   * @param {Function} next - Express next 미들웨어 함수
   * @returns {Promise<void>} 204 No Content 또는 에러
   */
  async deleteFile(req, res, next) {
    try {
      const filePath = req.params.filePath;
      const userId = req.user?.uid;

      if (!filePath) {
        return res.error(400, "파일 경로가 필요합니다");
      }

      await fileService.deleteFile(filePath, userId);

      return res.noContent();
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new FileController();

