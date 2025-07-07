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
    
    const existingUser = await User.findOne({ deviceId, gameId, deviceType });

    if (existingUser) {
      return sendResponse(res, 409, "Failed", {
        message: "User with this device info already exists.",
        statusCode: 409,
      });
    }

    const userCreated = await User.create(req.body);

    sendResponse(res, 200, "Success", {
      message: "User created successfully!",
      data: userCreated,
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


module.exports = userController;