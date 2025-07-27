const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = "EAARnZBLCwD9EBPEBHoHelOhweQpF7MOHdQj0gnHj2dJUrgDVGuxhDd9mxTAxOdcruv9zE5Lr6dP8ODQ7SGhd6BpUGTLKfOLoHbyQ3g9JVZAlgllUUCUZCrhxFIN1XFo2WdmxpPWh8Fh3wJfFFw6WE1DAp5mk5zW9lZAzxgYHhYcMSOwHxzzEnYfDpB16m4lMiYp2PSlB6QZDZD";
const VERIFY_TOKEN = "Rodgers4";
const GROQ_API_KEY = "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";

// Root route for Render to avoid "Cannot GET /"
app.get("/", (req, res) => {
  res.send("TOXIC LOVER BOT IS LIVE 💀");
});

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook Verified ✅");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook for receiving messages
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.message && webhook_event.message.text) {
        const msg = webhook_event.message.text.trim();

        if (msg.toLowerCase() === "what is your name") {
          sendMessage(sender_psid, "Am Toxic lover made by Rodgers");
        } else {
          const reply = await askGroq(msg);
          sendMessage(sender_psid, reply || "Sorry, I didn’t get that.");
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Function to send message back
function sendMessage(sender_psid, response) {
  const request_body = {
    recipient: { id: sender_psid },
    message: { text: response },
  };

  axios
    .post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body)
    .then(() => console.log("Message sent ✅"))
    .catch((err) => console.error("Unable to send message ❌", err.response?.data || err));
}

// Ask Groq AI for a reply
async function askGroq(prompt) {
  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("Groq Error:", err.response?.data || err);
    return null;
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("TOXIC LOVER is live on port", PORT));
