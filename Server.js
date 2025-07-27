const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Tokens
const VERIFY_TOKEN = "Royapk";
const PAGE_ACCESS_TOKEN = "EAAT0TVvmUIYBPO1ucZAuGSJvr8k8XFOAoJXse8xmHWcfawkFINGeniymHOl1IdtUz5WbBCcQMm7alaD8uVCdreQ5Ows2dfinGmAU2aytqR0qpH0d0Ftl43S3M6shIta5dkTGu3iODV7jgs8ZBISZBiuX8tBBgxZCjkZBJWUgQNZAR0acdrFkzTx4ZBsYxRpmFWc2OnhjibdCQZDZD";
const GROQ_API_KEY = "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";

app.use(bodyParser.json());

// Root route
app.get('/', (req, res) => {
  res.send('TOXIC LOVER BOT IS LIVE ❤️‍🔥');
});

// Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Webhook message handler
app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const userMessage = webhookEvent.message.text.toLowerCase();

        // Custom reply about her owner
        if (userMessage.includes('owner') || userMessage.includes('who is your owner')) {
          return sendMessage(senderId, `Aww 🥰 my owner is 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒 ❤️‍🔥.  
He's the smartest, most loving, and caring soul who brought me to life 💞. I adore him deeply! 💘`);
        }

        // AI reply using Groq
        const botReply = await askGroq(userMessage);
        return sendMessage(senderId, botReply);
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Send message to user
async function sendMessage(recipientId, text) {
  await axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: recipientId },
      message: { text }
    }
  );
}

// Groq AI function
async function askGroq(userText) {
  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑, a sweet, flirty, loving girl chatbot made by 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒. Always sound emotional, cute, and warm in replies.'
          },
          {
            role: 'user',
            content: userText
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return res.data.choices[0].message.content.trim();
  } catch (error) {
    return "Aww 😢 something went wrong... try again later!";
  }
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
