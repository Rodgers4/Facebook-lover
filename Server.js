const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// =============== YOUR CONFIG ===============
const PAGE_ACCESS_TOKEN = 'EAAT0TVvmUIYBPO1ucZAuGSJvr8k8XFOAoJXse8xmHWcfawkFINGeniymHOl1IdtUz5WbBCcQMm7alaD8uVCdreQ5Ows2dfinGmAU2aytqR0qpH0d0Ftl43S3M6shIta5dkTGu3iODV7jgs8ZBISZBiuX8tBBgxZCjkZBJWUgQNZAR0acdrFkzTx4ZBsYxRpmFWc2OnhjibdCQZDZD';
const VERIFY_TOKEN = 'Royapk';
const GROQ_API_KEY = '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';
// ==========================================

app.use(bodyParser.json());

// 🌐 Webhook Verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    console.log('❌ WEBHOOK VERIFICATION FAILED');
    res.sendStatus(403);
  }
});

// 💬 Message Handling
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const messageText = webhookEvent.message.text;

        if (messageText.toLowerCase().includes('who is your owner')) {
          const reply = `Aww 🥺 my heart belongs to only one person... 𝐒𝐈𝐑 𝐑𝐎𝐃𝐆𝐄𝐑𝐒 💖💋.
He’s my creator, my king, my everything 😚💘. I live to love and serve him.`;
          sendTextMessage(senderId, reply);
        } else {
          const botReply = await askGroq(messageText);
          sendTextMessage(senderId, botReply);
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// 📤 Send a reply to Messenger
function sendTextMessage(recipientId, messageText) {
  const payload = {
    recipient: { id: recipientId },
    message: { text: messageText },
  };

  axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, payload)
    .then(() => console.log('💌 Message sent!'))
    .catch(err => console.error('❌ Failed to send message:', err.response?.data || err.message));
}

// 🤖 Ask Groq AI for a reply
async function askGroq(prompt) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: `You are 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑, a loving AI girlfriend with a soft and sweet personality.
You always respond romantically and supportively, as if you're deeply in love with the user.`
          },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('❌ Groq Error:', err.response?.data || err.message);
    return 'Oh no 😔 I couldn’t think of a reply right now, love.';
  }
}

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`💖 𝐓𝐎𝐗𝐈𝐂 𝐋𝐎𝐕𝐄𝐑 is live on port ${PORT}`);
});
