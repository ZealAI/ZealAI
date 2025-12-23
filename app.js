const STORAGE_KEY = "zeal_chats";

const sendBtn = document.getElementById("send");
const input = document.getElementById("input");
const responseBox = document.getElementById("response");
const newChatBtn = document.getElementById("newChat");
const chatList = document.getElementById("chatList");

let chatSessions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentChatId = null;

/* ---------- Helpers ---------- */
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chatSessions));
}

function currentChat() {
  return chatSessions.find(c => c.id === currentChatId);
}

/* ---------- Render ---------- */
function renderChats() {
  chatList.innerHTML = "";

  chatSessions.forEach(chat => {
    const item = document.createElement("div");
    item.className = "chat-item" + (chat.id === currentChatId ? " active" : "");
    item.textContent = chat.title;

    item.onclick = () => {
      currentChatId = chat.id;
      renderChats();
      renderMessages();
    };

    const del = document.createElement("span");
    del.className = "chat-delete";
    del.textContent = "⋮";

    del.onclick = e => {
      e.stopPropagation();
      deleteChat(chat.id);
    };

    item.appendChild(del);
    chatList.appendChild(item);
  });
}

function renderMessages() {
  responseBox.innerHTML = "";
  const chat = currentChat();
  if (!chat) return;

  chat.messages.forEach(m => {
    const div = document.createElement("div");
    div.className = `message ${m.role}`;
    div.textContent = m.content;
    responseBox.appendChild(div);
  });

  responseBox.scrollTop = responseBox.scrollHeight;
}

/* ---------- Chat Logic ---------- */
function newChat() {
  const chat = {
    id: Date.now(),
    title: "New Chat",
    messages: []
  };
  chatSessions.unshift(chat);
  currentChatId = chat.id;
  save();
  renderChats();
  renderMessages();
}

function deleteChat(id) {
  chatSessions = chatSessions.filter(c => c.id !== id);
  currentChatId = chatSessions[0]?.id || null;
  save();
  renderChats();
  renderMessages();
}

/* ---------- Send ---------- */
sendBtn.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  const chat = currentChat();
  if (!chat) return;

  chat.messages.push({ role: "user", content: text });

  if (chat.messages.length === 1) {
    chat.title = text.slice(0, 22) + "...";
  }

  input.value = "";
  save();
  renderChats();
  renderMessages();

  try {
    const res = await fetch("https://zeal-ai.zeal-ai-app.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chat.messages })
    });

    const data = await res.json();
    chat.messages.push({ role: "assistant", content: data.reply || "No reply." });
  } catch {
    chat.messages.push({ role: "assistant", content: "⚠️ Connection error" });
  }

  save();
  renderMessages();
};

/* ---------- Init ---------- */
newChatBtn.onclick = newChat;

if (chatSessions.length === 0) newChat();
else {
  currentChatId = chatSessions[0].id;
  renderChats();
  renderMessages();
}
