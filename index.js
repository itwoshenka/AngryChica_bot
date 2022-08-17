const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')
// const sequelize = require('./db');
// const UserModel = require('./models');

const token = '5377258797:AAEjFjg-0vM3tPNhntaMe78Jfa1j206Nv04'

const bot = new TelegramApi(token, {polling: true})

const chats = {}


const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `I am Angry Chica, a bot developing in beta version. As for now I will give you 9 nubers to guess and you should pick the right one! Let's see if you can win!`);
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Guess now', gameOptions);
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log('Oops, something went wrong,sorry', e)
    }

    bot.setMyCommands([
        {command: '/start', description: 'Hello!'},
        {command: '/info', description: 'Information about user'},
        {command: '/game', description: 'Guess the number game'},
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === '/start') {
                await UserModel.create({chatId})
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.webp')
                return bot.sendMessage(chatId, `Welcome to LATOKEN Angry Chica bot`);
            }
            if (text === '/info') {
                const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Your name is ${msg.from.first_name} ${msg.from.last_name}, you got the guessed nimbers of ${user.right}, and mistargeted ${user.wrong}`);
            }
            if (text === '/game') {
                return startGame(chatId);
            }
            return bot.sendMessage(chatId, 'I dont understand you, please try again');
        } catch (e) {
            return bot.sendMessage(chatId, 'Ooops, something went wrong');
        }

    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again') {
            return startGame(chatId)
        }
        const user = await UserModel.findOne({chatId})
        if (data == chats[chatId]) {
            user.right += 1;
            await bot.sendMessage(chatId, `Congratulations! You have guessed the number! ${chats[chatId]}`, againOptions);
        } else {
            user.wrong += 1;
            await bot.sendMessage(chatId, `Unfortunately, you didn't guess the number ${chats[chatId]} :(`, againOptions);
        }
        await user.save();
    })
}

start()
