const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");

// 스토어 상품 목록 조회
router.get("/products", storeController.getProducts);

// 스토어 상품 상세 조회 (조회수 자동 증가)
router.get("/products/:productId", storeController.getProductById);

// 상품 구매 신청
router.post("/purchase", storeController.purchaseProduct);

// 상품 좋아요 토글
router.post("/products/:productId/like", storeController.toggleProductLike);

// 상품 QnA 질문 작성
router.post("/products/:productId/qna", storeController.createProductQnA);

// 상품 QnA 질문 수정
router.put("/products/:productId/qna/:qnaId", storeController.updateProductQnA);

// 상품 QnA 답변 작성
router.post("/qna/:qnaId/answer", storeController.createProductQnAAnswer);

// 상품 QnA 좋아요 토글
router.post("/qna/:qnaId/like", storeController.toggleProductQnALike);

// 상품 QnA 삭제
router.delete("/qna/:qnaId", storeController.deleteProductQnA);

module.exports = router;
