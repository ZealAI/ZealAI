const SAVED_CHATS_KEY = "zeal_chat_sessions";

const sendBtn = document.getElementById("send");
const input = document.getElementById("input");
const responseBox = document.getElementById("response");
const newChatBtn = document.getElementById("newChat");
const chatList = document.getElementById("chatList");
const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.getElementById("toggleSidebar");

// ---------- Load ----------
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

// ---------- Create ----------
function createNewChat() {
  const chat = {
    id: Date.now(),
    title: "New Chat",
    messages: []
  };

  chatSessions.unshift(chat);
  currentSessionId = chat.id;
  saveChats();
  renderChatList();
  renderMessages();
}

// ---------- Delete ----------
function deleteChat(chatId) {
  chatSessions = chatSessions.filter(c => c.id !== chatId);

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

// ---------- Render Sidebar ----------
function renderChatList() {
  chatList.innerHTML = "";

  chatSessions.forEach(chat => {
    const item = document.createElement("div");
    item.className = `chat-item ${chat.id === currentSessionId ? "active" : ""}`;

    const title = document.createElement("span");
    title.className = "chat-title";
    title.textContent = chat.title;
    title.onclick = () => {
      currentSessionId = chat.id;
      renderChatList();
      renderMessages();
    };

    const del = document.createElement("button");
    del.className = "chat-delete";
    del.innerHTML = "🗑️";
    del.onclick = (e) => {
      e.stopPropagation();
      deleteChat(chat.id);
    };

    item.appendChild(title);
    item.appendChild(del);
    chatList.appendChild(item);
  });
}

// ---------- Render Messages ----------
function renderMessages() {
  responseBox.innerHTML = "";
  const chat = getCurrentChat();
  if (!chat) return;

  chat.messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = `message ${msg.role === "user" ? "user" : "assistant"}`;
    div.textContent = msg.content;
    responseBox.appendChild(div);
  });

  responseBox.scrollTop = responseBox.scrollHeight;
}

// ---------- Typing Effect ----------
function typeMessage(text, chat) {
  const div = document.createElement("div");
  div.className = "message assistant";
  responseBox.appendChild(div);

  let i = 0;
  const speed = 18; // typing speed

  const interval = setInterval(() => {
    div.textContent += text[i];
    i++;
    responseBox.scrollTop = responseBox.scrollHeight;

    if (i >= text.length) {
      clearInterval(interval);
      chat.messages.push({ role: "assistant", content: text });
      saveChats();
    }
  }, speed);
}

// ---------- Send ----------
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
    const reply = data.reply || "No reply.";

    typeMessage(reply, chat);

  } catch {
    typeMessage("⚠️ Error connecting to ZEAL.AI", chat);
  }
};



toggleBtn.onclick = () => {
  sidebar.classList.toggle("hidden");
};

newChatBtn.onclick = createNewChat;

initApp();

