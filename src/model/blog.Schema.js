const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const blogSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  seoTitle: {
    type: String,
    required: true,
  },
  metaKeyword: {
    type: String,
    required: true,
  },
  metaDescription: {
    type: String,
    required: true,
  },
  tags: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  gameId:{
    type:String
  }
});

blogSchema.plugin(timestamps);
module.exports = mongoose.model("Blog", blogSchema);