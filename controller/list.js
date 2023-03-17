// const { default: map } = require("awaity/map");
// const map = require("awaity/map");
const { map } = require("awaity");
const { default: axios } = require("axios");
const userList = require("../Model/user_list");

const addAnimeHandler = async (req, res) => {
    const { userID } = req.params;
    const anime = req.body;
    let userListDetails;

    userListDetails = await userList.findOne({ userid: userID });

    if (!userListDetails) {
        //* if the user dosen't have a userList databasae entry then create one

        userListDetails = await userList.create({ userid: userID });
    }
    userListDetails.addAnime(anime);

    res.status(200).json({ message: "Anime added successfully!" });
};

const getSavedAnime = async (req, res, next) => {
    const { userID } = req.params;
    const cursor = parseInt(req.query.cursor) || 0;
    const sortBy = req.query?.sortby;
    let itemLimit = parseInt(req.query.limit) || 5;

    try {
        const userListDetails = await userList.findOne({ userid: userID });
        let list = userListDetails.animeList
            .sort((a, b) => b[sortBy] - a[sortBy])
            .slice(cursor, cursor + itemLimit);
        const nextPage =
            cursor + itemLimit <= userListDetails.animeList.length
                ? cursor + itemLimit
                : null;

        res.status(200).json({
            list,
            userID: userListDetails.userid,
            nextPage,
        });
    } catch (error) {
        next(error);
    }
};

//* get top anime from the user list
const getSavedTopAnime = async (req, res, next) => {
    const { userID } = req.params;
    try {
        const { animeList } = await userList.findOne({ userid: userID });

        const savedTopAnime = [...animeList]
            .sort((anime1, anime2) => anime2.favorites - anime1.favorites)
            .slice(0, 3);
        const DetailedSavedTopAnime = await map(
            savedTopAnime,
            async ({ malid, img_url, title }) => {
                const { data } = (
                    await axios.get(
                        `https://api.jikan.moe/v4/anime/${malid}/full`
                    )
                ).data;

                return {
                    malid,
                    img_url,
                    title: title.substr(0, 30) + ".",
                    about: data.synopsis.substr(0, 60) + "...",
                    large_img_url: data.images.jpg?.large_image_url,
                };
            }
        );

        if (
            DetailedSavedTopAnime &&
            DetailedSavedTopAnime.length <= 2 &&
            DetailedSavedTopAnime.length
        ) {
            while (DetailedSavedTopAnime.length < 3) {
                DetailedSavedTopAnime.push(undefined);
            }
        }

        res.status(200).json({ data: DetailedSavedTopAnime });
    } catch (error) {
        next(error);
    }
};

const removeSavedAnime = async (req, res) => {
    const { userID, malID } = req.params;

    const userListDetails = await userList.findOne({ userid: userID });
    userListDetails.removeAnime(malID);
    res.status(200).json({ message: "Successfully removed anime!" });
};

const checkAnimeStatus = async (req, res, next) => {
    const { userID, malID } = req.params;

    try {
        const currentUserList = await userList.findById(userID);

        const anime =
            currentUserList &&
            [...currentUserList.animeList].find(
                (anime) => anime.malid === malID
            );
        if (!anime)
            return res.status(200).json({
                message: "Anime is not saved in list",
                status: "Not saved",
            });
        return res.status(200).json({
            message: "Anime is saved in list",
            anime,
            status: "Saved",
        });
    } catch (error) {
        next(error);
    }
};

// * -------------- Character list -----------

const addCharHandler = async (req, res) => {
    const { userID } = req.params;
    const character = req.body;
    let userListDetails;
    userListDetails = await userList.findOne({ userid: userID });
    if (!userListDetails) {
        userListDetails = await userList.create({ userid: userID });
    }
    // const userListDetails = await userList.findOne({ userid: userID });
    userListDetails.addCharacter(character);
    res.status(200).json({ message: "Character added successfully!" });
};

const getSavedCharacter = async (req, res, next) => {
    const { userID } = req.params;
    const cursor = parseInt(req.query.cursor) || 0;
    const sortBy = req.query?.sortby;
    let itemLimit = parseInt(req.query.limit) || 5;

    try {
        const userListDetails = await userList.findOne({ userid: userID });
        let list = userListDetails?.charList
            .sort((a, b) => b[sortBy] - a[sortBy])
            .slice(cursor, cursor + itemLimit);
        const nextPage =
            cursor + itemLimit <= userListDetails.charList.length
                ? cursor + itemLimit
                : null;

        res.status(200).json({
            list,
            userID: userListDetails.userid,
            nextPage,
        });
    } catch (error) {
        next(error);
    }
};

//* get top characters from the user list
const getSavedTopCharacters = async (req, res, next) => {
    const { userID } = req.params;
    try {
        const { charList } = await userList.findOne({ userid: userID });

        const savedTopCharacters = [...charList]
            .sort((char1, char2) => char2.favorites - char1.fafavoritesv)
            .slice(0, 3);
        const DetailedSavedTopCharacters = await map(
            savedTopCharacters,
            async ({ malid, img_url, title }) => {
                const { data } = (
                    await axios.get(
                        `https://api.jikan.moe/v4/characters/${malid}/full`
                    )
                ).data;

                return {
                    malid,
                    img_url,
                    title: title.substr(0, 30) + ".",
                    about: data.about.substr(0, 60) + "...",
                    large_img_url: data.images.jpg?.large_image_url,
                };
            }
        );

        if (
            DetailedSavedTopCharacters &&
            DetailedSavedTopCharacters.length <= 2 &&
            DetailedSavedTopCharacters.length
        ) {
            while (DetailedSavedTopCharacters.length < 3) {
                DetailedSavedTopCharacters.push(undefined);
            }
        }
        console.log(DetailedSavedTopCharacters);
        res.status(200).json({ data: DetailedSavedTopCharacters });
    } catch (error) {
        next(error);
    }
};

const removeSavedCharacter = async (req, res) => {
    const { userID, malID } = req.params;

    const userListDetails = await userList.findOne({ userid: userID });
    userListDetails.removeCharacter(malID);
    res.status(200).json({ message: "Successfully removed a character!" });
};

const removeAll = async (req, res) => {
    const { userID, switch_path } = req.params;

    const userListDetails = await userList.findOne({ userid: userID });

    userListDetails.removeAll(switch_path);

    res.status(200).json({ message: "Removed all items" });
};

const checkCharacterStatus = async (req, res, next) => {
    const { userID, malID } = req.params;
    try {
        const currentUserList = await userList.findById(userID);

        const character =
            currentUserList &&
            [...currentUserList.charList].find((char) => char.malid === malID);

        if (!character)
            return res.status(200).json({
                message: "Character is not saved in list",
                status: "Not saved",
            });
        return res.status(200).json({
            message: "Character is saved in list",
            character,
            status: "Saved",
        });
    } catch (error) {
        next(error);
    }
};
module.exports = {
    addAnimeHandler,
    addCharHandler,
    getSavedAnime,
    removeSavedAnime,
    getSavedCharacter,
    removeSavedCharacter,
    removeAll,
    getSavedTopAnime,
    getSavedTopCharacters,
    checkCharacterStatus,
    checkAnimeStatus,
};
