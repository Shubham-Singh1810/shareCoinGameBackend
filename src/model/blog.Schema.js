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
  },
  metaKeyword: {
    type: String,
  },
  metaDescription: {
    type: String,
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
    type:String,
    required: true,
  }
});

blogSchema.plugin(timestamps);
module.exports = mongoose.model("Blog", blogSchema);