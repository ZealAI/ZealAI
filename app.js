const SAVED_CHATS_KEY = "zeal_chat_sessions";

const sendBtn = document.getElementById("send");
const input = document.getElementById("input");
const responseBox = document.getElementById("response");
const newChatBtn = document.getElementById("newChat");
const chatList = document.getElementById("chatList");

// Load saved chats
let chatSessions = JSON.parse(localStorage.getItem(SAVED_CHATS_KEY)) || [];
let currentSessionId = null;

// ---------- Helpers ----------
function saveChats() {
  localStorage.setItem(SAVED_CHATS_KEY, JSON.stringify(chatSessions));
}

function getCurrentChat() {
  return chatSessions.find(c => c.id === currentSessionId);
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

// ---------- Rendering ----------
function renderChatList() {
  chatList.innerHTML = "";

  chatSessions.forEach(chat => {
    const div = document.createElement("div");
    div.className = `chat-item ${chat.id === currentSessionId ? "active" : ""}`;
    div.textContent = chat.title;

    div.onclick = () => {
      currentSessionId = chat.id;
      renderChatList();
      renderMessages();
    };

    chatList.appendChild(div);
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

  // Set title on first message
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

const deleteChatBtn = document.getElementById("deleteChat");

deleteChatBtn.onclick = () => {
  if (!currentSessionId) return;

  // Remove the active chat
  chatSessions = chatSessions.filter(
    chat => chat.id !== currentSessionId
  );

  // If chats still exist, switch to the newest
  if (chatSessions.length > 0) {
    currentSessionId = chatSessions[0].id;
  } else {
    // If all chats deleted, create a new one
    const session = {
      id: Date.now(),
      title: "New Chat",
      messages: []
    };
    chatSessions.push(session);
    currentSessionId = session.id;
  }

  saveChats();
  renderChatList();
  renderMessages();
};

 
