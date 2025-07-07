const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const supportController = express.Router();
const Support = require("../model/support.Schema");
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");


supportController.post("/create", async (req, res) => {
    try {
      const supportCreated = await Support.create(req.body);
      sendResponse(res, 200, "Success", {
        message: "Support created successfully!",
        data: supportCreated,
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

supportController.post("/list", async (req, res) => {
  try {
    const {
      pageNo = 1,
      pageCount = 100,
    } = req.body;
    const query = {};
    const supportList = await Support.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo - 1) * parseInt(pageCount));
   
    sendResponse(res, 200, "Success", {
      message: "Support list retrieved successfully!",
      data: supportList,
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

supportController.put("/update", async (req, res) => {
  try {
    const id = req.body._id;
    const support = await Support.findById(id);
    if (!support) {
      return sendResponse(res, 404, "Failed", {
        message: "Support not found",
        statusCode: 403,
      });
    }
    const updatedSupport = await Support.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true, // Return the updated document
      }
    );
    sendResponse(res, 200, "Success", {
      data: updatedSupport,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});

supportController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const support = await Support.findById(id);
    if (!support) {
      return sendResponse(res, 404, "Failed", {
        message: "Support not found",
        statusCode: 404,
      });
    }
    await Support.findByIdAndDelete(id);
    sendResponse(res, 200, "Success", {
      message: "Support deleted successfully!",
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

module.exports = supportController;