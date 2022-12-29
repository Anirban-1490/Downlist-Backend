const { duplicateError } = require("./Error");
const validationError = require("./validationError");

const errorHandler = (err, req, res, next) => {
    //? if error is an duplication error
    if (err.name === "MongoServerError" && err.code === 11000) {
        return duplicateError(err, res);
    }
    //? if error is an validation error
    if (err.name === "ValidationError") {
        return validationError(err, res);
    }

    if (err.name === "PinnedItemLimitError") {
        return res.status(400).json({ message: err.message });
    }
    //? for other unknown errors
    else {
        return res.status(500).send("an unknown error occurred");
    }
};

module.exports = errorHandler;
