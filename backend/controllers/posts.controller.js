import User from '../models/user.model.js';
import Post from '../models/posts.model.js';
import Comment from '../models/comments.model.js';

export const activeCheck = async (req, res) => {
    return res.status(200).json({ message: "Posts route active" });
};

export const createPost = async (req, res) => {
    // Implementation for creating a post
    const {token} = req.body;
    try {
        const user = await User.findOne({token: token});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        // Create new post based on Post model
        const post = new Post({
            userId: user._id,
            body: req.body.body,
            media: req.file ? req.file.filename : '',
            fileType: req.file ? req.file.mimetype.split("/")[1] : ''
        });

        await post.save();
        return res.status(201).json({message:"Post created successfully", post: post});
    }
    catch(err){
        return res.status(500).json({message:"Server error", error: err.message});
    }

}


// see all posts with user details
export const getAllPosts = async (req, res) => {
    try{
        const posts = await Post.find().populate('userId', 'name username email profilePicture');   
        return res.status(200).json({posts});
    }catch(err){
        return res.status(500).json({message:"Server error", error: err.message});
    }   
} 

// delete a post
export const deletePost = async (req, res) => {
    const {token, post_id} = req.body;
    try{
        const user = await User.findOne({token: token})
        .select('_id');
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const post = await Post.findOne({_id: post_id});
        if(!post){
            return res.status(404).json({message:"Post not found"});
        }
        // check if the post belongs to the user who is trying to delete it
        if(post.userId.toString() !== user._id.toString()){
            return res.status(403).json({message:"Unauthorized to delete this post"});
        }
        await Post.deleteOne({_id: post_id});
        return res.status(200).json({message:"Post deleted successfully"});
    }catch(err){
        return res.status(500).json({message:"Server error", error: err.message});
    }   
}

export const commentPost = async (req, res) => {
    // Implementation for commenting on a post
    const {token, post_id, commentBody} = req.body;
    try {
        const user = await User.findOne({token: token}).select('_id');
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const post = await Post.findOne({_id: post_id});
        if(!post){
            return res.status(404).json({message:"Post not found"});
        }
   
        // create comment
        const comment = new Comment({
            postId: post._id,
            userId: user._id,
            body: commentBody,
        });
        await comment.save();
        return res.status(200).json({message:"Comment added successfully", comment: comment});
    }
    catch(err){
        return res.status(500).json({message:"Server error", error: err.message});
    }
}


// show all comments on a post when user clicks on comments
export const get_comment_by_post = async (req, res) => {
    const {post_id} = req.body;   
    try{
       const post = await Post.findOne({_id: post_id});
       if(!post){
        return res.status(404).json({message:"Post not found"});
       }
       const comments = await Comment.find({postId: post_id})
       .populate("userId","username name profilePicture");
       return res.json(comments.reverse());
    }

    catch(err){
        return res.status(500).json({message:"Server error", error: err.message});

    }
}

// delete own comment from a post
export const delete_comment_by_post = async (req, res) => {
    const {token, post_id, comment_id} = req.body;
    try{
        const user = await User.findOne({token: token}).select('_id');
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const comment = await Comment.findOne({_id: comment_id});
      
        if(!comment){
            return res.status(404).json({message:"Comment not found"});
        }
        // check if the comment belongs to the user who is trying to delete it  
        if(comment.userId.toString() !== user._id.toString()){
            return res.status(403).json({message:"Unauthorized to delete this comment"});
        }
        // yes, delete comment from Post's comments array
        await Comment.deleteOne({_id: comment_id});
        return res.status(200).json({message:"Comment deleted successfully"});

    }
    catch(err){
        return res.status(500).json({message:"Server error", error: err.message});
    }
}

// like on a post


export const increment_likes = async (req, res) => {
    const {post_id} = req.body;
    try{
   
        const post = await Post.findOne({_id: post_id});
        if(!post){
            return res.status(404).json({message:"Post not found"});
        }   
        post.likes += 1;
        await post.save();
        return res.status(200).json({message:"Post liked", likes: post.likes});
    }
    catch(err){
        return res.status(500).json({message:"Server error", error: err.message});
    }
}

// get recent posts for a recent activity section

export const getRecentPost = async (req, res) => {
    try {
        const { userId } = req.query;

        const recentPost = await Post.findOne({
            userId: userId,
            active: true
        })
            .sort({ createdAt: -1 }); // latest post

        res.status(200).json({
            success: true,
            data: recentPost
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
