let userCollection=require('../models/userSchema')
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
var jwt = require('jsonwebtoken');
let JWT_SECRET = "secretkey963"
const nodemailer=require('nodemailer')
var randomstring = require("randomstring");


const registerUser=async(req,res)=>{
    const {name,email,password,address}=req.body
    console.log(req.body)
    if(!name || !email || !password || !address){
        return res.status(400).json({message:"Please fill all the fields"})
    }
    let user=await userCollection.findOne({email})
    if(user){
        return res.status(400).json({message:"User already exists"})
    }
    else{
        try {
            let hashPassword = bcrypt.hashSync(password, salt);
            const user=await userCollection.create({
                name,
                email,
                password:hashPassword,
                address})
            res.status(200).json({message:"User registered successfully",success:true,user})
        } catch (error) {
            res.status(500).json({message:"Internal server error",success:false,error})
        }
        
    }
    
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }

    try {
        // Attempt to find the user by email
        console.log("Starting user lookup...");
        const user = await userCollection.findOne({ email });
        console.log("User lookup completed");

        // Handle case where user does not exist
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        // Check password validity
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token upon successful login
        const token = jwt.sign({ email: user.email, _id: user._id }, JWT_SECRET);
        return res.status(200).json({ message: "User logged in successfully", success: true, token });

    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error during login:", error);

        // Respond with a generic error message to avoid revealing sensitive details
        res.status(500).json({ message: "Internal server error. Please try again later.", success: false });
    }
};






const updateUser=async(req,res)=>{
    const {name,password,profilePic,coverPic,bio} = req.body;
   const userId = req.params._id

   if(password){
    var hashedPassword = bcrypt.hashSync(password,salt)
   }

   console.log(hashedPassword)

   let data = await userCollection.findByIdAndUpdate(userId, {$set:{name,profilePic,coverPic,password:hashedPassword,bio}} ,{new:true})

   res.json({msg:"user updated successfully",success:true,user:data})
}
const deleteUser=async(req,res)=>{
    try {
        let paramId = req.params._id;

    let userId = req.user._id // this is get from token

    console.log("logged in userId = ", userId)
    console.log("user id you want to delete  = ", paramId)

    if(userId===paramId){
        console.log("you can delete")
        let data = await userCollection.findByIdAndDelete(userId)
        res.json({msg:"user deleted successfully",success:true})
    }
    else{
        console.log("you can delete only your account")
        res.json({msg:"not autherized to delete this account",success:false})
    }
    } catch (error) {
        res.json({msg:"error in deleting user",success:false ,error:error.message})
    }   

}

const getUserDetails=async(req,res)=>{
    let userId = req.user._id;
    try {
        let user  = await userCollection.findById(userId).select('-password');
    res.json({msg:"user fetched successfully", success:true,user})
    } catch (error) {
        res.json({msg:"error in getting user details",success:false ,error:error.message})
    }
}

const resetPassword=async(req,res)=>{
    let {email}=req.body;
    let user  = await userCollection.findOne({email});
    console.log("user = ",user)
    try {
        if(user){
            let reset_token=randomstring.generate(20);
            user.resetPasswordToken=reset_token;
            user.resetPasswordExpires=Date.now() + 3600000;
            await user.save();
            let sendmail=await sendMail(email,reset_token);//sendmail is a function which will send mail to user
            res.json({msg:"Please check your email to reset password",success:true})
    }
    else{
        res.json({msg:"user not found", success:false})

    }
}
    catch (error) {
        res.json({msg:"error in getting user details",success:false ,error:error.message})
    }
}

  async function sendMail(email,reset_token){
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
          user: "vs9232563@gmail.com",
          pass: "vukm xzzi wedx fomq",
        },
      });

      const info = await transporter.sendMail({
        from: 'vs9232563@gmail.com', // sender address
        to: email, // list of receivers
        subject: "Password Reset Request", // Subject line
        text: `Please click on the following link to reset your password: \n https://pixify-backend-phx3.onrender.com/user/forgetPassword/${reset_token}`, // plain text body
      });
    
      console.log("Message sent: %s", info.messageId);
   }


   const forgetPassword = async (req, res) => {
    let { resetToken } = req.params; // Token from URL

    try {
        // Find user by reset token
        const user = await userCollection.findOne({ resetPasswordToken: resetToken });
        let tokenDate=user.resetPasswordExpires
        let currentDate =Date.now();
        let timeDifference = currentDate - tokenDate;
        let timeInHour= timeDifference/3600000;
        if(timeInHour>1){
          return  res.send({ msg: "Token Expired! Valid for 1 hour only", success: false, error: "Token Expired" });
        }
        if(user){
            res.render('forgetPassword',{resetToken})
        }
    } catch (error) {
        // Handle errors
        console.error("Error in forgetPassword:", error);
        res.json({ msg: "Something went wrong", success: false, error: error.message });
    }
};

const updatePassword = async (req,res) => {
    let { resetToken } = req.params;
    let { password } = req.body;

    try {
        // Validate input
        if (!password) {
            return res.json({ msg: "Password is required", success: false });
        }

        // Find user by reset token
        const user = await userCollection.findOne({ resetPasswordToken: resetToken });

        if (!user) {
            return res.json({ msg: "User not found", success: false });
        }

        // Hash the new password
        const hashedPassword = bcrypt.hashSync(password, salt); // Use 10 as salt rounds

        // Update user's password and clear the reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;

        // Save changes
        await user.save();

        // Send success response
        res.json({ msg: "Password reset successfully", success: true });

    } catch (error) {
        // Handle errors
        console.error("Error in updatePassword:", error);
        res.json({ msg: "Something went wrong", success: false, error: error.message });
    }
};

const searchUser = async (req, res) => {
    let {q}=req.query;
    try {
        if(q.length>0){
            let regex = new RegExp(q, 'i');
        let users= await userCollection.find({name:regex}).select('name profilePic');
        res.json({msg:"fetched successfully",users,success:true});
        }
        else{
            res.json({msg:"No User Found",success:false});
        }

    }
    catch (error) {
        res.json({ msg: "something went wrong", success: false, error: error.message });
    }
}


const getSingleUser=async(req,res)=>{
    let {_id}=req.params;
    try {
        let user=await userCollection.findById(_id).select('-password');
        res.json({msg:"user fetched successfully",user,success:true});
    }
    catch (error) {
        res.json({ msg: "something went wrong", success: false, error: error.message });
    }
}

const followUser=async(req,res)=>{
    let userId=req.user._id;
    let {friendId}=req.params;

    let user=await userCollection.findById(userId);
    let friend=await userCollection.findById(friendId);


    try {
        if(!user.following.includes(friendId)){
            user.following.push(friendId);
            friend.followers.push(userId);
            await user.save();
            await friend.save();
            res.json({msg:"user followed successfully",success:true});
        }
        else{
            user.following.pull(friendId);
            friend.followers.pull(userId);
            await user.save();
            await friend.save();
            res.json({msg:"user unfollowed successfully",success:false});
        }
    } catch (error) {
        res.json({ msg: "error in following user", success: false, error: error.message });
    }
}

module.exports={
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getUserDetails,
    resetPassword,
    forgetPassword,
    updatePassword,
    searchUser,
    getSingleUser,
    followUser
}