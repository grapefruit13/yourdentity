const imgbbService = require('../services/imgbbService');
const firestoreService = require('../services/firestoreService');

class ImageController {
  async uploadImage(req, res) {
    try {
      const { image, name = 'upload' } = req.body;
      
      if (!image) {
        return res.status(400).json({ 
          success: false, 
          error: 'image data is required (base64 encoded)' 
        });
      }

      const result = await imgbbService.uploadImage(image, name);

      res.json({
        success: true,
        message: result.data,
        ...result
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async updateProfileImage(req, res) {
    try {
      const { userId } = req.params;
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ 
          success: false, 
          error: 'image data is required (base64 encoded)' 
        });
      }

      // 실제 구현 시:
      // 1. imgBB API로 이미지 업로드
      // 2. 반환된 URL을 Firestore의 사용자 profileImageUrl에 저장
      
      // 현재는 모의 응답
      const mockImageUrl = imgbbService.generateMockImageUrl(userId, 'profile');
      
      await firestoreService.updateUserProfileImage(userId, mockImageUrl);

      res.json({
        success: true,
        message: 'Profile image updated (mock)',
        data: {
          userId,
          profileImageUrl: mockImageUrl
        },
        note: 'imgBB API 키 설정 후 실제 이미지 업로드가 가능합니다'
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}

module.exports = new ImageController();