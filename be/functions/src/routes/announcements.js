const express = require("express");
const announcementController = require("../controllers/announcementController");

const router = express.Router();

// Frontend용 공개 API
router.get("/", announcementController.getAnnouncementList);
router.get("/:pageId", announcementController.getAnnouncementDetail);

module.exports = router;


