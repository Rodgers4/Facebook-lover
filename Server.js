// server.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = 'Rodgers4';
const PAGE_ACCESS_TOKEN = 'EAARnZBLCwD9EBPEBHoHelOhweQpF7MOHdQj0gnHj2dJUrgDVGuxhDd9mxTAxOdcruv9zE5Lr6dP8ODQ7SGhd6BpUGTLKfOLoHbyQ3g9JVZAlgllUUCUZCrhxFIN1XFo2WdmxpPWh8Fh3wJfFFw6WE1DAp5mk5zW9lZAzxgYHhYcMSOwHxzzEnYfDpB16m4lMiYp2PSlB6QZDZD';
const GROQ_API_KEY = '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';

app.get('/', (req, res) => {
  res.send("Toxic Lover Webhook is live 💖");
});

// ✅ Webhook Verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Message Receiver
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const userMessage = webhookEvent.message.text;

        let botReply = "";

        if (userMessage.toLowerCase().includes("owner")) {
          botReply = "Aww 🥺 my owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒 — the kindest, smartest, most loving soul I was ever made for 💕";
        } else {
          const groqResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              model: 'llama3-70b-8192',
              messages: [
                { role: 'system', content: 'You are a sweet, loving girl chatbot called Toxic Lover who answers romantically and kindly.' },
                { role: 'user', content: userMessage }
              ]
            },
            {
              headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );

          botReply = groqResponse.data.choices[0].message.content;
        }

        await axios.post(
          `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
          {
            recipient: { id: senderId },
            message: { text: botReply }
          }
        );
      }
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
