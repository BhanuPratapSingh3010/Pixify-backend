const mongoose = require('mongoose');
require('dotenv').config();

const connectToDb = ()=>{
    mongoose.connect(`mongodb+srv://${process.env.MongoDbUserName}:${process.env.MongoDbPassword}@chat.vnnhw.mongodb.net/?retryWrites=true&w=majority&appName=chat`)
    .then(()=> console.log('mongodb is connected successfully'))
    .catch((err)=>console.log(err))
}

module.exports = connectToDb


