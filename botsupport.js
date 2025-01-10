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

const botsupport = new TelegramBot(token, {polling: true});
const app = express();

app.use(statusMonitor({
    title: 'Бот поддержки',
    theme: '../../../../../custom.css',
})); // Enable Express Status Monitor middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.resolve(__dirname, 'static')))
app.use('/', router)

//подключение к БД PostreSQL
const sequelize = require('./botsupport/connections/db')

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

bottest.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const firstname = msg.from.first_name
    const lastname = msg.from.last_name
    const text = msg.text ? msg.text : '';
    const messageId = msg.message_id;

    //console.log("msg: ", msg)
    //console.log("text: ", text)

    try {
        // обработка команд
        // команда Старт
        if (text === '/start') {
        
        }


//----------------------------------------------------------------------------------------------------------------      
        
        //обработка сообщений    
        if ((text || '')[0] !== '/' && text) {       
      
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