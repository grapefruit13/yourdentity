const fileService = require("../services/fileService");
const Busboy = require("busboy");
const {Readable} = require("stream");

// 파일 업로드 관련 상수
const FILES_FOLDER = "files";
const MAX_UPLOAD_FILES = 5;

class FileController {
  

  /**
   * 여러 파일 업로드
   */
  async uploadMultipleFiles(req, res) {
    const startTime = Date.now();
    const userId = req.user?.uid;

    try {
      const contentType = req.headers["content-type"];
      if (!contentType || !contentType.includes("multipart/form-data")) {
        return res.status(400).json({
          status: 400,
          message: "Content-Type must be multipart/form-data",
        });
      }

      if (
        req.body &&
        typeof req.body === "object" &&
        !Buffer.isBuffer(req.body)
      ) {
        return res.status(400).json({
          status: 400,
          message: "Request body already parsed. Please use raw multipart data.",
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
          console.log(`📊 Upload session completed in ${uploadDuration}ms for user: ${userId || "unknown"}, ${files.length} files processed`);

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

        console.log(`📤 Starting upload ${fileIndex + 1}: ${fileName} (${mimeType}) by user: ${userId || "unknown"}`);

        // 파일을 버퍼로 수집
        const chunks = [];
        for await (const chunk of file) {
          chunks.push(chunk);
        }
        const fileBuffer = Buffer.concat(chunks);

        try {
          const result = await fileService.uploadFile(
              fileBuffer,
              fileName,
              mimeType,
              folder,
              userId,
          );

          if (result.success) {
            console.log(`✅ File ${fileIndex + 1} uploaded successfully by user: ${userId || "unknown"}, file: ${fileName}, size: ${fileBuffer.length} bytes`);
            files.push({
              success: true,
              data: result.data,
            });
          } else {
            console.error(`❌ File ${fileIndex + 1} upload failed: ${result.error}, user: ${userId || "unknown"}`);
            files.push({
              success: false,
              message: result.error,
            });
          }
        } catch (error) {
          console.error(`❌ File ${fileIndex + 1} upload error: ${error.message}, user: ${userId || "unknown"}`);
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
          message: "Upload timeout",
        });
      }, 120000); // 2분 타임아웃

      busboy.on("finish", () => {
        console.log(`📋 Busboy finish event triggered. File received: ${fileReceived}, Pending uploads: ${pendingUploads}`);
        if (!fileReceived) {
          console.error(`❌ No file received from user: ${userId || "unknown"}`);
          res.status(400).json({
            status: 400,
            message: "No files uploaded",
          });
        } else {
          checkAndSendResponse();
        }
      });

      busboy.on("error", (error) => {
        clearTimeout(timeout);
        console.error(`❌ Busboy error for user: ${userId || "unknown"}, error: ${error.message}`);
        res.status(400).json({
          status: 400,
          message: "File upload error: " + error.message,
        });
      });

      stream.pipe(busboy);
    } catch (error) {
      console.error(`❌ Controller error for user: ${userId || "unknown"}, error: ${error.message}`);
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }

  /**
   * 파일 삭제
   */
  async deleteFile(req, res) {
    try {
      const fileName = req.params.fileName;

      if (!fileName) {
        return res.status(400).json({
          status: 400,
          message: "File name is required",
        });
      }

      const result = await fileService.deleteFile(fileName);

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

