let messages = [];
messages.push({ role: "user", content: userInput });
body: JSON.stringify({
  messages: messages
})
messages.push({ role: "assistant", content: data.reply });
//chatBox.innerHTML = "";

//messages.forEach(msg => {
 // const div = document.createElement("div");
 // div.className = msg.role;
 // div.textContent = msg.content;
//  chatBox.appendChild(div);
//});


const sendBtn = document.getElementById("send");
const input = document.getElementById("input");
const responseBox = document.getElementById("response");

sendBtn.onclick = async () => {
  const message = input.value.trim();
  if (!message) return;

  responseBox.textContent = "Thinking...";

  try {
    const res = await fetch("https://zeal-ai.zeal-ai-app.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    responseBox.textContent = data.reply || "No response.";
  } catch (err) {
    responseBox.textContent = "Error connecting to ZEAL.AI";
  }
};
