class CustomError extends Error {
    constructor(messages, name) {
        super(messages);
        this.name = name;
    }
}

const duplicateError = (err, res) => {
    return res.status(409).send({
        message: "An account with that email already exists",
        name: "DuplicateEmail",
    });
};

module.exports = { duplicateError, CustomError };
