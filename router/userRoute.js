const express = require('express');
const { registerUser, loginUser, updateUser, deleteUser, getUserDetails, resetPassword, forgetPassword, updatePassword, searchUser, getSingleUser, followUser } = require('../controllers/userController');
const checkToken = require('../middleWare/checkToken');
const router = express.Router();


router.post('/create',registerUser);
router.post('/login',loginUser);
router.put('/update/:_id',updateUser);
router.delete('/delete/:_id',checkToken,deleteUser)
router.get('/getUser',checkToken,getUserDetails)
router.post('/resetPassword',resetPassword)
router.get('/forgetPassword/:resetToken',forgetPassword)
router.post('/forgetPassword/:resetToken',updatePassword)
router.get('/search',searchUser)
router.get('/getSingleUser/:_id',getSingleUser)
router.get('/follow/:friendId',checkToken,followUser)

module.exports = router



