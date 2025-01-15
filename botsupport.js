require("dotenv").config();

//telegram api
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const router = require('./botsupport/routes/index')
const path = require('path')
const axios = require("axios");
const { Op } = require('sequelize')

const token = process.env.TELEGRAM_API_TOKEN

//функции
const sendMyMessage = require('./bot/common/sendMyMessage')
const sendMessageAdmin = require('./bot/common/sendMessageAdmin')

const botsupport = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.resolve(__dirname, 'static')))
app.use('/', router)

//подключение к БД PostreSQL
const sequelize = require('./botsupport/connections/db')
const { UserBot, Conversation, Message } = require('./botsupport/models/models');

//socket.io
const {io} = require("socket.io-client")
const socketUrl = process.env.SOCKET_APP_URL



// Certificate
const privateKey = fs.readFileSync('privkey.pem', 'utf8'); //fs.readFileSync('/etc/letsencrypt/live/proj.uley.team/privkey.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8'); //fs.readFileSync('/etc/letsencrypt/live/proj.uley.team/cert.pem', 'utf8');
const ca = fs.readFileSync('chain.pem', 'utf8'); //fs.readFileSync('/etc/letsencrypt/live/proj.uley.team/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

const httpsServer = https.createServer(credentials, app);

botsupport.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const firstname = msg.from.first_name
    const lastname = msg.from.last_name
    const text = msg.text ? msg.text : '';
    const messageId = msg.message_id;
    const username = msg.from.username ? msg.from.username : ''

    //console.log("msg: ", msg)
    //console.log("text: ", text)

    try {
        // обработка команд
        // команда Старт
        if (text === '/start') {
            // 1 (пользователь бота)
            //добавить пользователя в бд
            const user = await UserBot.findOne({where:{chatId: chatId.toString()}})
            if (!user) {
                console.log('Начинаю сохранять данные пользователя...')
                await UserBot.create({ firstname: firstname, lastname: lastname, chatId: chatId, username: username })
                console.log('Пользователь добавлен в БД')
            } else {
                console.log('Отмена добавления в БД. Пользователь уже существует')
                
                console.log('Обновление ника...', username)
                const res = await UserBot.update({ 
                    username: username,
                },
                { 
                    where: {chatId: chatId.toString()} 
                })
            }
        }


//----------------------------------------------------------------------------------------------------------------      
        
        //обработка сообщений    
        if ((text || '')[0] !== '/' && text) {       
            if (text.startsWith("Reply")) {           
                await bot.sendMessage(text.substring(6, text.indexOf('.')), text.slice(text.indexOf('.') + 2)) 

            // Специалист успешно создан
            } else if (text.startsWith('Данные успешно добавлены!')) {           
            
            } else {
//----------------------------------------------------------------------------------------------------------------
                //отправка сообщения 
                // Подключаемся к серверу socket
                let socket = io(socketUrl);
                socket.emit("addUser", chatId)   

                //добавление пользователя в БД USERBOT
                const user = await UserBot.findOne({where:{chatId: chatId.toString()}})
                if (!user) {
                    await UserBot.create({ firstname: firstname, lastname: lastname, chatId: chatId, username: username })
                    console.log('Пользователь добавлен в БД UserBots')
                } else {
                    console.log('Отмена операции! Пользователь уже существует в Userbots')
                    await UserBot.update({ username: username }, {
                        where: {
                          chatId: chatId.toString(),
                        },
                    });
                }


                //приветствие
                let hello = ''
                const currentDate = new Date()
                const currentHours = new Date(new Date().getTime()+10800000).getHours()

                const countAll = await Message.count({
                    where: { senderId: chatId.toString() },
                });
                const messages = await Message.findAll({
                    order: [
                        ['id', 'ASC'],
                    ],
                    where:{senderId: chatId.toString()}, 
                    offset: countAll > 50 ? countAll - 50 : 0,
                })
                const messagesAll = JSON.parse(JSON.stringify(messages))
                const mess = messagesAll.find((item)=> item.createdAt.split('T')[0] === currentDate.toISOString().split('T')[0])
                //console.log("mess: ", mess)          
                if (mess) {
                    console.log("сегодня были сообщения")
                } else { 
                    if (currentHours >= 6 && currentHours < 12) {
                        hello = 'Доброе утро'
                    } else if (currentHours >= 12 && currentHours < 18) {
                        hello = 'Добрый день'
                    } else if (currentHours >= 0 && currentHours < 6) {
                        hello = 'Доброй ночи'
                    } else {
                        hello = 'Добрый вечер' //18-0
                    }                    
                        
                }

                //-------------------------------------

                //обработка пересылаемых сообщений
                let str_text;
                let reply_id;
                if (msg.reply_to_message) {
                    const message = await Message.findOne({where:{messageId: msg.reply_to_message.message_id.toString()}}) 
                   str_text = `${message.dataValues.text}_reply_${text}`  
                   reply_id = msg.reply_to_message.message_id              
                } else {
                    str_text = text
                }

                // сохранить отправленное боту сообщение пользователя в БД
                const convId = sendMyMessage(str_text, 'text', chatId, messageId, reply_id)

                socket.emit("sendMessageSpec", {
                    senderId: chatId,
                    receiverId: chatTelegramId,
                    text: str_text,
                    type: 'text',
                    convId: convId,
                    messageId: messageId,
                    replyId: reply_id,
                })
            

                //await bot.sendMessage(chatId, 'Я принял ваш запрос!')
                //await bot.sendMessage(chatTelegramId, `${text} \n \n от ${firstname} ${lastname} ${chatId}`)           
            }
        }

        //обработка изображений
        if (msg.photo) {
            //await bottest.sendMessage(chatId, `Ваше фото получено!`)
        }

        //обработка аудио сообщений
        if (msg.voice) {

        }

        //обработка контактов
        if (msg.contact) {

        }

    } catch (error) {
        console.log('Произошла непредвиденная ошибка! ', error.message)
    }
    
});

//-------------------------------------------------------------------------------------------------------------------------------
const PORT = process.env.PORT || 8081;

const start = async () => {
    try {

        await sequelize.authenticate()
        await sequelize.sync()
        
        httpsServer.listen(PORT, async() => {
            console.log('HTTPS Server BotSupport running on port ' + PORT);

        });

    } catch (error) {
        console.log('Ошибка!', error.message)
    }
}

start()