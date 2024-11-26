data:", error);
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
