setTimeout(() => {
  console.log("🚀 Extension Loaded");

  // Create Button
  const btn = document.createElement("button");
  btn.innerText = "Save Offline 🚀";

  btn.style.position = "fixed";
  btn.style.top = "120px";
  btn.style.right = "20px";
  btn.style.zIndex = 9999;
  btn.style.padding = "10px 15px";
  btn.style.background = "orange";
  btn.style.borderRadius = "8px";
  btn.style.fontWeight = "bold";
  btn.style.cursor = "pointer";

  btn.onclick = async () => {
    try {
      console.log("🔥 Button clicked");

      // ✅ TITLE
      const title =
        document.querySelector("div.text-title-large")?.innerText ||
        document.querySelector("h1")?.innerText ||
        "No Title";

      // ✅ DESCRIPTION
      const description =
        document.querySelector('[data-track-load="description_content"]')?.innerText ||
        "No Description";

      // ✅ SIGNATURE EXTRACTION (STRONG METHOD)
  let signature = "";

const fullText =
  document.querySelector('[data-track-load="description_content"]')?.innerText ||
  document.body.innerText;

// find ALL matches
const matches = fullText.match(/[a-zA-Z_<>]+\s+\w+\(.*?\);/g);

if (matches && matches.length > 0) {
  // take LAST match (usually correct function)
  signature = matches[matches.length - 1];
}

console.log("🧠 All Matches:", matches);
console.log("✅ Selected Signature:", signature);

      // ✅ GENERATE STARTER CODE
      let starterCode = "";

      if (signature && signature.trim().length > 0) {
        const cleanSig = signature.replace(";", "").trim();

        starterCode = `class Solution {
public:
    ${cleanSig} {
        
    }
};`;
      } else {
        console.log("⚠️ Using fallback");

        starterCode = `class Solution {
public:
    string convert(string s, int numRows) {
        
    }
};`;
      }

      console.log("💻 Starter Code:", starterCode);

      // Temporary test case
      const input = "2,3";
      const output = "5";

      // ✅ SEND TO BACKEND
      const res = await fetch("http://localhost:3001/save-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          input,
          output,
          starterCode,
        }),
      });

      const data = await res.json();
      console.log("✅ Saved Response:", data);

      alert("✅ Question Saved Successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Error saving question");
    }
  };

  document.body.appendChild(btn);
}, 4000);