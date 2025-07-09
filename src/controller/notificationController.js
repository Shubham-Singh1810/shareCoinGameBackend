const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Notification = require("../model/notification.Schema");
const User = require("../model/user.Schema");
const notificationController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const { sendNotification } = require("../utils/sendNotification");


notificationController.post("/create", async (req, res) => {
  try {
    const { title, subTitle, gameIds } = req.body;

    if (!title || !subTitle || !Array.isArray(gameIds) || gameIds.length === 0) {
      return sendResponse(res, 400, "Failed", {
        message: "title, subTitle, and gameIds (array) are required",
        statusCode: 400
      });
    }


    // Fetch users and populate game details
    const users = await User.find({ gameId: { $in: gameIds } }).populate("gameId");

    // Send notifications in parallel using Promise.all
    await Promise.all(users.map((user) => {
      return sendNotification({
        title,
        subTitle,
        icon: user.gameId?.image || ""  ,
        fcmToken: user.deviceId  ,
        gameId:user.gameId._id
      });
    }));

    sendResponse(res, 200, "Success", {
      message: "Notification sent to all relevant users",
      usersNotified: users.length,
      statusCode: 200
    });

  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500
    });
  }
});


notificationController.post("/list", async (req, res) => {
  try {
    const {
      gameIds = []
    } = req.body;

    const query = {};

    if (Array.isArray(gameIds) && gameIds.length > 0) {
      query.gameId = { $in: gameIds };
    }

    const notificationList = await Notification.find(query)
      .sort({ createdAt: -1 }) 
     

    const totalCount = await Notification.countDocuments(query);

    sendResponse(res, 200, "Success", {
      message: "Notification list retrieved successfully!",
      data: notificationList,
      documentCount: {
        totalCount
      },
      statusCode: 200
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500
    });
  }
});


module.exports = notificationController;