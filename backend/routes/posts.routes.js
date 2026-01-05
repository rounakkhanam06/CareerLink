import { Router } from 'express';
import { activeCheck, commentPost, createPost, deletePost, getAllPosts, get_comment_by_post,  delete_comment_by_post,  getRecentPost, increment_likes } from '../controllers/posts.controller.js'; // note .js
import multer from 'multer';



const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
        cb(null, 'uploads/');  
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); 
    },
});
const upload = multer({ storage: storage });

router.get('/', activeCheck); 
router.route("/post").post(upload.single('media'), createPost);
router.route("/posts").get(getAllPosts);
router.route("/delete_post").delete(deletePost); 
router.route("/comment_post").post(commentPost);   
router.route("/get_comments").post(get_comment_by_post);
router.route("/delete_comment").post(delete_comment_by_post);

router.route("/increment_post_likes").post(increment_likes);
router.route("/recent-post").get(getRecentPost);


export default router;
