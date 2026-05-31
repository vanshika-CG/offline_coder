setTimeout(() => {
  console.log("🚀 Extension Loaded");

  const btn = document.createElement("button");
  btn.innerText = "Save Offline 🚀";

  btn.style.position = "fixed";
  btn.style.top = "120px";
  btn.style.right = "20px";
  btn.style.zIndex = "9999";
  btn.style.padding = "10px 15px";
  btn.style.background = "orange";
  btn.style.borderRadius = "8px";
  btn.style.fontWeight = "bold";
  btn.style.cursor = "pointer";
  btn.style.color = "black";
  btn.style.border = "none";

  btn.onclick = async () => {
    try {
      console.log("🔥 Button clicked");

      const title =
        document.querySelector("div.text-title-large")?.innerText ||
        document.querySelector("h1")?.innerText ||
        "No Title";

      const description =
        document.querySelector('[data-track-load="description_content"]')
          ?.innerText || "No Description";

      let signature = "";

      const fullText =
        document.querySelector('[data-track-load="description_content"]')
          ?.innerText || document.body.innerText;

      const matches = fullText.match(
        /[a-zA-Z_<>]+\s+\w+\(.*?\);/g
      );

      if (matches?.length) {
        signature = matches[matches.length - 1];
      }

      let starterCode = "";

      if (signature.trim()) {
        const cleanSig = signature.replace(";", "").trim();

        starterCode = `class Solution {
public:
    ${cleanSig} {

    }
};`;
      } else {
        starterCode = `class Solution {
public:
    string convert(string s, int numRows) {

    }
};`;
      }

      const payload = {
        title,
        description,
        input: "2,3",
        output: "5",
        starterCode,
      };

      console.log("📦 Payload:", payload);

      const res = await fetch(
        "https://offlinecoder.onrender.com/save-question",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("📡 Status:", res.status);

      const responseText = await res.text();
      console.log("📨 Response:", responseText);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${responseText}`);
      }

      alert("✅ Question Saved Successfully!");
    } catch (err) {
      console.error("❌ Extension Error:", err);
      alert("❌ Error saving question. Check console.");
    }
  };

  document.body.appendChild(btn);
}, 4000);