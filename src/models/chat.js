import mongoose from "mongoose";

const Schema = mongoose.Schema;

const chatSchema = new Schema({
  chatHistory: {
    type: Schema.Types.ObjectId,
    ref: "ChatHistory",
  },
  messages: [
    {
      sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      message: {
        type: Object,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export default mongoose.model("Chat", chatSchema);
