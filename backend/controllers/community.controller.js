import Community from "../models/community.model.js";

// ASK a question
export const askQuestion = async (req, res) => {
  try {
    const { question, tags } = req.body;

    if (!question || !tags?.length) {
      return res.status(400).json({ error: "Question and tags are required" });
    }

    const newQ = new Community({
      user: req.user._id,
      question,
      tags,
    });

    await newQ.save();

    res.status(201).json(newQ);
  } catch (error) {
    console.error("Error in askQuestion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// SEARCH questions by tag (works with ?query=react,js etc.)
export const getQuestionsByTag = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Search tag is required" });
    }

    const tags = query
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag);

    const questions = await Community.find({ tags: { $in: tags } })
      .sort({ createdAt: -1 })
      .populate("user", "username profileImg")
      .populate("answers.user", "username profileImg");

    res.status(200).json(questions);
  } catch (error) {
    console.error("Error in getQuestionsByTag:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET ALL questions
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Community.find()
      .sort({ createdAt: -1 })
      .populate("user", "username profileImg")
      .populate("answers.user", "username profileImg");

    res.status(200).json(questions);
  } catch (error) {
    console.error("Error in getAllQuestions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ANSWER a question
export const answerQuestion = async (req, res) => {
  try {
    const { id: questionId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Answer text is required" });
    }

    const question = await Community.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const newAnswer = {
      user: req.user._id,
      text,
    };

    question.answers.push(newAnswer);
    await question.save();

    res.status(200).json(question);
  } catch (error) {
    console.error("Error in answerQuestion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
