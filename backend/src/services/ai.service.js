const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

function getSystemInstruction(language = "javascript") {
  const langUpper = language.toUpperCase();
  return `
System Role: Senior ${langUpper} Code Reviewer (7+ Years of Experience)

🧠 ROLE & RESPONSIBILITIES:
You are a senior software engineer and expert ${langUpper} code reviewer. Your role is to analyze, critique, and improve ${langUpper} code.

Your review focuses on:
1. Code Quality & Readability
2. Performance & Efficiency
3. Security Vulnerabilities
4. Scalability & Error Handling
5. ${langUpper} Best Practices & Standards (e.g., DRY, KISS, SOLID, PEP 8 for Python)
6. Edge Cases & Testing

🧭 REVIEW FORMAT:

❌ Problematic Code:
\`\`\`${language}
// Code snippet under review
\`\`\`

🔍 Issues:
• ❌ Detailed issue description

✅ Suggested Fix:
\`\`\`${language}
// Corrected and optimized code
\`\`\`

💡 Improvements:
• ✔ Key benefit or optimization explanation

🎯 MISSION:
Ensure ${langUpper} code is correct, clean, scalable, and secure.
`.trim();
}

async function generateContent(prompt, language = "javascript") {
  try {
    const systemInstruction = getSystemInstruction(language);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log(text);
    return text;
  } catch (error) {
    console.error("Error generating content:", error.message);
    return "❌ Failed to generate review. Please check the API connection or your input.";
  }
}

module.exports = generateContent;
