const sequelize = require('../connections/db')
const {DataTypes} = require('sequelize')

const UserBot = sequelize.define('userbot', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    firstname: {type: DataTypes.STRING},
    lastname: {type: DataTypes.STRING},
    chatId: {type: DataTypes.STRING, unique: true},
    username: {type: DataTypes.STRING},
    avatar: {type: DataTypes.STRING},
})

const Message = sequelize.define('message', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    conversationId: {type: DataTypes.STRING},
    senderId: {type: DataTypes.STRING},
    receiverId: {type: DataTypes.STRING},    
    text: {type: DataTypes.STRING}, //текст сообщения;
    type: {type: DataTypes.STRING},      //тип сообщения;
    is_bot: {type: DataTypes.BOOLEAN},
    messageId: {type: DataTypes.STRING},
    buttons: {type: DataTypes.STRING},   //названия кнопок;
    replyId: {type: DataTypes.STRING}, //id пересылаемого сообщения
})

const Conversation = sequelize.define('conversation', {
    members: {type: DataTypes.ARRAY(DataTypes.STRING)},
})

const Manager = sequelize.define('manager', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    fio: {type: DataTypes.STRING},
    chatId: {type: DataTypes.STRING, unique: true},
    phone: {type: DataTypes.STRING}, //телефон менеджера
    phone2: {type: DataTypes.STRING}, //телефон менеджера
    city: {type: DataTypes.STRING},
    dolgnost: {type: DataTypes.STRING}, 
    companyId: {type: DataTypes.STRING}, // id заказчика  
    projects: {type: DataTypes.STRING},
    email: {type: DataTypes.STRING}, //почта менеджера
    avatar: {type: DataTypes.TEXT},
    userId: {type: DataTypes.STRING}, 
})


module.exports = {
    UserBot, 
    Message, 
    Conversation, 
    Manager,
}