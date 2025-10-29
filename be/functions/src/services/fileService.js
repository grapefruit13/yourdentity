const {admin} = require("../config/database");
const {nanoid} = require("../utils/helpers");
const {FieldValue} = require("firebase-admin/firestore");

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
            uploadedAt: FieldValue.serverTimestamp(),
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
   * 파일 삭제
   * @param {string} fileName - Cloud Storage 내 파일명 (경로 포함)
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteFile(fileName) {
    try {
      const file = this.bucket.file(fileName);
      await file.delete();

      return {
        status: 200,
        message: "File deleted successfully",
      };
    } catch (error) {
      if (error.code === 404) {
        return {
          status: 200,
          message: "File not found (may have been already deleted)",
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

