class ImgBBService {
  constructor() {
    // NOTE: imgBB API 키가 필요합니다
  }

  async uploadImage(imageData, name = 'upload') {
    // 실제 구현 시 주석 해제하고 사용:
    const functions = require('firebase-functions');

    const IMGBB_API_KEY = functions.config().imgbb.api_key; // apikey 추가 필요
    
    if (!IMGBB_API_KEY) {
      throw new Error('ImgBB API key not configured');
    }

    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', imageData);
    formData.append('name', name);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        data: {
          imageUrl: result.data.url,
          displayUrl: result.data.display_url,
          deleteUrl: result.data.delete_url,
          size: result.data.size,
          title: result.data.title
        }
      };
    } else {
      return {
        success: false,
        error: result.error.message
      };
    }
  }

  generateMockImageUrl(userId, type = 'profile') {
    return `https://i.ibb.co/sample/${userId}-${type}.jpg`;
  }
}

module.exports = new ImgBBService();