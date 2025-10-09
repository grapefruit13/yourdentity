const reportContentService = require("../services/reportContentService");
const { successResponse } = require("../utils/helpers");
const {db} = require("../config/database");

class ReportContentController {

    /**
     * 게시글/댓글 신고 생성
     */
    async createReport(req, res) {
      try {

        //TODO : 실제 환경에서 현제 userId를 받는 것에 제한이 있는경우 로그인된  토큰정보로 userId조회하는 방안 고려
        //const { uid } = req.user; // authGuard에서 설정
        //const uid = 'RpqG32COF2Q3UbpDGp6PEAgiqtui_5'; // 임시 (직접 할당)
        const { 
          targetType, //신고 대상 종류
          targetId,  //신고 대상
          targetUserId, //신고 대상 작성자
          reporterId, //신고자ID
          communityId, //커뮤니티ID
          reportReason  //신고 사유
        } = req.body;
  
        // 요청 데이터 검증
        if (!targetType || !targetId || !reportReason || !targetUserId || !reporterId) {
          return res.status(400).json({
            success: false,
            error: "필수 필드가 누락되었습니다. (targetType, targetId, targetUserId, reporterId, reportReason)"
          });
        }
  
        if (!['post', 'comment'].includes(targetType)) {
          return res.status(400).json({
            success: false,
            error: "targetType은 'post' 또는 'comment'여야 합니다."
          });
        }

        //Firestore에서 유저 존재 여부 확인
        const userDoc = await db.collection("users").doc(reporterId).get();
        if (!userDoc.exists) {
          return res.status(404).json({
            success: false,
            error: "해당 reporterId를 가진 사용자를 찾을 수 없습니다."
          });
        }

        //사용자 이름(닉네임) 가져오기
        //const userData = userDoc.data();
        //const reporterName = userData.name || "알 수 없음"; //신고자
  
        const reportData = {
          targetType,
          targetId,
          targetUserId,
          communityId: communityId || null,
          reporterId,
          reportReason
        };
  
        const result = await reportContentService.createReport(reportData);
        
        res.status(201).json(successResponse(201, result, "신고가 접수되었습니다."));
      } catch (error) {
        console.error("Create report error:", error);
        
        if (error.message === "이미 신고한 콘텐츠입니다.") {
          return res.status(400).json({
            success: false,
            error: error.message
          });
        }
        
        if (error.message.includes("찾을 수 없습니다")) {
          return res.status(404).json({
            success: false,
            error: error.message
          });
        }
        
        return res.status(500).json({
          success: false,
          error: "서버 오류가 발생했습니다."
        });
      }
    }


/**
 * 내가 신고한 목록 조회
 */
async getMyReports(req, res) {
  try {
    const reporterId = req.user.uid;
    const { page = 0, size = 10, lastCreatedAt } = req.body;

    if (!reporterId) {
      return res.status(401).json({ success: false, error: "인증 정보가 없습니다." });
    }

    const result = await reportContentService.getUserReports(reporterId, {
      size: parseInt(size),
      lastCreatedAt,
    });

    res.json(successResponse(200, result));
  } catch (error) {
    console.error("Get my reports error:", error);
    res.status(500).json({
      success: false,
      error: "서버 오류가 발생했습니다."
    });
  }
}

  
    /**
     * 신고 상세 조회(보류)
     */
    async getReportById(req, res) {
      try {
        const { reportId } = req.params;
        const report = await reportContentService.getReportById(reportId);
        
        if (!report) {
          return res.status(404).json({
            success: false,
            error: "신고를 찾을 수 없습니다."
          });
        }
        
        res.json(successResponse(200, report));
      } catch (error) {
        console.error("Get report by id error:", error);
        res.status(500).json({
          success: false,
          error: "서버 오류가 발생했습니다."
        });
      }
    }


    //노션 전체 DB를 Firebase reports 컬렉션으로 동기화
    async syncNotionReports(req, res) {
      try {
        const syncedReports = await reportContentService.syncAllReportsToFirebase();
        res.status(200).json({ success: true, count: syncedReports.length });
      } catch (error) {
        console.error("Notion -> Firebase 동기화 실패:", error);
        res.status(500).json({ success: false, message: error.message });
      }
    }

  }

  
  
  module.exports = new ReportContentController();
