const reportContentService = require("../services/reportContentService");
const {successResponse} = require("../utils/helpers");
const {db} = require("../config/database");

class ReportContentController {
  /**
     * 게시글/댓글 신고 생성
     */
  async createReport(req, res, next) {
    try {
      // TODO : 실제 환경에서 현제 userId를 받는 것에 제한이 있는경우 로그인된  토큰정보로 userId조회하는 방안 고려
      // const { uid } = req.user; // authGuard에서 설정
      // const uid = 'RpqG32COF2Q3UbpDGp6PEAgiqtui_5'; // 임시 (직접 할당)
      const {
        targetType, // 신고 대상 종류
        targetId, // 신고 대상
        targetUserId, // 신고 대상 작성자
        reporterId, // 신고자ID
        communityId, // 커뮤니티ID
        reportReason, // 신고 사유
      } = req.body;

      // 요청 데이터 검증
      if (!targetType || !targetId || !reportReason || !targetUserId || !reporterId) {
        return res.error(400, "필수 필드가 누락되었습니다. (targetType, targetId, targetUserId, reporterId, reportReason)");
      }

      if (!["post", "comment"].includes(targetType)) {
        return res.error(400, "targetType은 'post' 또는 'comment'여야 합니다.");
      }

      // Firestore에서 유저 존재 여부 확인
      const userDoc = await db.collection("users").doc(reporterId).get();
      if (!userDoc.exists) {
        return res.error(404, "해당 reporterId를 가진 사용자를 찾을 수 없습니다.");
      }

      // 사용자 이름(닉네임) 가져오기
      // const userData = userDoc.data();
      // const reporterName = userData.name || "알 수 없음"; //신고자

      const reportData = {
        targetType,
        targetId,
        targetUserId,
        communityId: communityId || null,
        reporterId,
        reportReason,
      };

      const result = await reportContentService.createReport(reportData);

      res.created({ message: "신고가 접수되었습니다.", reportId: result.id });
    } catch (error) {
      console.error("Create report error:", error);

      next(error);

    }
  }


  /**
 * 내가 신고한 목록 조회
 * TODO : 현재 테스트가 curl로 생성한 계정에 대해서만 토큰을 발급받아 테스트 가능
 * -> curl로 생성한 계정은 firstor에 데이터가 생성되지 않아 나중에 다시 테스트 필요
 */
  async getMyReports(req, res) {
    try {
      const reporterId = req.user.uid; // 인증된 사용자 ID
      const { size = 10, cursor } = req.body;


      const result = await reportContentService.getReportsByReporter(reporterId, {
        size: parseInt(size),
        cursor,
      });

      res.success(result);
    } catch (error) {
      console.error("Get my reports error:", error);
      next(error);
    }
  }


  // 노션 전체 DB를 Firebase reports 컬렉션으로 동기화
  async syncNotionReports(req, res) {
    try {
      const syncedReports = await reportContentService.syncResolvedReports();
      res.success({ 
        message: "동기화가 완료되었습니다.", 
        count: syncedReports.length 
      });
    } catch (error) {
      console.error("Notion -> Firebase 동기화 실패:", error);
      next(error);
    }
  }
}


module.exports = new ReportContentController();
