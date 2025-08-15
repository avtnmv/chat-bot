require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const groupChatId = process.env.GROUP_CHAT_ID;

const bot = new TelegramBot(token, { polling: true });

const users = {};

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  // Сбрасываем состояние пользователя и начинаем заново
  users[chatId] = { step: 0 };
  
  bot.sendMessage(chatId, '👋 Добро пожаловать! Давайте заполним заявку.\n\n1. Какой язык вы знаете?');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text) return;

  // Игнорируем команды (начинающиеся с /)
  if (text.startsWith('/')) return;

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
      bot.sendMessage(chatId, '2. Ваш номер телефона? (можно с +, только цифры после)');
      break;

    case 1:
      if (!/^\+?\d{7,15}$/.test(text)) {
        bot.sendMessage(chatId, '❗ Пожалуйста, введите номер телефона корректно (можно с +, только цифры после, от 7 до 15 цифр). Попробуйте ещё раз.');
        return;
      }

      user.phone = text;
      user.step++;
      bot.sendMessage(chatId, '3. Ваше имя?');
      break;

    case 2:
      user.name = text;
      user.step++;
      bot.sendMessage(chatId, '4. Ваш Telegram (обязательно начинается с @)');
      break;

    case 3:
      if (!/^@[A-Za-z0-9_]{5,32}$/.test(text)) {
        bot.sendMessage(chatId, '❗ Telegram-ник должен начинаться с @ и содержать только буквы, цифры и _. Минимум 5 символов после @.');
        return;
      }

      user.telegram = text;

      const message = `📩 Новая заявка:
🔹 Имя: ${user.name}
🔹 Язык: ${user.language}
🔹 Телефон: ${user.phone}
🔹 Telegram: ${user.telegram}`;

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

