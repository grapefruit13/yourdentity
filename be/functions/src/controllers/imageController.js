const imgbbService = require("../services/imgbbService");
const Busboy = require("busboy");
const {Readable} = require("stream");

class ImageController {
  async uploadImage(req, res) {
    try {
      const contentType = req.headers["content-type"];
      if (!contentType || !contentType.includes("multipart/form-data")) {
        return res.status(400).json({
          success: false,
          error: "Content-Type must be multipart/form-data",
        });
      }

      if (
        req.body &&
        typeof req.body === "object" &&
        !Buffer.isBuffer(req.body)
      ) {
        return res.status(400).json({
          success: false,
          error: "Request body already parsed. Please use raw multipart data.",
        });
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
          fileSize: 10 * 1024 * 1024,
          files: 1,
          fields: 10,
        },
        defParamCharset: "utf8",
        highWaterMark: 64 * 1024,
      });
      let fileReceived = false;
      let uploadStarted = false;
      let responseSent = false;

      const sendResponse = (statusCode, data) => {
        if (responseSent) return;
        responseSent = true;
        res.status(statusCode).json(data);
      };

      busboy.on("file", async (fieldname, file, info) => {
        if (uploadStarted || responseSent) {
          file.destroy();
          return;
        }
        uploadStarted = true;
        fileReceived = true;

        const {filename, mimeType: fileMimeType} = info;

        let fileName = "upload";
        let mimeType = "image/jpeg";

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

        if (!mimeType.startsWith("image/")) {
          file.destroy();
          return sendResponse(400, {
            success: false,
            error: "Unsupported file type. Only image files are allowed",
          });
        }

        try {
          const result = await imgbbService.uploadFileStream(
              file,
              fileName,
              mimeType,
          );

          if (result.success) {
            sendResponse(200, {
              success: true,
              message: "Image uploaded successfully",
              data: result.data,
            });
          } else {
            sendResponse(500, {
              success: false,
              error: result.error,
            });
          }
        } catch (error) {
          sendResponse(500, {
            success: false,
            error: error.message,
          });
        }
      });

      const timeout = setTimeout(() => {
        sendResponse(408, {
          success: false,
          error: "Upload timeout",
        });
      }, 8000);

      busboy.on("finish", () => {
        clearTimeout(timeout);
        if (!fileReceived) {
          sendResponse(400, {
            success: false,
            error: "No file uploaded",
          });
        }
      });

      busboy.on("error", (error) => {
        clearTimeout(timeout);
        sendResponse(400, {
          success: false,
          error: "File upload error: " + error.message,
        });
      });

      stream.pipe(busboy);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new ImageController();
