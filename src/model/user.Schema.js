const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const userSchema = mongoose.Schema({
  deviceId: {
    type: String,
  },
  deviceType: {
    type: String,
  },
  gameId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
  }],
});

userSchema.plugin(timestamps);
module.exports = mongoose.model("User", userSchema);
