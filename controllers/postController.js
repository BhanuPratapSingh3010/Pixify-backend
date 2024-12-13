let postCollection = require("../models/postSchema");

const createPost = async (req, res) => {
  const { title, description, file } = req.body;
  let id = req.user._id;

  try {
    let post = await postCollection.create({
      title,
      description,
      file,
      userId: id,
    });
    res.json({ msg: "post created successfully", success: true, post });
  } catch (error) {
    res.json({
      msg: "error in creating post",
      success: false,
      error: error.message,
    });
  }
};
const getAllPost = async (req, res) => {
  try {
    let post = await postCollection
      .find()
      .populate({ path: "userId", select: ["name", "profilePic"] }).populate({
        path: "comments",populate:{ path: "user", select: ["name", "profilePic"] }
      })
      ;
    res.json({ msg: "fetched successfully", success: true, post });
  } catch (error) {
    res.json({
      msg: "error in creating post",
      success: false,
      error: error.message,
    });
  }
};
const updatePost = async (req, res) => {
  res.send("update post running good");
};

const getUserPost=async(req,res)=>{
  let {userId}=req.params;
  try{
    let post=await postCollection.find({userId})
    res.json({msg:"fetched successfully",success:true,post})
    }catch(error){
      res.json({msg:"error in fetching post",success:false,error:error.message
        })
}
}

const likePost=async(req,res)=>{
  let {postId}=req.params;
  let userId=req.user._id
  console.log(userId)
  console.log("userId= ",userId)
  console.log("postId= ",postId)
  try{
    let post=await postCollection.findById(postId)
    if(post.likes.includes(userId)){
      post.likes.pull(userId)
      await post.save();
      res.json({msg:"unliked successfully",success:true,post})
    }else{
      post.likes.push(userId)
      await post.save();  
      res.json({msg:"liked successfully",success:true,post})
    }
  }
  catch{
    res.json({msg:"error in liking post",success:false,error:error.message})
  }  
}

const commentPost = async(req,res)=>{
  const {postId} = req.params;
  const userId = req.user._id;
  const {text} =  req.body;
  try {
     
  let post = await postCollection.findById(postId);

  post.comments.push({user:userId, text:text});
  await post.save();

  res.json({msg:"post commented successfully",success:true}); 
  } catch (error) {
      return res.json({msg:"error in like post ", success:false, error:error.message})
  }
}
const deletePost = async (req, res) => {
  const { postId } = req.params; // Extract postId from request parameters
  const userId = req.user._id; // Extract the logged-in user's ID from the request

  try {
    // Find the post by ID
    const post = await postCollection.findById({userId:postId});

    // Check if the post exists
    if (!post) {
      return res.json({
        msg: "Post not found",
        success: false,
      });
    }

    // Check if the logged-in user is the owner of the post
    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        msg: "You are not authorized to delete this post",
        success: false,
      });
    }

    // Delete the post
    await postCollection.findByIdAndDelete(postId);

    res.json({
      msg: "Post deleted successfully",
      success: true,
    });
  } catch (error) {
    res.json({
      msg: "Error in deleting post",
      success: false,
      error: error.message,
    });
  }
};
module.exports = {
  createPost,
  getAllPost,
  updatePost,
  deletePost,
  getUserPost,
  likePost,
  commentPost,
};
