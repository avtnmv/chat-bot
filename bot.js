require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const groupChatId = process.env.GROUP_CHAT_ID;

const bot = new TelegramBot(token, { polling: true });

const users = {};

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text) return;

  if (!users[chatId]) {
    users[chatId] = { step: 0 };
    bot.sendMessage(chatId, '1. Какой язык вы знаете?');
    return;
  }

  const user = users[chatId];

  switch (user.step) {
    case 0:
      user.language = text;
      user.step++;
      bot.sendMessage(chatId, '2. С какого вы города?');
      break;

    case 1:
      user.city = text;
      user.step++;
      bot.sendMessage(chatId, '3. Ваш номер телефона? (можно с +, только цифры после)');
      break;

    case 2:
      if (!/^\+?\d{7,15}$/.test(text)) {
        bot.sendMessage(chatId, '❗ Пожалуйста, введите номер телефона корректно (можно с +, только цифры после, от 7 до 15 цифр). Попробуйте ещё раз.');
        return;
      }

      user.phone = text;
      user.step++;
      bot.sendMessage(chatId, '4. Ваше имя?');
      break;

    case 3:
      user.name = text;

      const message = `📩 Новая заявка:
🔹 Имя: ${user.name}
🔹 Язык: ${user.language}
🔹 Город: ${user.city}
🔹 Телефон: ${user.phone}`;

      bot.sendMessage(groupChatId, message);
      bot.sendMessage(chatId, '✅ Спасибо! Ваша заявка отправлена.');

      delete users[chatId];
      break;

    default:
      bot.sendMessage(chatId, 'Начнём заново. Какой язык вы знаете?');
      users[chatId] = { step: 0 };
      break;
  }
});
