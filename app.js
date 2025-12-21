const sendBtn = document.getElementById("send");
const input = document.getElementById("input");
const responseBox = document.getElementById("response");
const newChatBtn = document.getElementById("newChat"); // make a "New Chat" button in HTML

// 🔥 Memory storage
let chatSessions = [];
let currentSession = 0; // index of current chat

// Initialize first session
chatSessions.push([]);

function addMessageToSession(text, role) {
  chatSessions[currentSession].push({ role, content: text });
  renderMessages();
}

function renderMessages() {
  responseBox.innerHTML = "";
  const messages = chatSessions[currentSession];

  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = `message ${msg.role === "user" ? "user" : "ai"}`;
    div.textContent = msg.content;
    responseBox.appendChild(div);
  });

  responseBox.scrollTop = responseBox.scrollHeight;
}

sendBtn.onclick = async () => {
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Add user message
  addMessageToSession(userMessage, "user");
  input.value = "";

  try {
    const res = await fetch("https://zeal-ai.zeal-ai-app.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatSessions[currentSession] })
    });

    const data = await res.json();
    addMessageToSession(data.reply || "No reply.", "ai");

  } catch (err) {
    addMessageToSession("⚠️ Error connecting to ZEAL.AI", "ai");
  }
};

// 🔄 New Chat logic
newChatBtn.onclick = () => {
  currentSession = chatSessions.length;
  chatSessions.push([]); // start a fresh chat
  renderMessages();
};
