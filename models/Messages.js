const mongoose=require('mongoose');

const messageSchema=mongoose.Schema({
    sender:{
        type:String,
        required:true
    },
    receiver:{
        type:String,
        required:true
    },
    text:{
        type:String,
        required:true
    },
    
},
{timestamps:true}
)

module.exports=mongoose.model('message',messageSchema);