const jwt = require('jsonwebtoken')
let JWT_SECRET = "secretkey963"

const checkToken = async(req,res,next)=>{
   try {
    let token = req.headers.authorization;
    if(!token){
        return res.json({msg:"provide a token",success:false})
    }
    console.log(token)  
    let  decoded = jwt.verify(token, JWT_SECRET);  //  {_id,email}
    console.log(decoded)
    req.user = decoded; // {_id,email}
    console.log(decoded)
    next()

   } catch (error) {
        return res.json({msg:"token is not valid",success:false,error:error.message})
   }


    // next()
}

module.exports =checkToken


// let obj = {
//     name:"abc",
//     email:"abc@gmail.com"
// }
// obj.course='fullstack'
// console.log(obj)