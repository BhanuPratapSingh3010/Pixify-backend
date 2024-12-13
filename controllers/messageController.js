const Conversation = require("../models/Conversation");
const Message = require('../models/Messages')

const sendMessage = async(req,res)=>{
    let sender = req.user._id;
    console.log(sender)
    const {receiverId} = req.params
    console.log(receiverId)
    const {text} = req.body;
    console.log(text)

    let message = await Message.create({
        sender:sender,
        receiver:receiverId,
        text
    })

  try {
    let conversation = await Conversation.findOne({members:{$all:[sender,receiverId]}})

    if(!conversation){
        conversation = await Conversation.create({
            members:[sender,receiverId],
        })
    }

  

    conversation.text.push(message._id)
    await conversation.save();

    res.json({msg:"msg send successfully", success:true, conversation,text})
  } catch (error) {
    res.json({msg:"error in sending message", success:false , error:error.message})
  }


}


const getConversation = async(req,res)=>{
    let userId = req.user._id;
    console.log(userId)
    const {receiverId} = req.params
    console.log(receiverId)
    try {
      let conversation = await Conversation.findOne({members:{$all:[userId,receiverId]}}).populate({path:'members',select:['name', 'profilePic']}).populate({path: 'text'});

    if(conversation){
      res.json({msg:"Chat found successfully", success:true, chat:conversation.text})
    }
    else{
      res.json({msg:"Chat not found", success:false,chat:[]})
}
    }
    catch (error) {
      res.json({msg:"error in getting chat", success:false , error:error.message})
    }
}






module.exports = {
    sendMessage,
    getConversation
}