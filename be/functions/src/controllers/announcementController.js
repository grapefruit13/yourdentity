const announcementService = require("../services/announcementService");

exports.syncAnnouncement = async (req, res, next) => {
  try {
    const {pageId} = req.params;
    if (!pageId) {
      return res.error(400, "페이지 ID가 필요합니다");
    }
    const result = await announcementService.synchronizeAnnouncement(pageId);
    return res.success(result);
  } catch (error) {
    return next(error);
  }
};

exports.softDeleteAnnouncement = async (req, res, next) => {
  try {
    const {pageId} = req.params;
    if (!pageId) {
      return res.error(400, "페이지 ID가 필요합니다");
    }
    const updated = await announcementService.markAsDeleted(pageId);
    return res.success(updated);
  } catch (error) {
    return next(error);
  }
};

exports.getAnnouncementList = async (req, res, next) => {
  try {
    const {limit = 20, cursor} = req.query;
    const result = await announcementService.getAnnouncementList(parseInt(limit), cursor);
    return res.status(200).json({
      status: 200,
      data: result.data,
      pagination: {
        hasMore: result.hasMore,
        cursor: result.cursor,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.getAnnouncementDetail = async (req, res, next) => {
  try {
    const {pageId} = req.params;
    if (!pageId) {
      return res.error(400, "페이지 ID가 필요합니다");
    }
    const announcement = await announcementService.getAnnouncementDetail(pageId);
    return res.success(announcement);
  } catch (error) {
    return next(error);
  }
};


