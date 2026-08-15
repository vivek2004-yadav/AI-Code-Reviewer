import { useState, useEffect } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import "./App.css";

const defaultTemplates = {
  javascript: `function sum(a, b) {\n  return a + b;\n}`,
  python: `def sum(a, b):\n    return a + b`,
  java: `public class Main {\n    public static int sum(int a, int b) {\n        return a + b;\n    }\n}`,
  cpp: `#include <iostream>\n\nint sum(int a, int b) {\n    return a + b;\n}`,
  c: `#include <stdio.h>\n\nint sum(int a, int b) {\n    return a + b;\n}`,
  markup: `<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>`,
};

function App() {
  const [code, setCode] = useState(defaultTemplates.javascript);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    prism.highlightAll();
  }, [code, language]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (defaultTemplates[newLang]) {
      setCode(defaultTemplates[newLang]);
    }
  };

  async function reviewCode() {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5001/ai/get-review", {
        code,
        language,
      });
      setReview(response.data);
    } catch (error) {
      console.error(error);
      setReview("⚠️ Failed to fetch review. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      alert("Code copied to clipboard!");
    } catch (err) {
      alert("Failed to copy code");
    }
  };

  const handleDownload = () => {
    const extensionMap = {
      javascript: "js",
      python: "py",
      markup: "html",
      c: "c",
      cpp: "cpp",
      java: "java",
    };
    const fileExtension = extensionMap[language] || "txt";

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `code.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const themeStyles =
    theme === "dark"
      ? {
          backgroundColor: "#1a1a1a",
          color: "#f5f5f5",
        }
      : {
          backgroundColor: "#ffffff",
          color: "#1a1a1a",
        };

  return (
    <main className={theme === "dark" ? "dark" : "light"}>
      <div className="left">
        <h2 className="title">Code Editor</h2>
        <div style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="markup">HTML / Markup</option>
          </select>

          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            Toggle {theme === "dark" ? "Light" : "Dark"} Mode
          </button>
        </div>

        <div className="code" style={themeStyles}>
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={(code) => {
              const grammar = prism.languages[language] || prism.languages.javascript;
              return prism.highlight(code, grammar, language);
            }}
            padding={16}
            style={{
              fontFamily: "Fira Code, monospace",
              fontSize: 14,
              minHeight: "300px",
              width: "100%",
              overflowY: "auto",
              outline: "none",
              whiteSpace: "pre-wrap",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button onClick={reviewCode} className="review" disabled={loading}>
            {loading ? "Reviewing..." : "Review Code"}
          </button>
          <button onClick={handleCopy}>Copy</button>
          <button onClick={handleDownload}>Download</button>
        </div>
      </div>

      <div className="right">
        <h2 className="title">AI Code Review</h2>
        <Markdown
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 style={{ fontSize: "1.8rem", margin: "1rem 0" }} {...props} />
            ),
            p: ({ node, ...props }) => (
              <p style={{ margin: "0.5rem 0" }} {...props} />
            ),
            li: ({ node, ...props }) => (
              <li
                style={{ marginLeft: "1.2rem", listStyleType: "disc" }}
                {...props}
              />
            ),
          }}
        >
          {review ||
            "💡 Select a language, write code, and click 'Review Code' to see suggestions."}
        </Markdown>
      </div>
    </main>
  );
}

export default App;
