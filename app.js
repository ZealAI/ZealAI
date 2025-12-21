const sendBtn = document.getElementById("send");
const input = document.getElementById("input");
const responseBox = document.getElementById("response");
const newChatBtn = document.getElementById("newChat");

/* 🧠 MEMORY (per chat session) */
let messages = [
  {
    role: "system",
    content: "You are ZEAL.AI, a Bible-guided assistant that responds with wisdom, clarity, and kindness."
  }
];

/* RENDER */
function renderMessages() {
  responseBox.innerHTML = "";

  messages.forEach(msg => {
    if (msg.role === "system") return;

    const div = document.createElement("div");
    div.className = `message ${msg.role}`;
    div.textContent = msg.content;
    responseBox.appendChild(div);
  });

  responseBox.scrollTop = responseBox.scrollHeight;
}

/* SEND */
sendBtn.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  messages.push({ role: "user", content: text });
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
      content: data.reply || "No response."
    });

    renderMessages();

  } catch {
    messages.push({
      role: "assistant",
      content: "⚠️ Error connecting to ZEAL.AI"
    });
    renderMessages();
  }
};

/* NEW CHAT (RESET MEMORY) */
newChatBtn.onclick = () => {
  messages = [
    {
      role: "system",
      content: "You are ZEAL.AI, a Bible-guided assistant that responds with wisdom, clarity, and kindness."
    }
  ];
  responseBox.innerHTML = "";
};
