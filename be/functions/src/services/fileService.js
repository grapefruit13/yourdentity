const {admin} = require("../config/database");
const {nanoid} = require("../utils/helpers");

class FileService {
  constructor() {
    this.bucket = admin.storage().bucket();
  }

  /**
   * 파일 업로드 (버퍼 방식 - 안정적)
   * @param {Buffer} fileBuffer - 파일 버퍼
   * @param {string} fileName - 원본 파일명
   * @param {string} mimeType - MIME 타입
   * @param {string} folder - 업로드할 폴더 경로
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 업로드 결과
   */
  async uploadFile(fileBuffer, fileName, mimeType, folder = "files", userId = null) {
    try {

      const safeFileName = fileName
          .replace(/[^a-zA-Z0-9.-]/g, "_")
          .replace(/\s+/g, "_");

      const uniqueId = nanoid(12);
      const fileExtension = safeFileName.split(".").pop();
      const baseName = safeFileName.replace(/\.[^/.]+$/, "");
      
      const randomFolder = nanoid(12);
      const uniqueFileName = `${folder}/${randomFolder}/${baseName}_${uniqueId}.${fileExtension}`;

      const file = this.bucket.file(uniqueFileName);

      await file.save(fileBuffer, {
        metadata: {
          contentType: mimeType,
          metadata: {
            originalFileName: fileName,
            uploadedAt: new Date().toISOString(),
            uploadedBy: userId || "anonymous",
          },
        },
        resumable: true,
        validation: false,
        public: true, 
      });

      const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${uniqueFileName}`;

      return {
        success: true,
        data: {
          fileUrl: publicUrl,
          fileName: uniqueFileName,
          originalFileName: fileName,
          mimeType: mimeType,
          size: fileBuffer.length,
          bucket: this.bucket.name,
          path: uniqueFileName,
        },
      };
    } catch (error) {
      console.error("File upload error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 파일 업로드 (스트림 방식 - 메모리 효율적, 큰 파일에 적합)
   * @param {Stream} fileStream - 파일 스트림
   * @param {string} fileName - 원본 파일명
   * @param {string} mimeType - MIME 타입
   * @param {string} folder - 업로드할 폴더 경로
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 업로드 결과
   */
  async uploadFileStream(fileStream, fileName, mimeType, folder = "files", userId = null) {
    return new Promise((resolve, reject) => {
      try {
        const safeFileName = fileName
            .replace(/[^a-zA-Z0-9.-]/g, "_")
            .replace(/\s+/g, "_");

        const uniqueId = nanoid(12);
        const fileExtension = safeFileName.split(".").pop();
        const baseName = safeFileName.replace(/\.[^/.]+$/, "");
        
        const randomFolder = nanoid(12);
        const uniqueFileName = `${folder}/${randomFolder}/${baseName}_${uniqueId}.${fileExtension}`;

        const file = this.bucket.file(uniqueFileName);

        const writeStream = file.createWriteStream({
          metadata: {
            contentType: mimeType,
            metadata: {
              originalFileName: fileName,
              uploadedAt: new Date().toISOString(),
              uploadedBy: userId || "anonymous",
            },
          },
          resumable: true,
          validation: false,
          public: true,
        });

        let uploadedSize = 0;

        fileStream.pipe(writeStream);

        writeStream.on("error", (error) => {
          console.error("File upload stream error:", error);
          reject({
            success: false,
            error: `파일 업로드 중 오류가 발생했습니다: ${error.message}`,
          });
        });

        writeStream.on("progress", (progress) => {
          uploadedSize = progress.bytesWritten;
        });

        writeStream.on("finish", async () => {
          try {
            const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${uniqueFileName}`;

            resolve({
              success: true,
              data: {
                fileUrl: publicUrl,
                fileName: uniqueFileName,
                originalFileName: fileName,
                mimeType: mimeType,
                size: uploadedSize,
                bucket: this.bucket.name,
                path: uniqueFileName,
              },
            });
          } catch (error) {
            reject({
              success: false,
              error: `파일 업로드 완료 처리 중 오류가 발생했습니다: ${error.message}`,
            });
          }
        });

        fileStream.on("error", (error) => {
          writeStream.destroy();
          reject({
            success: false,
            error: `파일 스트림 처리 중 오류가 발생했습니다: ${error.message}`,
          });
        });
      } catch (error) {
        console.error("File upload stream setup error:", error);
        reject({
          success: false,
          error: `파일 업로드 설정 중 오류가 발생했습니다: ${error.message}`,
        });
      }
    });
  }

  /**
   * 여러 파일을 동시에 업로드 (병렬 처리)
   * @param {Array<Object>} files - [{ stream, fileName, mimeType }] 형식의 배열
   * @param {string} folder - 업로드할 폴더 경로
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 업로드 결과
   */
  async uploadMultipleFiles(files, folder = "files", userId = null) {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadFile(file.buffer, file.fileName, file.mimeType, folder, userId),
      );

      const results = await Promise.all(uploadPromises);

      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      return {
        success: failed.length === 0,
        data: {
          uploaded: successful.length,
          failed: failed.length,
          files: successful.map((r) => r.data),
          errors: failed.length > 0 ? failed.map((r) => r.error) : [],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 파일 존재 여부 확인
   * @param {string} fileName - Cloud Storage 내 파일명 (경로 포함)
   * @returns {Promise<boolean>} 파일 존재 여부
   */
  async fileExists(fileName) {
    try {
      const file = this.bucket.file(fileName);
      const [exists] = await file.exists();
      return exists;
    } catch (error) {
      console.error("File exists check error:", error);
      return false;
    }
  }

  /**
   * 여러 파일 존재 여부 확인 (병렬 처리)
   * @param {Array<string>} fileNames - 파일 경로 배열
   * @returns {Promise<Object>} 각 파일의 존재 여부 결과
   */
  async filesExist(fileNames) {
    try {
      if (!Array.isArray(fileNames) || fileNames.length === 0) {
        return {
          allExist: true,
          results: {},
        };
      }

      const checkPromises = fileNames.map(async (fileName) => {
        const exists = await this.fileExists(fileName);
        return {fileName, exists};
      });

      const results = await Promise.all(checkPromises);
      const resultsMap = {};
      let allExist = true;

      results.forEach(({fileName, exists}) => {
        resultsMap[fileName] = exists;
        if (!exists) {
          allExist = false;
        }
      });

      return {
        allExist,
        results: resultsMap,
      };
    } catch (error) {
      console.error("Files exist check error:", error);
      return {
        allExist: false,
        results: {},
      };
    }
  }

  /**
   * 파일 삭제
   * @param {string} fileName - Cloud Storage 내 파일명 (경로 포함)
   * @param {string} userId - 요청한 사용자 ID (소유자 확인용)
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteFile(fileName, userId = null) {
    try {
      const file = this.bucket.file(fileName);

      const [exists] = await file.exists();
      if (!exists) {
        return {
          status: 404,
          message: "파일을 찾을 수 없습니다",
        };
      }

      // userId가 없으면 삭제 불가 (보안상 필수)
      if (!userId) {
        return {
          status: 401,
          message: "파일 삭제를 위해서는 사용자 인증이 필요합니다",
        };
      }
      // 메타데이터에서 소유자 확인
      const [metadata] = await file.getMetadata();
      const uploadedBy = metadata?.metadata?.uploadedBy;
      
      if (!uploadedBy) {
        return {
          status: 403,
          message: "파일 소유자 정보를 찾을 수 없어 삭제할 수 없습니다",
        };
      }
      
      if (uploadedBy !== userId) {
        return {
          status: 403,
          message: "이 파일을 삭제할 권한이 없습니다",
        };
      }

      await file.delete();

      return {
        status: 200,
        message: "파일이 성공적으로 삭제되었습니다",
      };
    } catch (error) {
      if (error.code === 404) {
        return {
          status: 404,
          message: "파일을 찾을 수 없습니다",
        };
      }

      return {
        status: 500,
        message: error.message,
      };
    }
  }
}

module.exports = new FileService();

