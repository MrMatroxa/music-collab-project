const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    createdSounds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Sound",
      },
    ],
    favoriteSounds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Sound",
      },
    ],
    createdProjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    favoriteProjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    enrolledProjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    avatar: String,
    googleId: String,
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
