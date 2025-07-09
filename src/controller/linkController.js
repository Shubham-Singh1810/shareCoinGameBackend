const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const linkController = express.Router();
const Link = require("../model/link.Schema");
const Game = require("../model/game.Schema");
const User = require("../model/user.Schema");
const { sendNotification } = require("../utils/sendNotification"); 
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");


linkController.post("/create", async (req, res) => {
  try {
    const linkCreated = await Link.create(req.body);
    
    const { title,  gameId } = req.body;

    if (title && gameId) {
      const users = await User.find({ gameId }).populate("gameId");
      await Promise.all(users.map(async (user) => {
        await sendNotification({
          title :"A new link is created",
          subTitle : `The link is ${req?.body?.link || req?.body?.referalCode}`,
          icon: user.gameId?.image || "",
          fcmToken: user.deviceId,
          gameId: gameId
        });
      }));
    }

    sendResponse(res, 200, "Success", {
      message: "Link created successfully!",
      data: linkCreated,
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

linkController.post("/list", async (req, res) => {
  try {
    const {
      pageNo = 1,
      pageCount = 100,
      gameId,
      userId
    } = req.body;

    // Build query object
    const query = {};
    if (gameId) {
      query.gameId = gameId;
    }

    // Fetch links with pagination
    const linkList = await Link.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(pageCount))
      .skip((parseInt(pageNo) - 1) * parseInt(pageCount));

    // Map and add `alreadyUser` flag
    const linkListWithFlag = linkList.map(link => {
      const alreadyUser = userId ? link.userId.includes(userId) : false;
      return {
        ...link.toObject(),  // convert mongoose doc to plain object
        alreadyUser
      };
    });

    // Send response
    sendResponse(res, 200, "Success", {
      message: "Link list retrieved successfully!",
      data: linkListWithFlag,
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


linkController.put("/update", async (req, res) => {
  try {
    const id = req.body._id;
    const link = await Link.findById(id);
    if (!link) {
      return sendResponse(res, 404, "Failed", {
        message: "Link not found",
        statusCode: 403,
      });
    }
    const updatedLink = await Link.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true, // Return the updated document
      }
    );
    sendResponse(res, 200, "Success", {
      data: updatedLink,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});

linkController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findById(id);
    if (!link) {
      return sendResponse(res, 404, "Failed", {
        message: "Link not found",
        statusCode: 404,
      });
    }
    await Link.findByIdAndDelete(id);
    sendResponse(res, 200, "Success", {
      message: "Link deleted successfully!",
      statusCode:200
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,   
    });
  }
});

linkController.post("/trackView", async (req, res) => {
  try {
    const { linkId, deviceType, androidDeviceId, gameId, userId } = req.body;

    if (!linkId || !deviceType || !androidDeviceId || !gameId) {
      return sendResponse(res, 400, "Failed", {
        message: "linkId, deviceType, androidDeviceId, and gameId are required",
        statusCode: 400,
      });
    }

    const link = await Link.findById(linkId);
    if (!link) {
      return sendResponse(res, 404, "Failed", {
        message: "Link not found",
        statusCode: 404,
      });
    }

    // Update count based on deviceType
    if (deviceType.toLowerCase() === "android") {
      link.androidViewCount = (link.androidViewCount || 0) + 1;
    } else if (deviceType.toLowerCase() === "ios") {
      link.iosViewCount = (link.iosViewCount || 0) + 1;
    } else {
      return sendResponse(res, 400, "Failed", {
        message: "Invalid deviceType. Must be 'android' or 'ios'",
        statusCode: 400,
      });
    }
    if (userId) {
      if (!link.userId.includes(userId)) {
        link.userId.push(userId);
      }
    }
    await link.save();

    sendResponse(res, 200, "Success", {
      message: "View count updated successfully",
      data: link,
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

module.exports = linkController;