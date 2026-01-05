import { Router } from 'express';
import { register,
        login,
        updateUserProfile, 
        getUserAndProfile, 
        updateProfileDetails, 
        getAllUserProfiles,
        downloadProfile, 
         sendConnectionRequest, 
         getMyConnectionsRequests, 
         acceptConnectionRequest, 
         whatAreMyConnections, 
         getUserProfileAndUserBasedOnUsername, 
         uploadProfilePicture, 
         uploadBackDropPicture} from '../controllers/user.controller.js';
import multer from 'multer';

const router = Router();

// Multer setup for profile pics
const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// Routes
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/upload_profile_picture').post(upload.single('profilePicture'), uploadProfilePicture);
router.route('/upload_backdrop_picture').post(upload.single('backdrop'), uploadBackDropPicture);
router.route('/user_update').post(updateUserProfile);
router.route('/get_user_and_profile').get(getUserAndProfile);
router.route('/update_profile_details').post(updateProfileDetails);
router.route('/user/get_all_users').get(getAllUserProfiles);
router.route('/user/download_resume').get(downloadProfile);
router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/getConnectionRequest").get(getMyConnectionsRequests);
router.route("/user/user_connection_requests").get(whatAreMyConnections);
router.route("/user/accept_connection_request").post(acceptConnectionRequest);
router.route("/user/get_profile_based_on_username").get(getUserProfileAndUserBasedOnUsername);



export default router;
