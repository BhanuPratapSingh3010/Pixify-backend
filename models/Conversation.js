const mongoose=require('mongoose');
const conversationSchema=new mongoose.Schema({
    members:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'users'
        }
    ],

    text:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'message'

    }]
})
module.exports=mongoose.model('conversation',conversationSchema)