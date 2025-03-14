const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const soundSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    bpm: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
    },
    description: {
      type: String,
    },
    soundURL: {
      type: String,
    },
    projectId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    // Add this new field:
    isMasterSound: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Sound = mongoose.model("Sound", soundSchema);

module.exports = Sound;