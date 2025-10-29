const fileService = require("../services/fileService");
const Busboy = require("busboy");
const {Readable} = require("stream");

// 파일 업로드 관련 상수
const FILES_FOLDER = "files";
const MAX_UPLOAD_FILES = 5;

class FileController {
  async uploadMultipleFiles(req, res) {
    const startTime = Date.now();
    const userId = req.user?.uid;

    try {
      const contentType = req.headers["content-type"];
      if (!contentType || !contentType.includes("multipart/form-data")) {
        return res.status(400).json({
          status: 400,
          message: "Content-Type은 multipart/form-data여야 합니다",
        });
      }

      if (
        req.body &&
        typeof req.body === "object" &&
        !Buffer.isBuffer(req.body)
      ) {
        return res.status(400).json({
          status: 400,
          message: "요청 본문이 이미 파싱되었습니다. raw multipart 데이터를 사용해주세요.",
        });
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
      let fileCount = 0;
      let fileReceived = false;
      let responseSent = false;
      let pendingUploads = 0;

      const sendResponse = (statusCode, data) => {
        if (responseSent) return;
        responseSent = true;
        res.status(statusCode).json({
          status: statusCode,
          data: data,
        });
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
          checkAndSendResponse();
        }
      });

      const timeout = setTimeout(() => {
        console.error(`⏱️ Upload timeout for user: ${userId || "unknown"}`);
        res.status(408).json({
          status: 408,
          message: "파일 업로드 시간이 초과되었습니다",
        });
      }, 120000); // 2분 타임아웃

      busboy.on("finish", () => {
        if (!fileReceived) {
          console.error(`❌ No file received from user: ${userId || "unknown"}`);
          res.status(400).json({
            status: 400,
            message: "업로드된 파일이 없습니다",
          });
        } else {
          checkAndSendResponse();
        }
      });

      busboy.on("error", (error) => {
        clearTimeout(timeout);
        res.status(400).json({
          status: 400,
          message: "파일 업로드 중 오류가 발생했습니다: " + error.message,
        });
      });

      stream.pipe(busboy);
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }

  async deleteFile(req, res) {
    try {
      const fileName = req.params.fileName;
      const userId = req.user?.uid;

      if (!fileName) {
        return res.status(400).json({
          status: 400,
          message: "파일명이 필요합니다",
        });
      }

      const result = await fileService.deleteFile(fileName, userId);

      if (result.status === 200) {
        res.status(204).end();
      } else {
        res.status(result.status || 500).json({
          status: result.status || 500,
          message: result.message || result.error,
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }
}

module.exports = new FileController();

