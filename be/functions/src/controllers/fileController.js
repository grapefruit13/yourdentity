const fileService = require("../services/fileService");
const Busboy = require("busboy");
const {Readable} = require("stream");

// 파일 업로드 관련 상수
const FILES_FOLDER = "files";
const MAX_UPLOAD_FILES = 5;

class FileController {
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

      const folder = FILES_FOLDER;
      const maxFiles = MAX_UPLOAD_FILES;

      let stream = req;
      if (Buffer.isBuffer(req.body)) {
        stream = new Readable();
        stream.push(req.body);
        stream.push(null);
      }

      const busboy = Busboy({
        headers: req.headers,
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
          files: maxFiles,
          fields: 10,
        },
        defParamCharset: "utf8",
        highWaterMark: 64 * 1024,
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
          const uploadDuration = Date.now() - startTime;

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

        if (fileIndex >= maxFiles) {
          file.destroy();
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
            fileName = decodeURIComponent(filename);
          } catch (error) {
            fileName = filename;
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
              folder,
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
      }, 120000); 

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

