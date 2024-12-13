const mongoose = require('mongoose');
const userSchema  = new mongoose.Schema({
    name:{
        type:String,
        minlength:3,
        required:[true,'name is required']
    },
    email:{
        type:String,
        required:[true,'email is required'],
        unique:true
    },
    password:{
        type:String,
        required:[true,'password is required']
    },
    profilePic:{
        type:String,
        default:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
    },
    coverPic:{
        type:String,
        default:"https://wallpapers.com/images/hd/horizontal-dark-grey-black-polysphere-cover-jty1jtzxbco9eik9.jpg"
    },
    address:{
        type:String,
    },
    resetPasswordToken:{
        type:String
    }
})

userSchema.add({
    resetPasswordToken:{
        type:String,
        default:null
    },
    resetPasswordExpires:{
        type:Date
    },
    bio:{
        type:String,
        default:""
    },
    followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }],
    following:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }],
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'posts'
    }]
})

module.exports = mongoose.model( 'users', userSchema)