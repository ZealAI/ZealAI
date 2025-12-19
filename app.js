const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

// ⚠️ REPLACE WITH YOUR WORKER URL
const WORKER_URL = "https://zeal-ai.zeal-ai-app.workers.dev/";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Show user message
  addMessage("You", userMessage);
  input.value = "";

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userMessage
      })
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    const data = await response.json();

    // Show ZEAL.AI reply
    addMessage("ZEAL.AI", data.reply || "No reply received");

  } catch (err) {
    addMessage("ZEAL.AI", "Error connecting to ZEAL.AI Worker");
    console.error(err);
  }
});

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = sender === "You" ? "user-msg" : "ai-msg";
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
