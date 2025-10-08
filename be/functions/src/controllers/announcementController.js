const announcementService = require("../services/announcementService");

exports.syncAnnouncement = async (req, res, next) => {
  try {
    const {pageId} = req.params;
    if (!pageId) {
      const err = new Error("페이지 ID가 필요합니다");
      err.status = 400;
      return next(err);
    }
    const result = await announcementService.synchronizeAnnouncement(pageId);
    return res.status(200).json({status: 200, data: result});
  } catch (error) {
    return next(error);
  }
};

exports.softDeleteAnnouncement = async (req, res, next) => {
  try {
    const {pageId} = req.params;
    if (!pageId) {
      const err = new Error("페이지 ID가 필요합니다");
      err.status = 400;
      return next(err);
    }
    const updated = await announcementService.markAsDeleted(pageId);
    return res.status(200).json({status: 200, data: updated});
  } catch (error) {
    return next(error);
  }
};

exports.getAnnouncementList = async (req, res, next) => {
  try {
    const announcements = await announcementService.getAnnouncementList();
    return res.status(200).json({status: 200, data: announcements});
  } catch (error) {
    return next(error);
  }
};

exports.getAnnouncementDetail = async (req, res, next) => {
  try {
    const {pageId} = req.params;
    if (!pageId) {
      const err = new Error("페이지 ID가 필요합니다");
      err.status = 400;
      return next(err);
    }
    const announcement = await announcementService.getAnnouncementDetail(pageId);
    return res.status(200).json({status: 200, data: announcement});
  } catch (error) {
    return next(error);
  }
};


