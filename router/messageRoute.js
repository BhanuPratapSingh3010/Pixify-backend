const express = require('express');
const router =express.Router();

const checkToken=require('../middleWare/checkToken');

const { sendMessage, getConversation } = require('../controllers/messageController');


router.post('/send/:receiverId', checkToken, sendMessage);

router.get('/getMessage/:receiverId',checkToken, getConversation)

module.exports = router