const express = require("express");
const router = express.Router();
const tmiController = require("../controllers/tmiController");
const TmiControllerDocs = require("../docs/TmiControllerDocs");

// TMI 프로젝트 목록 조회
TmiControllerDocs.getAllTmiProjects();
router.get("/", tmiController.getAllTmiProjects);

// TMI 프로젝트 상세 조회
TmiControllerDocs.getTmiProjectById();
router.get("/:projectId", tmiController.getTmiProjectById);

// TMI 프로젝트 신청
TmiControllerDocs.applyToTmiProject();
router.post("/:projectId/apply", tmiController.applyToTmiProject);

// TMI 프로젝트 좋아요 토글
TmiControllerDocs.toggleTmiProjectLike();
router.post("/:projectId/like", tmiController.toggleTmiProjectLike);

// TMI 프로젝트 QnA 작성
TmiControllerDocs.createQnA();
router.post("/:projectId/qna", tmiController.createQnA);

// TMI 프로젝트 QnA 수정
TmiControllerDocs.updateQnA();
router.put("/:projectId/qna/:qnaId", tmiController.updateQnA);

// TMI 프로젝트 QnA 답변 작성
TmiControllerDocs.createQnAAnswer();
router.post("/qna/:qnaId/answer", tmiController.createQnAAnswer);

// TMI 프로젝트 QnA 좋아요 토글
TmiControllerDocs.toggleQnALike();
router.post("/qna/:qnaId/like", tmiController.toggleQnALike);

// TMI 프로젝트 QnA 삭제
TmiControllerDocs.deleteQnA();
router.delete("/qna/:qnaId", tmiController.deleteQnA);

module.exports = router;
