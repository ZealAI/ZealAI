const sendBtn = document.getElementById("send");
const input = document.getElementById("input");
const responseBox = document.getElementById("response");

// CHAT MEMORY (FRONTEND)
let messages = [];

sendBtn.onclick = async () => {
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Save user message
  messages.push({ role: "user", content: userMessage });

  // Render chat
  renderChat();

  input.value = "";

  try {
    const res = await fetch("https://zeal-ai.zeal-ai-app.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages   // SEND FULL CHAT
      })
    });

    const data = await res.json();

    // Save assistant reply
    messages.push({
      role: "assistant",
      content: data.reply || "No response."
    });

    renderChat();

  } catch (err) {
    messages.push({
      role: "assistant",
      content: "Error connecting to ZEAL.AI"
    });
    renderChat();
  }
};

// RENDER CHAT FUNCTION
function renderChat() {
  responseBox.innerHTML = "";

  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = msg.role;
    div.textContent = msg.content;
    responseBox.appendChild(div);
  });

  responseBox.scrollTop = responseBox.scrollHeight;
}

