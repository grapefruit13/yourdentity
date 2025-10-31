const homeService = require("../services/homeService");

class HomeController {
  /**
   * 홈 화면 데이터 조회 (운영 배포일자 기준 가장 최신 항목)
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @param {Function} next - Express next 함수
   * @returns {Promise<void>}
   */
  async getHomeScreen(req, res, next) {
    try {
      const homeData = await homeService.getHomeScreenData();

      return res.success({
        message: "홈 화면 데이터를 성공적으로 조회했습니다.",
        data: homeData
      });

    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new HomeController();
