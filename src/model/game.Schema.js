const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const gameSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    required: true,
  },
  actualImage:{
    type: String,
    required: true,
  }
});
gameSchema.plugin(timestamps);
module.exports = mongoose.model("Game", gameSchema);