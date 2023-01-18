const validationError = (err, res) => {
    const validationError = Object.values(err.errors)[0];
    return res.status(400).json({
        message: validationError.message,
        name: "ValidationError" + validationError.path,
    });
};

module.exports = validationError;
