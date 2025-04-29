import mongoose from "mongoose";

const messageRequestSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "blocked"],
      default: "pending"
    },
  },
  { timestamps: true }
);

const MessageRequest = mongoose.model("MessageRequest", messageRequestSchema);
export default MessageRequest;
