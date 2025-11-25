const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Notification = require("../model/notification.Schema");
const User = require("../model/user.Schema");
const Game = require("../model/game.Schema");
const notificationController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const { sendNotification } = require("../utils/sendNotification");

notificationController.post("/create", async (req, res) => {
  try {
    const { title, subTitle, gameIds } = req.body;

    if (
      !title ||
      !subTitle ||
      !Array.isArray(gameIds) ||
      gameIds.length === 0
    ) {
      return sendResponse(res, 400, "Failed", {
        message: "title, subTitle, and gameIds (array) are required",
        statusCode: 400,
      });
    }

    // Step 1: Fetch game details and create a map of gameId -> icon
    const games = await Game.find({ _id: { $in: gameIds } });
    const gameIconMap = {};
    games.forEach((game) => {
      gameIconMap[game._id.toString()] = game.image || "";
    });

    // Step 2: Create one notification per gameId
    await Promise.all(
      gameIds.map(async (gameId) => {
        return Notification.create({
          title,
          subTitle,
          icon: gameIconMap[gameId] || "",
          gameId,
        });
      })
    );

    // Step 3: Fetch users related to the selected gameIds
    // const users = await User.find({ gameId: { $in: gameIds } }).populate("gameId");
    const users = await User.find({ gameId: { $in: [gameId] } }).populate("gameId");
    // Step 4: Remove duplicate deviceIds (fcmTokens)
    const uniqueTokensMap = new Map();
    users.forEach((user) => {
      const token = user.deviceId;
      const gameId = user.gameId?._id?.toString();
      const icon = user.gameId?.image || "";

      if (token && !uniqueTokensMap.has(token)) {
        uniqueTokensMap.set(token, { token, gameId, icon });
      }
    });

    // Step 5: Send notification to each unique deviceId
    await Promise.all(
      Array.from(uniqueTokensMap.values()).map(({ token, gameId, icon }) => {
        return sendNotification({
          title,
          subTitle,
          icon,
          fcmToken: token,
          gameId,
        });
      })
    );

    return sendResponse(res, 200, "Success", {
      message: "Notification sent to all relevant users",
      usersNotified: uniqueTokensMap.size,
      statusCode: 200,
    });

  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});


notificationController.post("/list", async (req, res) => {
  try {
    const { gameIds = [] } = req.body;

    const query = {};

    if (Array.isArray(gameIds) && gameIds.length > 0) {
      query.gameId = { $in: gameIds };
    }

    const notificationList = await Notification.find(query).sort({
      createdAt: -1,
    });

    const totalCount = await Notification.countDocuments(query);

    sendResponse(res, 200, "Success", {
      message: "Notification list retrieved successfully!",
      data: notificationList,
      documentCount: {
        totalCount,
      },
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});
notificationController.get("/delete-all-notification", async (req, res) => {
  try {
    // Sabhi notifications delete karo
    await Notification.deleteMany({});

    sendResponse(res, 200, "Success", {
      message: "All notifications deleted successfully!",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});


module.exports = notificationController;
