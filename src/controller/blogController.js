const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const blogController = express.Router();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Blog = require("../model/blog.Schema")


blogController.post("/create", upload.single("image"), async (req, res) => {
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
    const blogCreated = await Blog.create(obj);
    
    sendResponse(res, 200, "Success", {
      message: "Blog created successfully!",
      data: blogCreated,
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

blogController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      status,
      gameId,
      pageNo = 1,
      pageCount = 10,
      sortByField,
      sortByOrder
    } = req.body;
    const query = {};
    if (status) query.status = status;
    if (gameId) query.gameId = gameId;
    if (searchKey) query.title = { $regex: searchKey, $options: "i" };
    const sortField = sortByField || "createdAt";
    const sortOrder = sortByOrder === "asc" ? 1 : -1;
    const sortOption = { [sortField]: sortOrder };
    const blogList = await Blog.find(query)
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo - 1) * parseInt(pageCount));
    const totalCount = await Blog.countDocuments({});
    const activeCount = await Blog.countDocuments({ status: true });
    sendResponse(res, 200, "Success", {
      message: "Blog list retrieved successfully!",
      data: blogList,
      documentCount: { totalCount, activeCount, inactiveCount: totalCount - activeCount },
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

blogController.put("/update", upload.single("image"), async (req, res) => {
  try {
    const id = req.body.id;
    const blog = await Blog.findById(id);
    if (!blog) {
      return sendResponse(res, 404, "Failed", {
        message: "Blog not found",
        statusCode: 404
      });
    }
    let updatedData = { ...req.body };
    if (req.file) {
      // Delete the old image from Cloudinary
      if (blog.image) {
        const publicId = blog.image.split("/").pop().split(".")[0];
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
    const updatedBlog = await Blog.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
    });
    sendResponse(res, 200, "Success", {
      message: "Blog updated successfully!",
      data: updatedBlog,
      statusCode: 200
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500
    });
  }
});

blogController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) {
      return sendResponse(res, 404, "Failed", {
        message: "Blog not found",
        statusCode:"404"
      });
    }
    const imageUrl = blog.image;
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
    await Blog.findByIdAndDelete(id);
    sendResponse(res, 200, "Success", {
      message: "Blog and associated image deleted successfully!",
      statusCode:"200"
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode:"500"
    });
  }
});


blogController.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params
    const blogDetails = await Blog.findOne({ _id: id });
    sendResponse(res, 200, "Success", {
      message: "Blog details retrived successfully!",
      data: blogDetails,
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


module.exports = blogController;