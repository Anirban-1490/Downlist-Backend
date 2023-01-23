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
    if (err.name === "EmptyUsername") {
        return res.status(400).json({
            message: err.message,
            name: "EmptyUsername",
        });
    }
    if (err.name === "EmptyEmail") {
        return res.status(400).json({
            message: err.message,
            name: "EmptyEmail",
        });
    }
    if (err.name === "EmptyPassword") {
        return res.status(400).json({
            message: err.message,
            name: "EmptyPassword",
        });
    }
    if (err.name === "NoAccount") {
        return res.status(400).json({
            message: err.message,
            name: "NoAccount",
        });
    }
    //? for other unknown errors
    else {
        return res.status(500).send({ message: "an unknown error occurred" });
    }
};

module.exports = errorHandler;
