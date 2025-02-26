const projectSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    soundId: [{ type: Schema.Types.ObjectId, ref: 'Sound' }]
  });