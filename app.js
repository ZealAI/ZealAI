const SAVED_CHATS_KEY = "zeal_chat_sessions";

const sendBtn = document.getElementById("send");
const input = document.getElementById("input");
const responseBox = document.getElementById("response");
const newChatBtn = document.getElementById("newChat");
const chatList = document.getElementById("chatList");

// 🔥 All chats live here
let chatSessions = JSON.parse(localStorage.getItem(SAVED_CHATS_KEY)) || [];
let currentSession = 0;

if (chatSessions.length === 0) {
  chatSessions.push([]);
}
function saveChats() {
  localStorage.setItem(SAVED_CHATS_KEY, JSON.stringify(chatSessions));
}


// Create first chat
createNewChat();

function createNewChat() {
  const session = {
    id: Date.now(),
    title: "New Chat",
    messages: []
  };

  chatSessions.unshift(session);
  currentSession = session.id;
  renderChatList();
  renderMessages();
}

function renderChatList() {
  chatList.innerHTML = "";

  chatSessions.forEach(chat => {
    const div = document.createElement("div");
    div.className = `chat-item ${chat.id === currentSession ? "active" : ""}`;
    div.textContent = chat.title;
    div.onclick = () => {
      currentSession = chat.id;
      renderChatList();
      renderMessages();
    };
    chatList.appendChild(div);
  });
}

function renderMessages() {
  responseBox.innerHTML = "";
  const chat = chatSessions.find(c => c.id === currentSession);

  chat.messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = `message ${msg.role === "user" ? "user" : "ai"}`;
    div.textContent = msg.content;
    responseBox.appendChild(div);
  });

  responseBox.scrollTop = responseBox.scrollHeight;
}

sendBtn.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  const chat = chatSessions.find(c => c.id === currentSession);

  chat.messages.push({ role: "user", content: text });

  function addMessageToSession(text, role) {
  chatSessions[currentSession].push({ role, content: text });
  saveChats();
  renderMessages();
}

  
  if (chat.messages.length === 1) {
    chat.title = text.slice(0, 20) + "...";
    renderChatList();
  }

  renderMessages();
  input.value = "";

  try {
    const res = await fetch("https://zeal-ai.zeal-ai-app.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chat.messages })
    });

    const data = await res.json();

    chat.messages.push({
      role: "assistant",
      content: data.reply || "No reply."
    });

    renderMessages();

  } catch {
    chat.messages.push({
      role: "assistant",
      content: "⚠️ Error connecting to ZEAL.AI"
    });
    renderMessages();
  }
};

newChatBtn.onclick = createNewChat;
newChatBtn.onclick = () => {
  currentSession = chatSessions.length;
  chatSessions.push([]);
  saveChats();
  renderMessages();
};

