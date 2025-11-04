const {admin} = require("../config/database");
const {nanoid} = require("../utils/helpers");

// 파일 형식 검증 관련 상수
const ALLOWED_EXTENSIONS = [
  "jpg", "jpeg", "png", "gif", "webp", "svg", "pdf"
];
const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "application/pdf"
];

class FileService {
  constructor() {
    this.bucket = admin.storage().bucket();
  }

  /**
   * 파일 확장자와 MIME 타입이 허용되는지 검증합니다.
   * @param {string} filename - 파일명
   * @param {string} mimeType - MIME 타입
   * @returns {Object} { isValid: boolean, error?: string }
   */
  validateFileType(filename, mimeType) {
    try {
      if (!filename) {
        return { isValid: false, error: "파일명이 없습니다" };
      }

      const normalizedFilename = filename.toLowerCase();
      const lastDotIndex = normalizedFilename.lastIndexOf(".");

      // 확장자가 없거나 숨김 파일인 경우
      if (lastDotIndex === -1 || lastDotIndex === 0) {
        return { isValid: false, error: "파일 확장자가 없습니다" };
      }

      const extension = normalizedFilename.substring(lastDotIndex + 1);
      const normalizedMimeType = (mimeType || "").toLowerCase();

      const isAllowedExt = ALLOWED_EXTENSIONS.includes(extension);
      const isAllowedMime = ALLOWED_MIME_TYPES.includes(normalizedMimeType);

      // AND 조건: 확장자와 MIME 타입 모두 유효해야 통과
      if (!isAllowedExt || !isAllowedMime) {
        return {
          isValid: false,
          error: `허용되지 않은 파일 형식입니다. 확장자: ${extension}, MIME 타입: ${normalizedMimeType}`
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error("파일 형식 검증 중 오류:", error);
      return { isValid: false, error: "파일 형식 확인 중 오류가 발생했습니다" };
    }
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
        validation: true,
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

        fileStream.on("data", (chunk) => {
          uploadedSize += chunk.length;
        });

        fileStream.pipe(writeStream);

        writeStream.on("error", (error) => {
          console.error("File upload stream error:", error);
          reject({
            success: false,
            error: `파일 업로드 중 오류가 발생했습니다: ${error.message}`,
          });
        });

        writeStream.on("finish", async () => {
          try {
            const [meta] = await file.getMetadata();
            const actualSize = Number(meta.size) || uploadedSize;

            const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${uniqueFileName}`;

            resolve({
              success: true,
              data: {
                fileUrl: publicUrl,
                fileName: uniqueFileName,
                originalFileName: fileName,
                mimeType: mimeType,
                size: actualSize,
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
   * @param {string} userId - 사용자 ID (옵션, 제공 시 소유권 검증)
   * @returns {Promise<Object>} 각 파일의 존재 여부 및 소유권 결과
   */
  async filesExist(fileNames, userId = null) {
    try {
      if (!Array.isArray(fileNames) || fileNames.length === 0) {
        return {
          allExist: true,
          allOwned: true,
          results: {},
        };
      }

      const checkPromises = fileNames.map(async (fileName) => {
        const exists = await this.fileExists(fileName);
        let owned = false;

        // userId가 제공되고 파일이 존재하는 경우 소유권 검증
        if (userId && exists) {
          try {
            const file = this.bucket.file(fileName);
            const [metadata] = await file.getMetadata();
            const uploadedBy = metadata?.metadata?.uploadedBy;
            owned = uploadedBy === userId;
          } catch (error) {
            console.error(`File ownership check error for ${fileName}:`, error);
            owned = false;
          }
        }

        return {fileName, exists, owned: userId ? owned : exists};
      });

      const results = await Promise.all(checkPromises);
      const resultsMap = {};
      let allExist = true;
      let allOwned = true;

      results.forEach(({fileName, exists, owned}) => {
        resultsMap[fileName] = userId ? owned : exists;
        if (!exists) {
          allExist = false;
        }
        if (userId && !owned) {
          allOwned = false;
        }
      });

      return {
        allExist,
        allOwned: userId ? allOwned : allExist,
        results: resultsMap,
      };
    } catch (error) {
      console.error("Files exist check error:", error);
      return {
        allExist: false,
        allOwned: false,
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
        const error = new Error("파일을 찾을 수 없습니다");
        error.code = "NOT_FOUND";
        throw error;
      }

      // userId가 없으면 삭제 불가 (보안상 필수)
      if (!userId) {
        const error = new Error("파일 삭제를 위해서는 사용자 인증이 필요합니다");
        error.code = "UNAUTHORIZED";
        throw error;
      }

      // 메타데이터에서 소유자 확인
      const [metadata] = await file.getMetadata();
      const uploadedBy = metadata?.metadata?.uploadedBy;
      
      if (!uploadedBy) {
        const error = new Error("파일 소유자 정보를 찾을 수 없어 삭제할 수 없습니다");
        error.code = "FORBIDDEN";
        throw error;
      }
      
      if (uploadedBy !== userId) {
        const error = new Error("이 파일을 삭제할 권한이 없습니다");
        error.code = "FORBIDDEN";
        throw error;
      }

      await file.delete();

      return { success: true };
    } catch (error) {
      // 이미 에러 객체에 code가 있으면 그대로 재throw
      if (error.code === "NOT_FOUND" || error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN") {
        throw error;
      }

      // 예상치 못한 에러
      if (error.code === 404) {
        const notFoundError = new Error("파일을 찾을 수 없습니다");
        notFoundError.code = "NOT_FOUND";
        throw notFoundError;
      }

      const internalError = new Error("파일 삭제 중 오류가 발생했습니다");
      internalError.code = "INTERNAL";
      throw internalError;
    }
  }
}

module.exports = new FileService();

