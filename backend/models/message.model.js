import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  approved: { type: Boolean, default: false }, // ✅ must approve first
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
