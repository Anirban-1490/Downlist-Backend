const commnetModel = require("../Model/comment");
const userModel = require("../Model/user");
const crypto = require("crypto");
const { CustomError } = require("../middleware/Error");

const addComment = async (req, res, next) => {
    const { malid } = req.params;
    const { userID } = req.query;
    const { comment } = req.body;
    let commentDoc;
    try {
        //* check if there is a entry for this MalID already exist in the DB
        const commentForObject = await commnetModel.findOne({ malid });
        if (!userID) {
            throw new CustomError("Invalid user id", "InvalidUserID");
        }
        const { name: userName, image: userProfileImg } =
            await userModel.findById(userID);

        //* if dosen't exist then create a new document

        if (!commentForObject) {
            commentDoc = await commnetModel.create({
                malid,
                maincomments: 1,
                subcomments: 0,
                comments: [
                    {
                        body: comment,
                        userID,
                        userProfileImg,
                        userName,
                        date: new Date(),
                        commentID: crypto.randomBytes(7).toString("hex"),
                    },
                ],
            });
        } else {
            //* else add the comment in the existing document
            commentDoc = commentForObject.addComment(
                comment,
                userID,
                userName,
                userProfileImg
            );
        }

        res.status(200).json({
            messgae: "comment added successfully",
            data: {
                comments: commentDoc.comments,
                mainCommentCount: commentDoc.maincomments,
                subCommentsCount: commentDoc.subcomments,
            },
        });
    } catch (error) {
        next(error);
    }
};

const fetchComment = async (req, res) => {
    const { malid } = req.params;

    const commentDoc = await commnetModel.findOne({ malid });
    if (!commentDoc)
        return res.status(200).json({
            comments: [],
            mainCommentCount: 0,
            subCommentsCount: 0,
        });

    return res.status(200).json({
        comments: commentDoc.comments,
        mainCommentCount: commentDoc.maincomments,
        subCommentsCount: commentDoc.subcomments,
    });
};

const likeCommentHandler = async (req, res, next) => {
    const { userID, _id, malID } = req.body;
    try {
        const user = await userModel.findById(userID);

        const commentForObject = await commnetModel.findOne({ malid: malID });

        const isCommentHaveLike = user.likedComments.find(
            (comment) => comment.commentId == _id
        );

        const isCommentHaveDislike = user.dislikeComments.find(
            (comment) => comment.commentId == _id
        );

        if (!isCommentHaveLike && !isCommentHaveDislike) {
            user.addLikedComment(_id, malID);
            commentForObject.addLikeOrDislike(_id, true);
        } else if (isCommentHaveDislike) {
            user.removeComment(_id, false); //* remove comment from dislike comments array
            commentForObject.addLikeOrDislike(_id, false, "dislikeCount"); //* remove the dislike

            user.addLikedComment(_id, malID); //* add to liked comments array
            commentForObject.addLikeOrDislike(_id, true); //* increase like counter
        } else if (isCommentHaveLike) {
            user.removeComment(_id, true);
            commentForObject.addLikeOrDislike(_id, false);
        }
        await user.save();
        await commentForObject.save();
        res.status(200).json({
            message: "success",
            userLikedComment: user.likedComments,
            userDislikedComment: user.dislikeComments,
        });
    } catch (error) {
        //* pass error to error hnadling middleware
        next(error);
    }
};
const dislikeCommentHandler = async (req, res, next) => {
    const { userID, _id, malID } = req.body;
    try {
        const user = await userModel.findOne({ _id: userID });
        const commentForObject = await commnetModel.findOne({ malid: malID });

        const isCommentHaveLike = user.likedComments.find(
            (comment) => comment.commentId == _id
        );

        const isCommentHaveDislike = user.dislikeComments.find(
            (comment) => comment.commentId == _id
        );

        if (!isCommentHaveLike && !isCommentHaveDislike) {
            user.addDislikedComment(_id, malID);
            commentForObject.addLikeOrDislike(_id, true, "dislikeCount");
        } else if (isCommentHaveLike) {
            user.removeComment(_id, true); //* remove comment from like comments array

            commentForObject.addLikeOrDislike(_id, false, "likeCount"); //* remove the like

            user.addDislikedComment(_id, malID); //* add to disliked comments array

            commentForObject.addLikeOrDislike(_id, true, "dislikeCount"); //* increase dislike counter
        } else if (isCommentHaveDislike) {
            user.removeComment(_id, false);
            commentForObject.addLikeOrDislike(_id, false, "dislikeCount");
        }

        await user.save();
        await commentForObject.save();

        res.status(200).json({
            message: "success",
            userDislikedComment: user.dislikeComments,
            userLikedComment: user.likedComments,
        });
    } catch (error) {
        //* pass error to error hnadling middleware
        next(error);
    }
};

module.exports = {
    addComment,
    fetchComment,
    likeCommentHandler,
    dislikeCommentHandler,
};
