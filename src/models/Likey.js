import mongoose from "mongoose";

const LikeySchema = new mongoose.Schema({
  isFavorite: {
      type: String,
      required: "Like or not expression required."
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  video: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

const model = mongoose.model("Likey", LikeySchema);

export default model;