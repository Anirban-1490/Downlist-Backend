const router = require("express").Router({ mergeParams: true });

const {
    addAnimeHandler,
    addCharHandler,
    getSavedAnime,
    removeSavedAnime,
    getSavedCharacter,
    removeSavedCharacter,
    removeAll,
    getSavedTopAnime,
    getSavedTopCharacters,
} = require("../controller/list");

//*route to add anime to DB
router.post("/list/anime", addAnimeHandler);
//*route to fetch all the saved anime
router.get("/list/anime", getSavedAnime);
router.get("/list/anime/top", getSavedTopAnime);
router.delete("/list/anime/:malID", removeSavedAnime);

//*route to add char to DB
router.post("/list/character", addCharHandler);
//*route to fetch all the saved characters
router.get("/list/character", getSavedCharacter);
router.get("/list/character/top", getSavedTopCharacters);
router.delete("/list/character/:malID", removeSavedCharacter);

router.delete("/list/all/:switch_path", removeAll);

module.exports = router;
