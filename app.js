const sendBtn = document.getElementById("send");
const input = document.getElementById("input");
const responseBox = document.getElementById("response");

let messages = []; // 🧠 frontend memory

sendBtn.onclick = async () => {
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // save + render user message
  messages.push({ role: "user", content: userMessage });
  renderMessages();
  input.value = "";

  try {
    const res = await fetch("https://zeal-ai.zeal-ai-app.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();

    messages.push({
      role: "assistant",
      content: data.reply || "No reply."
    });

    renderMessages();

  } catch (err) {
    messages.push({
      role: "assistant",
      content: "⚠️ Error connecting to ZEAL.AI"
    });
    renderMessages();
  }
};

function renderMessages() {
  responseBox.innerHTML = "";

  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = `message ${msg.role}`; // 🔥 THIS WAS THE ISSUE
    div.textContent = msg.content;
    responseBox.appendChild(div);
  });

  responseBox.scrollTop = responseBox.scrollHeight;
}
