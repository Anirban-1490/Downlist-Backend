module.exports.delay = (delayTime) => {
    return new Promise((resolve) => setTimeout(resolve, delayTime));
};
