const userModel = require("../Model/user");
const { CustomError } = require("../middleware/Error");

const updateProfile = async (req, res, next) => {
    const { userID } = req.params;
    var data = req.body;

    if (req.file) {
        const url = `${
            req.headers["x-forwarded-proto"] || "http"
        }://${req.header("Host")}`;
        const imageFilePath = url + "/public/" + req.file?.filename;

        data = { ...data, imageFilePath };
        console.log(data);
    }

    try {
        const userDetails = await userModel.findById(userID);
        const { bio, status } = userDetails.updateProfile(data);
        res.status(200).json({
            message: "Profile updated successfully",
            user: { bio, status },
        });
    } catch (error) {
        next(error);
    }
};
const viewProfile = async (req, res, next) => {
    const { userID } = req.params;

    try {
        const userDetails = await userModel.findById(userID);

        let {
            bio,
            name,
            status,
            activity,
            image,
            view,
            followers,
            following,
            likedComments,
            dislikeComments,
            pinnedItems,
        } = userDetails;
        activity = activity
            .sort((a, b) => new Date(b.doneAt) - new Date(a.doneAt))
            .slice(0, 24);

        res.status(200).json({
            user: {
                bio,
                status,
                name,
                activity,
                image,
                view,
                followers,
                following,
                likedComments,
                dislikeComments,
                pinnedItems,
            },
        });
    } catch (error) {
        next(error);
    }
};

const activity = async (req, res, next) => {
    const { userID } = req.params;
    try {
        const userDetails = await userModel.findById(userID);

        const activityResult = userDetails.addActivity(req.body);

        res.status(200).json(activityResult);
    } catch (error) {
        next(error);
    }
};

const pinItem = async (req, res, next) => {
    const { userID } = req.params;
    const { items: pinnedItems } = req.body;

    try {
        if (pinnedItems.length > 5) {
            throw new CustomError(
                "Maximum 5 items can be pinned",
                "PinnedItemLimitError"
            );
        }
        const userDetails = await userModel.findById(userID);
        userDetails.pinItems(pinnedItems);
        return res.status(200).json({ message: "Successfully pinned items" });
    } catch (error) {
        next(error);
    }
};

module.exports = { updateProfile, viewProfile, activity, pinItem };
