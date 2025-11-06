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
   * 사용자에게 리워드 부여
   * @param {string} actionKey - 액션 키 (예: "comment_create", "post_create")
   * @param {Object} metadata - 추가 정보 (commentId, postId 등)
   * @return {Promise<void>}
   */
  req.grantReward = async (actionKey, metadata = {}) => {
    const userId = req.user?.uid;

    // 사용자 인증 정보 없으면 리워드 부여하지 않음
    if (!userId) {
      console.warn('[REWARD] 리워드 부여 실패: 사용자 인증 정보 없음', { actionKey, metadata });
      return;
    }

    try {
      // RewardService를 통해 리워드 부여
      await rewardService.grantActionReward(userId, actionKey, metadata);
    } catch (error) {
      // 리워드 부여 실패해도 메인 비즈니스 로직은 정상 진행
      // (에러를 throw하지 않음)
      console.error('[REWARD] 리워드 부여 중 오류 발생:', error.message, {
        userId,
        actionKey,
        metadata,
      });
    }
  };

  next();
};

module.exports = rewardHandler;

