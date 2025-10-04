const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.code === "PERMISSION_DENIED") {
    return res.status(403).json({
      success: false,
      error: "Permission denied",
    });
  }

  if (err.code === "NOT_FOUND") {
    return res.status(404).json({
      success: false,
      error: "Resource not found",
    });
  }

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
};

module.exports = errorHandler;
