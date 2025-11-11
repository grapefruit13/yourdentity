const RewardService = require('../services/rewardService');

// RewardService 인스턴스 생성
const rewardService = new RewardService();

/**
 * Reward Handler Middleware
 * Express req 객체에 리워드 부여 함수를 추가합니다.
 * 
 * 사용법:
 * await req.grantReward('comment_create', { commentId: 'xxx', postId: 'yyy' });
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 * @return {void}
 */
const rewardHandler = (req, res, next) => {
  /**
   * 사용자에게 리워드 부여 (액션 기반)
   * @param {string} actionKey - 액션 키 (예: "comment")
   * @param {Object} metadata - 추가 정보 (commentId, postId 등)
   * @return {Promise<Object>} { success, reason?, amount? }
   */
  req.grantReward = async (actionKey, metadata = {}) => {
    const userId = req.user?.uid;

    if (!userId) {
      console.warn('[REWARD] 인증 정보 없음', { actionKey, metadata });
      return { success: false, reason: 'NO_AUTH' };
    }

    try {
      const result = await rewardService.grantActionReward(userId, actionKey, metadata);
      
      // 결과 로깅
      if (result.success && result.amount > 0) {
        console.log('[REWARD SUCCESS]', { userId, actionKey, amount: result.amount });
      } else if (result.message === 'Reward already granted') {
        console.log('[REWARD DUPLICATE]', { userId, actionKey });
      } else if (result.message === 'No reward for this action') {
        console.log('[REWARD] 리워드 정책 없음:', { actionKey });
      }
      
      return result;
    } catch (error) {
      // DAILY_LIMIT_EXCEEDED는 정상 흐름 (조용히 처리)
      if (error.code === 'DAILY_LIMIT_EXCEEDED') {
        console.log('[REWARD LIMIT] 일일 제한 도달:', { userId, actionKey });
        return { success: false, reason: 'DAILY_LIMIT' };
      }

      // 기타 에러는 로깅 후 무시 (메인 로직은 성공)
      console.error('[REWARD ERROR] 리워드 부여 중 오류:', error.message, { userId, actionKey, metadata });
      return { success: false, reason: 'ERROR', error: error.message };
    }
  };

  /**
   * 게시글 타입에 따른 리워드 부여 (게시글 전용)
   * @param {Object} post - 게시글 객체 ({ id, type, media, content, communityId })
   * @return {Promise<Object>} { success, reason?, amount? }
   */
  req.grantPostReward = async (post) => {
    const userId = req.user?.uid;

    if (!userId) {
      console.warn('[REWARD] 인증 정보 없음', { postId: post.id });
      return { success: false, reason: 'NO_AUTH' };
    }

    try {
      const result = await rewardService.grantPostReward(userId, post);
      
      // 결과 로깅
      if (result.success && result.amount > 0) {
        console.log('[REWARD SUCCESS]', { userId, postType: post.type, amount: result.amount });
      } else if (result.message === 'Reward already granted') {
        console.log('[REWARD DUPLICATE]', { userId, postType: post.type });
      } else if (result.message === 'No reward for this post type') {
        console.log('[REWARD] 리워드 대상 아님:', { postType: post.type });
      }
      
      return result;
    } catch (error) {
      // DAILY_LIMIT_EXCEEDED는 정상 흐름 (조용히 처리)
      if (error.code === 'DAILY_LIMIT_EXCEEDED') {
        console.log('[REWARD LIMIT] 일일 제한 도달:', { userId, postType: post.type });
        return { success: false, reason: 'DAILY_LIMIT' };
      }

      // 기타 에러는 로깅 후 무시
      console.error('[REWARD ERROR] 게시글 리워드 부여 중 오류:', error.message, { userId, postType: post.type });
      return { success: false, reason: 'ERROR', error: error.message };
    }
  };

  next();
};

module.exports = rewardHandler;

