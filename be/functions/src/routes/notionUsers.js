const express = require("express");
const notionUserController = require("../controllers/notionUserController");
const router = express.Router();


// 활동회원 동기화 라우트
router.get("/sync/active", notionUserController.syncUserAccounts);


module.exports = router;
