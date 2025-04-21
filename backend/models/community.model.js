import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  question: { type: String, required: true },
  tags: [{ type: String }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answers: [
    {
      text: { type: String, required: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });


const Community = mongoose.model("Community", communitySchema);
export default Community;
