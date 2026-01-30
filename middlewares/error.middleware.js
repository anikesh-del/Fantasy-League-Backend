const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};

module.exports = errorHandler;
