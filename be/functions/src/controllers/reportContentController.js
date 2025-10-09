const reportContentService = require("../services/reportContentService");
const { successResponse } = require("../utils/helpers");

class ReportContentController {

    /**
     * 게시글/댓글 신고 생성
     */
    async createReport(req, res) {
      try {

        //const { uid } = req.user; // authGuard에서 설정
        const uid = 'RpqG32COF2Q3UbpDGp6PEAgiqtui_5'; // 임시 (직접 할당)
        const { 
          targetType, 
          targetId, 
          targetUserId,
          communityId, 
          reportReason 
        } = req.body;
  
        // 요청 데이터 검증
        if (!targetType || !targetId || !reportReason || !targetUserId) {
          return res.status(400).json({
            success: false,
            error: "필수 필드가 누락되었습니다. (targetType, targetId, targetUserID, reportReason)"
          });
        }
  
        if (!['post', 'comment'].includes(targetType)) {
          return res.status(400).json({
            success: false,
            error: "targetType은 'post' 또는 'comment'여야 합니다."
          });
        }
  
        // TODO: 실제 구현 시 사용자 이름을 데이터베이스에서 조회
        const reporterName = "사용자닉네임"; // 임시값
  
        const reportData = {
          targetType,
          targetId,
          targetUserId,
          communityId: communityId || null,
          reporterId: uid,
          reporterName,
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
     * 내가 신고한 목록 조회(보류)
     */
    async getMyReports(req, res) {
      try {
        const { uid } = req.user;
        const { page = 0, size = 10, status, targetType } = req.query;
        
        const result = await reportContentService.getUserReports(uid, {
          page: parseInt(page),
          size: parseInt(size),
          status,
          targetType
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
        const { uid } = req.user;
        
        const report = await reportContentService.getReportById(reportId, uid);
        
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
