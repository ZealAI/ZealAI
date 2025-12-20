const sendBtn = document.getElementById("send");
const input = document.getElementById("input");
const responseBox = document.getElementById("response");

let messages = [];

sendBtn.onclick = async () => {
  const userText = input.value.trim();
  if (!userText) return;

  // save user message
  messages.push({ role: "user", content: userText });

  // render chat
  renderMessages();
  input.value = "";

  try {
    const res = await fetch("https://zeal-ai.zeal-ai-app.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }) // 🔥 THIS WAS THE FIX
    });

    const data = await res.json();

    if (data.reply) {
      messages.push({ role: "assistant", content: data.reply });
      renderMessages();
    } else {
      messages.push({ role: "assistant", content: "⚠️ No reply from ZEAL.AI" });
      renderMessages();
    }

  } catch (err) {
    messages.push({ role: "assistant", content: "❌ Error connecting to ZEAL.AI" });
    renderMessages();
  }
};

function renderMessages() {
  responseBox.innerHTML = "";
  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = msg.role;
    div.textContent = msg.content;
    responseBox.appendChild(div);
  });
}
