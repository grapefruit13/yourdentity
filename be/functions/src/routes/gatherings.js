const express = require("express");
const router = express.Router();
const gatheringController = require("../controllers/gatheringController");
const GatheringControllerDocs = require("../docs/GatheringControllerDocs");

// 소모임 목록 조회
GatheringControllerDocs.getGatherings();
router.get("/", gatheringController.getAllGatherings);

// 소모임 상세 조회
GatheringControllerDocs.getGatheringById();
router.get("/:gatheringId", gatheringController.getGatheringById);

// 소모임 신청
GatheringControllerDocs.applyToGathering();
router.post("/:gatheringId/apply", gatheringController.applyToGathering);

// 소모임 좋아요 토글
GatheringControllerDocs.toggleGatheringLike();
router.post("/:gatheringId/like", gatheringController.toggleGatheringLike);

// 소모임 QnA 작성
GatheringControllerDocs.createQnA();
router.post("/:gatheringId/qna", gatheringController.createQnA);

// 소모임 QnA 수정
GatheringControllerDocs.updateQnA();
router.put("/:gatheringId/qna/:qnaId", gatheringController.updateQnA);

// 소모임 QnA 답변 작성
GatheringControllerDocs.createQnAAnswer();
router.post("/qna/:qnaId/answer", gatheringController.createQnAAnswer);

// 소모임 QnA 좋아요 토글
GatheringControllerDocs.toggleQnALike();
router.post("/qna/:qnaId/like", gatheringController.toggleQnALike);

// 소모임 QnA 삭제
GatheringControllerDocs.deleteQnA();
router.delete("/qna/:qnaId", gatheringController.deleteQnA);

module.exports = router;
