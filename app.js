async function send() {
  const input = document.getElementById("input");
  const chat = document.getElementById("chat");

  const userMsg = input.value;
  chat.innerHTML += `<p><b>You:</b> ${userMsg}</p>`;
  input.value = "";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "xeNUwoZ7GQHXwRjEVB3AA7FMS7BMAwpA"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are ZEAL.AI, a Bible-based assistant." },
        { role: "user", content: userMsg }
      ]
    })
  });

  const data = await response.json();
  const reply = data.choices[0].message.content;

  chat.innerHTML += `<p><b>ZEAL.AI:</b> ${reply}</p>`;
}
