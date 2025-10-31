const homeService = require("../services/homeService");

class HomeController {
  /**
   * 홈 화면 데이터 조회 (운영 배포일자 기준 가장 최신 항목)
   */
  async getHomeScreen(req, res, next) {
    try {
      const homeData = await homeService.getHomeScreenData();

      res.success({
        message: "홈 화면 데이터를 성공적으로 조회했습니다.",
        data: homeData
      });

    } catch (error) {
      console.error("[HomeController] 홈 화면 데이터 조회 오류:", error.message);
      return next(error);
    }
  }
}

module.exports = new HomeController();
