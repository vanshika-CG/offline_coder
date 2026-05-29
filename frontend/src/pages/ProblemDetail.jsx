import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import confetti from "canvas-confetti";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Upload,
  CheckCircle,
  Bookmark,
  BookOpen,
  Terminal,
  Settings,
  Edit,
  Eye,
  History,
  FileText,
  Save
} from "lucide-react";
import {
  getQuestionById,
  executeCode,
  markQuestionSolved,
  toggleBookmarkQuestion,
  saveNote,
  getNoteHistory,
  getQuestions
} from "../utils/api";
import dbInstance from "../utils/db";

export default function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Problem and nav state
  const [question, setQuestion] = useState(null);
  const [questionsList, setQuestionsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editor settings
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);

  // Notes state
  const [activeTab, setActiveTab] = useState("description"); // description | notes
  const [noteContent, setNoteContent] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(true);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteHistory, setNoteHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Execution terminal state
  const [executing, setExecuting] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [customInput, setCustomInput] = useState("");
  const [execResult, setExecResult] = useState(null);

  // Autosave timers
  const noteAutosaveTimer = useRef(null);

  useEffect(() => {
    loadProblem();
  }, [id]);

  useEffect(() => {
    // Save code to localStorage on keypress for robust persistence
    if (question) {
      localStorage.setItem(`code_${question._id}_${language}`, code);
    }
  }, [code, language, question]);

  const loadProblem = async () => {
    try {
      setLoading(true);
      const res = await getQuestionById(id);
      const q = res.data.question;
      setQuestion(q);

      // Load cached or default starter code
      const cachedCode = localStorage.getItem(`code_${q._id}_${language}`);
      if (cachedCode) {
        setCode(cachedCode);
      } else {
        setCode(q.starterCode?.[language] || getDefaultStarter(language, q.title));
      }

      // Load notes
      setNoteContent(q.userNote || "");

      // Load all questions for library relative sibling navigation
      const listRes = await getQuestions();
      setQuestionsList(listRes.data.questions || []);

      // Load notes history
      const histRes = await getNoteHistory(q._id);
      setNoteHistory(histRes.data.history || []);

    } catch (err) {
      console.error("Failed to load problem details:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultStarter = (lang, title) => {
    const safeTitle = title.replace(/\s+/g, "");
    switch (lang) {
      case "cpp":
        return `class Solution {\npublic:\n    int solve(string input) {\n        // Your C++ code here\n        return 0;\n    }\n};`;
      case "java":
        return `class Solution {\n    public int solve(String input) {\n        // Your Java code here\n        return 0;\n    }\n}`;
      case "python":
        return `class Solution:\n    def solve(self, input: str) -> int:\n        # Your Python code here\n        return 0`;
      case "javascript":
      default:
        return `class Solution {\n    solve(input) {\n        // Your JavaScript code here\n        return 0;\n    }\n}`;
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    // Restore or generate
    const cachedCode = localStorage.getItem(`code_${question._id}_${newLang}`);
    if (cachedCode) {
      setCode(cachedCode);
    } else {
      setCode(question.starterCode?.[newLang] || getDefaultStarter(newLang, question.title));
    }
  };

  // Nav sibling getters
  const navigateSibling = (dir) => {
    const currentIndex = questionsList.findIndex((q) => q._id === question._id);
    if (currentIndex === -1) return;

    if (dir === "prev" && currentIndex > 0) {
      navigate(`/problem/${questionsList[currentIndex - 1]._id}`);
    } else if (dir === "next" && currentIndex < questionsList.length - 1) {
      navigate(`/problem/${questionsList[currentIndex + 1]._id}`);
    }
  };

  const hasPrev = () => {
    const idx = questionsList.findIndex((q) => q._id === question?._id);
    return idx > 0;
  };

  const hasNext = () => {
    const idx = questionsList.findIndex((q) => q._id === question?._id);
    return idx !== -1 && idx < questionsList.length - 1;
  };

  // Note autosave trigger
  const handleNoteChange = (val) => {
    setNoteContent(val);
    if (noteAutosaveTimer.current) {
      clearTimeout(noteAutosaveTimer.current);
    }
    
    setNoteSaving(true);
    noteAutosaveTimer.current = setTimeout(async () => {
      try {
        await saveNote(question._id, val);
        setNoteSaving(false);
      } catch (err) {
        console.error("Autosave note failed:", err);
        setNoteSaving(false);
      }
    }, 1500);
  };

  // Bookmark toggle
  const handleBookmarkToggle = async () => {
    try {
      await toggleBookmarkQuestion(question._id);
      setQuestion(prev => ({ ...prev, isBookmarked: !prev.isBookmarked }));
    } catch (err) {
      console.error(err);
    }
  };

  // Solve toggle
  const handleMarkSolvedLocal = async () => {
    try {
      await markQuestionSolved(question._id);
      setQuestion(prev => ({ ...prev, isSolved: true }));
      triggerConfetti();
    } catch (err) {
      console.error(err);
    }
  };

  // Run or submit code
  const runCodeAttempt = async (isSubmit = false) => {
    setExecuting(true);
    setTerminalOpen(true);
    setExecResult(null);

    try {
      const res = await executeCode({
        code,
        language,
        questionId: question._id,
        input: isSubmit ? "" : customInput || question.examples[0]?.input || "",
        isSubmit
      });

      const submission = res.data.submission;
      setExecResult(submission);

      if (submission.status === "Accepted") {
        if (isSubmit) {
          // Mark solved locally
          await markQuestionSolved(question._id);
          setQuestion(prev => ({ ...prev, isSolved: true }));
          triggerConfetti();
        }
      }
    } catch (err) {
      console.error(err);
      setExecResult({
        status: "Runtime Error",
        error: err.response?.data?.message || err.message || "Code execution failed."
      });
    } finally {
      setExecuting(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.65 },
      colors: ["#a855f7", "#06b6d4", "#10b981"]
    });
  };

  const renderMarkdownPreview = (text) => {
    if (!text) return <p className="text-gray-500 italic">No notes created yet. Click edit to jot down thoughts...</p>;
    
    // Simple mock markdown parser for secure offline sandboxed environment
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="text-2xl font-bold mt-4 mb-2 text-white">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-xl font-bold mt-3 mb-2 text-white">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return <li key={idx} className="ml-4 list-disc text-gray-300">{line.replace(/^[-*]\s*/, "")}</li>;
      }
      if (line.startsWith("```")) {
        return null; // Simplified code-block line filter
      }
      return <p key={idx} className="text-gray-300 text-sm leading-relaxed mb-1.5">{line}</p>;
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-brand-bg text-white">
        <div className="w-12 h-12 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading code environment...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col md:flex-row gap-6 bg-brand-bg text-white py-4 overflow-hidden h-[calc(100vh-130px)]">
      {/* LEFT COLUMN: Panel (Description / Notes) */}
      <div className="w-full md:w-1/2 flex flex-col rounded-2xl glass-panel relative overflow-hidden h-full">
        {/* Toggle tab headers */}
        <div className="flex items-center justify-between border-b border-brand-border bg-slate-950/60 px-4 py-2.5">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("description")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "description"
                  ? "bg-brand-purple/10 text-brand-purple border border-brand-purple/30 glow-purple"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <BookOpen size={14} />
              <span>Description</span>
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "notes"
                  ? "bg-brand-purple/10 text-brand-purple border border-brand-purple/30 glow-purple"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FileText size={14} />
              <span>Personal Notes</span>
            </button>
          </div>

          {/* Quick bookmarks and solve controls */}
          <div className="flex gap-2">
            <button
              onClick={handleBookmarkToggle}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                question.isBookmarked
                  ? "bg-brand-purple/10 border-brand-purple/40 text-brand-purple glow-purple"
                  : "bg-slate-900 border-brand-border text-gray-500 hover:text-white"
              }`}
              title={question.isBookmarked ? "Bookmarked" : "Bookmark problem"}
            >
              <Bookmark size={14} fill={question.isBookmarked ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleMarkSolvedLocal}
              disabled={question.isSolved}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition ${
                question.isSolved
                  ? "bg-brand-green/10 border-brand-green/30 text-brand-green cursor-default"
                  : "bg-slate-900 border-brand-border text-gray-400 hover:text-brand-green hover:border-brand-green/40 cursor-pointer"
              }`}
            >
              <CheckCircle size={14} />
              <span>{question.isSolved ? "Solved" : "Mark Solved"}</span>
            </button>
          </div>
        </div>

        {/* Left Side Scrollable Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "description" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{question.title}</h2>
                <div className="flex flex-wrap gap-2 items-center">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      question.difficulty === "Easy"
                        ? "bg-brand-green/10 text-brand-green border border-brand-green/20"
                        : question.difficulty === "Medium"
                        ? "bg-brand-amber/10 text-brand-amber border border-brand-amber/20"
                        : "bg-brand-red/10 text-brand-red border border-brand-red/20"
                    }`}
                  >
                    {question.difficulty}
                  </span>
                  {question.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-brand-border text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description Body */}
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans border-t border-brand-border pt-4">
                {question.description}
              </div>

              {/* Examples */}
              {question.examples?.map((ex, index) => (
                <div key={index} className="space-y-2.5 border-t border-brand-border pt-4">
                  <h4 className="font-bold text-white text-sm">Example {index + 1}:</h4>
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-brand-border text-xs font-mono space-y-2">
                    <p><span className="text-brand-cyan">Input:</span> {ex.input}</p>
                    <p><span className="text-brand-green">Output:</span> {ex.output}</p>
                    {ex.explanation && <p className="text-gray-400 italic font-sans"><span className="text-brand-purple font-semibold font-mono not-italic">Explanation:</span> {ex.explanation}</p>}
                  </div>
                </div>
              ))}

              {/* Constraints */}
              {question.constraints && question.constraints.length > 0 && (
                <div className="space-y-2 border-t border-brand-border pt-4">
                  <h4 className="font-bold text-white text-sm">Constraints:</h4>
                  <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1">
                    {question.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            // Notes Tab view
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between border-b border-brand-border pb-3 shrink-0">
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingNote(true)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                      isEditingNote ? "bg-slate-900 text-white font-bold" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Edit size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setIsEditingNote(false)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                      !isEditingNote ? "bg-slate-900 text-white font-bold" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Eye size={13} />
                    <span>Preview</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {noteSaving ? (
                    <span className="text-brand-cyan flex items-center gap-1">
                      <Save size={12} className="animate-pulse" />
                      <span>Autosaving...</span>
                    </span>
                  ) : (
                    <span className="text-gray-500">Autosaved locally</span>
                  )}
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-1 rounded bg-slate-900 border border-brand-border text-gray-400 hover:text-white cursor-pointer"
                    title="Edit History"
                  >
                    <History size={13} />
                  </button>
                </div>
              </div>

              {/* Note input/render */}
              <div className="flex-1 overflow-y-auto min-h-[300px]">
                {showHistory ? (
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-white">Edit History (Last 10 revisions)</h4>
                    {noteHistory.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No notes revisions synced yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {noteHistory.map((h, i) => (
                          <div key={i} className="p-3 bg-slate-950/60 rounded-lg border border-brand-border text-xs">
                            <p className="text-brand-cyan mb-1">{new Date(h.editedAt).toLocaleString()}</p>
                            <pre className="text-gray-400 overflow-x-auto whitespace-pre-wrap">{h.content}</pre>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setShowHistory(false)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-xs rounded border border-brand-border transition cursor-pointer"
                    >
                      Return to Notes
                    </button>
                  </div>
                ) : isEditingNote ? (
                  <textarea
                    value={noteContent}
                    onChange={(e) => handleNoteChange(e.target.value)}
                    className="w-full h-full min-h-[300px] bg-slate-950/60 border border-brand-border rounded-xl p-4 text-sm text-gray-200 outline-none focus:border-brand-purple transition font-mono resize-none"
                    placeholder="# Arrays & Hashmap Insights&#10;&#10;- Optimal approach uses a sliding window.&#10;- Beware of array index out of bounds constraints."
                  />
                ) : (
                  <div className="prose-notes p-4 bg-slate-950/40 border border-brand-border rounded-xl min-h-[300px]">
                    {renderMarkdownPreview(noteContent)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dual Sibling Navigation Footer */}
        <div className="flex items-center justify-between border-t border-brand-border bg-slate-950/60 px-6 py-4 shrink-0">
          <button
            onClick={() => navigateSibling("prev")}
            disabled={!hasPrev()}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-brand-border text-gray-400 hover:text-white hover:border-brand-purple/40 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Prev Problem</span>
          </button>

          <Link to="/library" className="text-xs text-brand-cyan hover:underline font-semibold">
            Back to Library
          </Link>

          <button
            onClick={() => navigateSibling("next")}
            disabled={!hasNext()}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-brand-border text-gray-400 hover:text-white hover:border-brand-purple/40 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Next Problem</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Code Editor Panel */}
      <div className="w-full md:w-1/2 flex flex-col rounded-2xl glass-panel relative overflow-hidden h-full">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between border-b border-brand-border bg-slate-950/60 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-900 border border-brand-border rounded-lg text-xs text-white font-bold cursor-pointer outline-none focus:border-brand-purple"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python 3</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-lg border border-brand-border bg-slate-900 text-gray-400 hover:text-white transition cursor-pointer"
              title="Editor Settings"
            >
              <Settings size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runCodeAttempt(false)}
              disabled={executing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-brand-border text-brand-cyan hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
            >
              <Play size={13} />
              <span>Run Code</span>
            </button>
            <button
              onClick={() => runCodeAttempt(true)}
              disabled={executing}
              className="flex items-center gap-1.5 px-4.5 py-1.5 rounded-lg text-xs font-bold bg-brand-purple hover:bg-brand-purple/80 transition disabled:opacity-50 cursor-pointer glow-purple"
            >
              <Upload size={13} />
              <span>Submit Code</span>
            </button>
          </div>
        </div>

        {/* Editor Workspace Panels */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Quick Settings overlay */}
          {showSettings && (
            <div className="absolute top-2 left-4 p-4 rounded-xl glass-panel glow-purple z-50 space-y-3 w-64 animate-fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Editor Settings</h4>
              <div className="flex items-center justify-between text-xs">
                <span>Font Size (px)</span>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                  className="w-16 p-1 glass-input text-center font-semibold"
                  min={10}
                  max={24}
                />
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-1.5 bg-brand-purple hover:bg-brand-purple/80 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Close Settings
              </button>
            </div>
          )}

          {/* Monaco Editor Component */}
          <div className="flex-1 min-h-[250px]">
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language === "java" ? "java" : language === "python" ? "python" : "javascript"}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                fontSize: fontSize,
                lineNumbers: "on",
                minimap: { enabled: false },
                autoSave: true,
                padding: { top: 12 },
                scrollbar: { vertical: "visible", horizontal: "visible" }
              }}
            />
          </div>

          {/* Output Terminal Slider */}
          <div
            className={`border-t border-brand-border bg-slate-950/95 transition-all duration-300 flex flex-col ${
              terminalOpen ? "h-64" : "h-11"
            }`}
          >
            {/* Terminal Slider Header */}
            <div
              onClick={() => setTerminalOpen(!terminalOpen)}
              className="flex items-center justify-between px-4 py-2.5 bg-slate-950/70 border-b border-brand-border cursor-pointer select-none"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <Terminal size={14} className="text-brand-purple" />
                <span>Console Terminal</span>
              </div>
              <span className="text-[10px] text-brand-cyan font-bold">{terminalOpen ? "Collapse" : "Expand"}</span>
            </div>

            {/* Terminal contents */}
            {terminalOpen && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs text-gray-300">
                {executing ? (
                  <div className="flex items-center justify-center h-full gap-2">
                    <span className="w-4 h-4 border-2 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin"></span>
                    <span className="text-brand-cyan font-bold animate-pulse">Running test cases via Judge0 offline proxy...</span>
                  </div>
                ) : execResult ? (
                  // Result cards
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-extrabold border ${
                          execResult.status === "Accepted"
                            ? "bg-brand-green/10 text-brand-green border-brand-green/20"
                            : "bg-brand-red/10 text-brand-red border-brand-red/20 glow-red"
                        }`}
                      >
                        {execResult.status}
                      </span>
                      {execResult.runtime !== undefined && (
                        <span className="text-gray-400">Runtime: <strong className="text-white">{execResult.runtime}s</strong></span>
                      )}
                      {execResult.memory !== undefined && (
                        <span className="text-gray-400">Memory: <strong className="text-white">{execResult.memory}KB</strong></span>
                      )}
                      {execResult.testCasesPassed !== undefined && (
                        <span className="text-gray-400">Passed: <strong className="text-brand-green">{execResult.testCasesPassed}</strong> / {execResult.totalTestCases}</span>
                      )}
                    </div>

                    {execResult.error ? (
                      <div className="p-3 rounded-lg bg-brand-red/15 border border-brand-red/25 text-brand-red space-y-1.5 overflow-x-auto whitespace-pre-wrap">
                        <h5 className="font-bold text-xs">Diagnostic Errors:</h5>
                        <p>{execResult.error}</p>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-slate-900 border border-brand-border space-y-1.5 overflow-x-auto whitespace-pre-wrap">
                        <h5 className="font-bold text-xs text-brand-cyan">Compiler Output:</h5>
                        <p>{execResult.output || "No output logged."}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Custom input editor
                  <div className="space-y-2 h-full flex flex-col">
                    <div className="flex justify-between items-center shrink-0">
                      <span className="text-gray-400 font-semibold">Custom execution input arguments:</span>
                    </div>
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-brand-border rounded-lg p-2.5 text-xs text-gray-200 outline-none focus:border-brand-purple resize-none"
                      placeholder={question.examples[0]?.input || "2,3"}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
