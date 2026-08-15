const aiService = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
  const { code, language = "javascript" } = req.body;

  if (!code) {
    return res.status(400).send("Prompt is required");
  }

  const response = await aiService(code, language);

  res.send(response);
};