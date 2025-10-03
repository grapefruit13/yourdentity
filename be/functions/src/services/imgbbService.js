/**
 * ImgBB Service
 * 이미지 업로드를 위한 서비스 (현재는 모의 구현)
 */

/**
 * ImgBB 모의 서비스 클래스
 */
class ImgBBService {
  /**
   * 모의 이미지 URL 생성
   * @param {string} userId - 사용자 ID
   * @param {string} type - 이미지 타입
   * @return {string} 모의 이미지 URL
   */
  generateMockImageUrl(userId, type = "image") {
    const timestamp = Date.now();
    return `https://i.ibb.co/mock-${type}-${userId}-${timestamp}.jpg`;
  }

  /**
   * 모의 이미지 업로드
   * @param {string} imageData - Base64 인코딩된 이미지 데이터
   * @param {string} name - 이미지 이름
   * @return {Promise<Object>} 업로드 결과
   */
  async uploadImage(imageData, name = "upload") {
    // 실제 구현 시 imgBB API 호출
    // 현재는 모의 응답 반환

    const mockId = Math.random().toString(36).substring(2, 15);
    const mockUrl = `https://i.ibb.co/${mockId}/${name}`;
    const mockDeleteUrl = `https://ibb.co/delete/${mockId}`;

    return {
      success: true,
      data: {
        id: mockId,
        url: mockUrl,
        delete_url: mockDeleteUrl,
        title: name,
        width: 800,
        height: 600,
        size: 1024000, // 1MB
        time: Math.floor(Date.now() / 1000),
      },
    };
  }

  /**
   * 모의 이미지 삭제
   * @param {string} deleteUrl - 삭제 URL
   * @return {Promise<Object>} 삭제 결과
   */
  async deleteImage(deleteUrl) {
    // 실제 구현 시 imgBB API 호출
    // 현재는 모의 응답 반환

    return {
      success: true,
      message: "Image deleted successfully (mock)",
    };
  }
}

module.exports = new ImgBBService();
