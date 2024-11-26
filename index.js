const TelegramBot = require('node-telegram-bot-api');
const https = require('https');

// Replace with your Telegram Bot API Token
const TOKEN = '7439944549:AAHDZsF5SJXcCIqA9Zo5zvh_MZ6-iZjTJ0U'; // توکینی بۆت لێرە داخڵ بکە
const bot = new TelegramBot(TOKEN, { polling: true });

// List of allowed users by their Telegram usernames
const allowedUsers = ['M4tinZH1', 'ramyar_kh09']; // یوسرنەیمەکانە تایبەتی

// Binance API Base URL
const API_URL = "https://api.binance.com/api/v3/ticker/price?symbol=";

// Helper function to fetch crypto price
function fetchCryptoPrice(symbol) {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}${symbol}`;
    https.get(url, (res) => {
      let data = '';

      // Collect data
      res.on('data', (chunk) => {
        data += chunk;
      });

      // Handle end of response
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.price) {
            resolve(parseFloat(json.price));
          } else {
            reject('Invalid response from API.');
          }
        } catch (error) {
          reject('Error parsing response.');
        }
      });
    }).on('error', (error) => {
      reject(error.message);
    });
  });
}

// Command: /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username; // گرفتن یوسرنەیمەی بەکارهێنەر

  // Check if the username is allowed
  if (allowedUsers.includes(username)) {
    // Fetch Bitcoin price to display
    fetchCryptoPrice('BTCUSDT').then((price) => {
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: ' (BTC) بیتکۆین', callback_data: 'BTCUSDT' },
              { text: ' (ETH) ئیثریۆم', callback_data: 'ETHUSDT' },
              { text: 'ترۆن (TRX)', callback_data: 'TRXUSDT' }
            ],
            [
              { text: '(DOGE) دۆگز کوین', callback_data: 'DOGEUSDT' }
            ]
          ]
        }
      };

      // Sending message with Bitcoin price and embedded image
      bot.sendMessage(
        chatId,
        `💰 نرخی ئێستای بیتکۆین: $${price.toFixed(2)}\n\n` +
        ' سیگناڵێگ هەڵبژێرە : ',
        options
      );

      // Sending Bitcoin Image (Embed)
     // bot.sendPhoto(chatId, 'https://images.app.goo.gl/vUsy9H7f2quuddGq8');  // لێرە وێنەی بیتکۆینەکەیە

    }).catch((error) => {
      bot.sendMessage(chatId, `❌ کێشەیەک هەبوو لە کەشانەوەی زانیاری بۆ بیتکۆین.`);
    });
  } else {
    // Send a message to users who are not allowed
    const blockedMessage = `❌ یوسرنەیمی تێلێگرامەکەت تایبەتی نیە بۆ بەکارھێنانی بۆتەکە.\n\n` + 
    `پەیوەندیمە بە: @M4tinZH1 بۆ زیادکردنەوەی یوسرنەیمەکەت بەرەو فەرمی تایبەتی.`;

    // Notify the admin and send message to the user
    bot.sendMessage(chatId, blockedMessage);

    // You can also send this message to the bot admin
    const adminChatId = 'YOUR_ADMIN_CHAT_ID'; // You should replace this with the admin's chat ID
    bot.sendMessage(adminChatId, `🚫 کەسێکی نەتاوە بە یوسرنەیمەی ${username} سەعی کرد بۆتەکە بەکاربێت.\n` +
    `لێرە کەسەکە دەبێت تایبەتی بێت بەرەوپێشەکان.`);
  }
});

// Handle button presses
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const symbol = callbackQuery.data.toUpperCase();

  try {
    // Fetching Crypto Data
    const price = await fetchCryptoPrice(symbol);

    // Signal Logic (Mock Example)
    const signal = price < 2000 ? "بیکڕە" : "بیفرۆشە"; // Edit this logic for specific signals like BTC, ETH

    // Sending Signal
    bot.sendMessage(
      chatId,
      `💰 نرخی ئێستای ${symbol}: $${price.toFixed(2)}\n\n📈 سیگناڵ: ${signal}`
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    bot.sendMessage(chatId, `❌ کێشەیەک هەبوو لە کەشانەوەی زانیاری بۆ ${symbol}.`);



    // Command: /signal <crypto_symbol>
    bot.onText(/\/signal (\w+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const username = msg.from.username;
      const symbol = match[1].toUpperCase(); // Parse the cryptocurrency symbol (e.g., 'BTC', 'ETH')

      // Check if the username is allowed
      if (allowedUsers.includes(username)) {
        try {
          // Fetching Crypto Price
          const price = await fetchCryptoPrice(`${symbol}USDT`);

          // Example Signal Logic (adjust according to your needs)
          const signal = price < 2000 ? "بیکڕە" : "بیفرۆشە"; // Change this logic based on actual signals

          // Sending Signal
          bot.sendMessage(
            chatId,
            `💰 نرخی ئێستای ${symbol}: $${price.toFixed(2)}\n\n📈 سیگناڵ: ${signal}`
          );
        } catch (error) {
          bot.sendMessage(chatId, `❌ کێشەیەک هەبوو لە کەشانەوەی زانیاری بۆ ${symbol}.`);
        }
      } else {
        // Send a message to users who are not allowed
        const blockedMessage = `❌ یوسرنەیمی تێلێگرامەکەت تایبەتی نیە بۆ بەکارھێنانی بۆتەکە.\n\n` + 
        `پەیوەندیمە بە: @M4tinZH1 بۆ زیادکردنەوەی یوسرنەیمەکەت بەرەو فەرمی تایبەتی.`;

        bot.sendMessage(chatId, blockedMessage);
      }
    });
  }
});
