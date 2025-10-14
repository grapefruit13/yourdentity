const faqService = require("../services/faqService");

exports.getFaqList = async (req, res, next) => {
  try {
    const {category, pageSize, startCursor} = req.query;
    const data = await faqService.queryFaqList({category, pageSize, startCursor});
    return res.success(data);
  } catch (error) {
    return next(error);
  }
};

exports.getFaqPageBlocks = async (req, res, next) => {
  try {
    const {pageId} = req.params;
    if (!pageId) {
      return res.error(400, "페이지 ID가 필요합니다");
    }
    const {pageSize, startCursor} = req.query;
    const data = await faqService.getPageBlocks({pageId, pageSize, startCursor});
    return res.success(data);
  } catch (error) {
    return next(error);
  }
};


