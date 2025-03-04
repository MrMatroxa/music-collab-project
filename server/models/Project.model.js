const { Schema, model } = require("mongoose");


const projectSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    soundId: [{ type: Schema.Types.ObjectId, ref: 'Sound' }],
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isPrivate: { type: Boolean, default: false },
  });

  const Project = model("Project", projectSchema);
  
  module.exports = Project;