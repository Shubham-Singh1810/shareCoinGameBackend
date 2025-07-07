const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Game = require("../model/game.Schema");
const gameController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

gameController.post("/create", upload.single("image"), async (req, res) => {
  try {
    let obj;
    if (req.file) {
      let image = await cloudinary.uploader.upload(req.file.path, function (err, result) {
        if (err) {
          return err;
        } else {
          return result;
        }
      });
      obj = { ...req.body, image: image.url };
    }
    const gameCreated = await Game.create(obj);
    sendResponse(res, 200, "Success", {
      message: "Game created successfully!",
      data: gameCreated,
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

gameController.post("/list", async (req, res) => {
    try {
      const {
        pageNo = 1,
        pageCount = 10
      } = req.body;
  
      const gameList = await Game.find()
        .limit(parseInt(pageCount))
        .skip((parseInt(pageNo) - 1) * parseInt(pageCount));
  
      const totalCount = await Game.countDocuments();
  
      sendResponse(res, 200, "Success", {
        message: "Game list retrieved successfully!",
        data: gameList,
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
  
gameController.put("/update", upload.single("image"), async (req, res) => {
  try {
    const id = req.body._id;
    const game = await Game.findById(id);
    if (!game) {
      return sendResponse(res, 404, "Failed", {
        message: "Game not found",
        statusCode: 403
      });
    }
    let updatedData = { ...req.body };
    if (req.file) {
      // Delete the old image from Cloudinary
      if (game.image) {
        const publicId = game.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            console.error("Error deleting old image from Cloudinary:", error);
          } else {
            console.log("Old image deleted from Cloudinary:", result);
          }
        });
      }
      const image = await cloudinary.uploader.upload(req.file.path);
      updatedData.image = image.url;
    }
    const updatedGame = await Game.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
    });
    sendResponse(res, 200, "Success", {
      message: "Game updated successfully!",
      data: updatedGame,
      statusCode: 200
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500
    });
  }
});

gameController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);
    if (!game) {
      return sendResponse(res, 404, "Failed", {
        message: "Game not found",
      });
    }
    const imageUrl = game.image;
    if (imageUrl) {
      const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public ID
      // Delete the image from Cloudinary
      await cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Error deleting image from Cloudinary:", error);
        } else {
          console.log("Cloudinary image deletion result:", result);
        }
      });
    }
    await Game.findByIdAndDelete(id);
    sendResponse(res, 200, "Success", {
      message: "Game image deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

gameController.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params
    const gameDetails = await Game.findOne({ _id: id });
    sendResponse(res, 200, "Success", {
      message: "Game retrived successfully!",
      data: { gameDetails },
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


module.exports = gameController;