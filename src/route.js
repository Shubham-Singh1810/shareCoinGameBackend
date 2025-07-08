const express = require("express");
const router = express.Router();

const gameController = require("./controller/gameController");
const linkController = require("./controller/linkController");
const supportController = require("./controller/supportController");
const userController = require("./controller/userController");
const notificationController = require("./controller/notificationController");
const blogController = require("./controller/blogController");

router.use("/game", gameController);
router.use("/link", linkController);
router.use("/support", supportController);
router.use("/user", userController);
router.use("/notification", notificationController);
router.use("/blog", blogController);



module.exports = router;