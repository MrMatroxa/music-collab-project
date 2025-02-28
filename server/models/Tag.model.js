const { Schema, model } = require("mongoose");

const tagSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  sound: [{ type: Schema.Types.ObjectId, ref: "Sound", default: [] }],
});

const Tag = model("Tag", tagSchema);

module.exports = Tag;
