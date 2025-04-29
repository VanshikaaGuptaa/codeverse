import mongoose from "mongoose";

const chatRequestSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  approved: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false }
});

export default mongoose.model("ChatRequest", chatRequestSchema);
