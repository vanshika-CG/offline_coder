require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/auth");
const questionRoutes = require("./routes/questions");
const submissionRoutes = require("./routes/submissions");
const notesRoutes = require("./routes/notes");
const revisionRoutes = require("./routes/revisions");
const adminRoutes = require("./routes/admin");

// Models
const Question = require("./models/Question");

// Initialize Database
connectDB();

const app = express();

// Middlewares
app.use(
  cors({
    origin: [
      "https://offlinecoderr.netlify.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());
app.use(express.json());

// Legacy/Direct extension support
app.post("/save-question", async (req, res) => {
  try {
    const { title, description, input, output, starterCode } = req.body;

    // Detect tags heuristically from description text
    const tags = [];
    const lowerDesc = (description || "").toLowerCase();
    const possibleTags = [
      "array", "string", "hash table", "math", "two pointers",
      "binary search", "dynamic programming", "sorting", "greedy",
      "dfs", "bfs", "depth-first search", "breadth-first search",
      "tree", "graph", "recursion", "matrix", "sliding window"
    ];

    possibleTags.forEach(tag => {
      if (lowerDesc.includes(tag)) {
        if (tag === "dfs" || tag === "depth-first search") {
          if (!tags.includes("DFS")) tags.push("DFS");
        } else if (tag === "bfs" || tag === "breadth-first search") {
          if (!tags.includes("BFS")) tags.push("BFS");
        } else {
          const capitalized = tag.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          if (!tags.includes(capitalized)) tags.push(capitalized);
        }
      }
    });

    if (tags.length === 0) tags.push("Miscellaneous");

    // Detect difficulty heuristically
    let difficulty = "Medium";
    if (lowerDesc.includes("easy") || (title || "").toLowerCase().includes("easy")) {
      difficulty = "Easy";
    } else if (lowerDesc.includes("hard") || (title || "").toLowerCase().includes("hard")) {
      difficulty = "Hard";
    }

    // Heuristically extract constraints
    const constraints = [];
    if (lowerDesc.includes("constraints:")) {
      const parts = description.split(/constraints:/i);
      if (parts.length > 1) {
        const lines = parts[1].split("\n").map(l => l.trim()).filter(l => l.length > 0);
        // Take the first 3 lines starting with solid markers
        lines.slice(0, 4).forEach(line => {
          if (line.match(/^[-*•\d]/) || line.length < 50) {
            constraints.push(line.replace(/^[-*•]\s*/, ""));
          }
        });
      }
    }
    if (constraints.length === 0) {
      constraints.push("Standard LeetCode execution limits apply.");
    }

    // Build default templates for other languages based on function signature if extracted
    const starterMap = {
      cpp: starterCode || "",
      java: `class Solution {\n    public int solve(String input) {\n        // Write your Java code here\n        return 0;\n    }\n}`,
      python: `class Solution:\n    def solve(self, input: str) -> int:\n        # Write your Python code here\n        return 0`,
      javascript: `class Solution {\n    solve(input) {\n        // Write your JavaScript code here\n        return 0;\n    }\n}`
    };

    const newQuestion = await Question.create({
      title: title || "Saved Question",
      description: description || "No description provided.",
      difficulty,
      tags,
      starterCode: starterMap,
      examples: [{
        input: input || "2,3",
        output: output || "5",
        explanation: "Auto-extracted test case."
      }],
      constraints
    });

    console.log(`🚀 Question saved: ${newQuestion.title} (${newQuestion._id})`);
    res.json({ success: true, id: newQuestion._id });
  } catch (error) {
    console.error("❌ Save Question Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/revisions", revisionRoutes);
app.use("/api/admin", adminRoutes);

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Offline Coder API running...");
});

// Use port from environment or fallback to 3001
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});