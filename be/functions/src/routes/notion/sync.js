const express = require("express");
const announcementController = require("../../controllers/announcementController");

const router = express.Router();

// Notion 동기화용 (내부용)
router.get("/announcements/sync/:pageId", announcementController.syncAnnouncement);
router.get("/announcements/delete/:pageId", announcementController.softDeleteAnnouncement);

module.exports = router;
