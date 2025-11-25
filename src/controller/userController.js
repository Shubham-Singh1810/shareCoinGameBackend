const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const userController = express.Router();
const User = require("../model/user.Schema");
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");


userController.post("/create", async (req, res) => {
  try {
    const { deviceId, gameId, deviceType } = req.body;

    if (!deviceId || !gameId || !deviceType) {
      return sendResponse(res, 400, "Failed", {
        message: "deviceId, gameId, and deviceType are required.",
        statusCode: 400,
      });
    }

    // Find user by device info
    const existingUser = await User.findOne({ deviceId, deviceType });

    // If user already exists
    if (existingUser) {
      
      // Check if game already exists in the array
      const alreadyAdded = existingUser.gameId.includes(gameId);

      if (alreadyAdded) {
        return sendResponse(res, 200, "Success", {
          message: "Game already added to this user.",
          data: existingUser,
          statusCode: 200,
        });
      }

      // Push new gameId into array
      existingUser.gameId.push(gameId);
      await existingUser.save();

      return sendResponse(res, 200, "Success", {
        message: "Game added to user successfully.",
        data: existingUser,
        statusCode: 200,
      });
    }

    // If no user found → create new user
    const userCreated = await User.create({
      deviceId,
      deviceType,
      gameId: [gameId],
    });

    return sendResponse(res, 200, "Success", {
      message: "User created successfully!",
      data: userCreated,
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




module.exports = userController;