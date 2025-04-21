import express from "express";
import {
  askQuestion,
  getQuestionsByTag,
  answerQuestion,
  getAllQuestions
} from "../controllers/community.controller.js";
// import protectRoute from "../middleware/protectRoute.js";
import { protectRoute } from "../middleware/protectRoute.js"; 
// import { answerQuestion } from "../controllers/community.controller.js";
const router = express.Router();
router.post("/answer/:id", protectRoute, answerQuestion);

router.post("/ask", protectRoute, askQuestion);
router.get("/search", protectRoute, getQuestionsByTag);
router.get("/", protectRoute, getAllQuestions);
router.post("/answer/:id", protectRoute, answerQuestion);
router.get("/all", getAllQuestions);
export default router;
