const SAVED_CHATS_KEY = "zeal_chat_sessions";

const sendBtn = document.getElementById("send");
const input = document.getElementById("input");
const responseBox = document.getElementById("response");
const newChatBtn = document.getElementById("newChat");
const chatList = document.getElementById("chatList");

// ---------- Load State ----------
let chatSessions = JSON.parse(localStorage.getItem(SAVED_CHATS_KEY)) || [];
let currentSessionId = null;

// ---------- Helpers ----------
function saveChats() {
  localStorage.setItem(SAVED_CHATS_KEY, JSON.stringify(chatSessions));
}

function getCurrentChat() {
  return chatSessions.find(c => c.id === currentSessionId);
}

// ---------- Init ----------
function initApp() {
  if (chatSessions.length === 0) {
    createNewChat();
  } else {
    currentSessionId = chatSessions[0].id;
    renderChatList();
    renderMessages();
  }
}

// ---------- Chat Creation ----------
function createNewChat() {
  const session = {
    id: Date.now(),
    title: "New Chat",
    messages: []
  };

  chatSessions.unshift(session);
  currentSessionId = session.id;
  saveChats();
  renderChatList();
  renderMessages();
}

// ---------- Delete Chat ----------
function deleteChat(chatId) {
  chatSessions = chatSessions.filter(chat => chat.id !== chatId);

  if (chatSessions.length === 0) {
    createNewChat();
    return;
  }

  if (currentSessionId === chatId) {
    currentSessionId = chatSessions[0].id;
  }

  saveChats();
  renderChatList();
  renderMessages();
}

// ---------- Rendering ----------
function renderChatList() {
  chatList.innerHTML = "";

  chatSessions.forEach(chat => {
    const item = document.createElement("div");
    item.className = `chat-item ${chat.id === currentSessionId ? "active" : ""}`;

    const title = document.createElement("span");
    title.textContent = chat.title;
    title.onclick = () => {
      currentSessionId = chat.id;
      renderChatList();
      renderMessages();
    };

    const del = document.createElement("button");
    del.textContent = "🗑️";
    del.className = "chat-delete";
    del.onclick = (e) => {
      e.stopPropagation(); // 🔥 VERY IMPORTANT
      deleteChat(chat.id);
    };

    item.appendChild(title);
    item.appendChild(del);
    chatList.appendChild(item);
  });
}

function renderMessages() {
  responseBox.innerHTML = "";
  const chat = getCurrentChat();
  if (!chat) return;

  chat.messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = `message ${msg.role === "user" ? "user" : "ai"}`;
    div.textContent = msg.content;
    responseBox.appendChild(div);
  });

  responseBox.scrollTop = responseBox.scrollHeight;
}

// ---------- Send Message ----------
sendBtn.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  const chat = getCurrentChat();
  if (!chat) return;

  chat.messages.push({ role: "user", content: text });

  if (chat.messages.length === 1) {
    chat.title = text.slice(0, 24) + "...";
  }

  saveChats();
  renderChatList();
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

  } catch {
    chat.messages.push({
      role: "assistant",
      content: "⚠️ Error connecting to ZEAL.AI"
    });
  }

  saveChats();
  renderMessages();
};

// ---------- Buttons ----------
newChatBtn.onclick = createNewChat;

// ---------- Start ----------
initApp();


