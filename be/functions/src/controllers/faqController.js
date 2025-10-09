const faqService = require("../services/faqService");

exports.getFaqList = async (req, res, next) => {
  try {
    const {category, pageSize, startCursor} = req.query;
    const data = await faqService.queryFaqList({category, pageSize, startCursor});
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

exports.getFaqPageBlocks = async (req, res, next) => {
  try {
    const {pageId} = req.params;
    const {pageSize, startCursor} = req.query;
    const data = await faqService.getPageBlocks({pageId, pageSize, startCursor});
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};


