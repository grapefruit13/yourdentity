const express = require("express");
const router = express.Router();
const routineController = require("../controllers/routineController");
const RoutineControllerDocs = require("../docs/RoutineControllerDocs");

// 루틴 목록 조회
RoutineControllerDocs.getAllRoutines();
router.get("/", routineController.getAllRoutines);

// 루틴 상세 조회
RoutineControllerDocs.getRoutineById();
router.get("/:routineId", routineController.getRoutineById);

// 루틴 신청
RoutineControllerDocs.applyForRoutine();
router.post("/:routineId/apply", routineController.applyForRoutine);

// 루틴 좋아요 토글
RoutineControllerDocs.toggleRoutineLike();
router.post("/:routineId/like", routineController.toggleRoutineLike);

// 루틴 QnA 작성
RoutineControllerDocs.createQnA();
router.post("/:routineId/qna", routineController.createQnA);

// 루틴 QnA 수정
RoutineControllerDocs.updateQnA();
router.put("/:routineId/qna/:qnaId", routineController.updateQnA);

// 루틴 QnA 답변 작성
RoutineControllerDocs.createQnAAnswer();
router.post("/qna/:qnaId/answer", routineController.createQnAAnswer);

// 루틴 QnA 좋아요 토글
RoutineControllerDocs.toggleQnALike();
router.post("/qna/:qnaId/like", routineController.toggleQnALike);

// 루틴 QnA 삭제
RoutineControllerDocs.deleteQnA();
router.delete("/qna/:qnaId", routineController.deleteQnA);

module.exports = router;
