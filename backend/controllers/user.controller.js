//controllers/user.controller.js

import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import Profile from '../models/profile.model.js';
import ConnectionRequest from '../models/connections.model.js';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from "path";

// -- Function to convert user data to PDF and use it in downloadProfile controller--
const convertUserDataToPDF = async (userData) => {
    const doc = new PDFDocument({ margin: 50 });
    const outputPath = crypto.randomBytes(16).toString("hex") + ".pdf";
    const filePath = path.join("uploads", outputPath);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);
    const imagePath = path.join("uploads", userData.userId.profilePicture);
    if (fs.existsSync(imagePath)) {
        doc.image(imagePath, 230, 30, { width: 100 });
    }
    doc.moveDown(1);

    // --- Personal Details ---
    doc.fontSize(14).text(`Name: ${userData.userId.name}`);
    doc.fontSize(14).text(`Email: ${userData.userId.email}`);
    doc.fontSize(14).text(`Username: ${userData.userId.username}`);
    doc.moveDown(1);
    doc.fontSize(14).text(`Bio: ${userData.bio}`);
    doc.fontSize(14).text(`Current Postion: ${userData.currentPostion}`);
    doc.moveDown(2);

    // --- Past Work Experience ---
    doc.fontSize(16).text("Past Work Experience:", { underline: true });
    if (userData.pastWork && userData.pastWork.length > 0) {
        userData.pastWork.forEach((work, index) => {
            doc.fontSize(13).text(
                `${index + 1}. ${work.company} — ${work.role} (${work.years})`
            );
        });
    } else {
        doc.fontSize(12).text("No past work experience listed.");
    }
    doc.moveDown(2);

    // --- Education ---
    doc.fontSize(16).text("Education:", { underline: true });
    if (userData.education && userData.education.length > 0) {
        userData.education.forEach((edu, index) => {
            doc.fontSize(13).text(
                `${index + 1}. ${edu.degree} in ${edu.fieldOfStudy} — ${edu.institution}`
            );
        });
    } else {
        doc.fontSize(12).text("No education details listed.");
    }

    // --- Properly finalize and wait ---
    doc.end();

    await new Promise((resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
    });

    return outputPath;
};




// register controller
export const register = async (req,res)=> {
    try{
        const {name,email,password,username} = req.body;
        if(!name || !email || !password || !username){
            // console.log("req.body:", req.body);

            return res.status(400).json({message:"All fields are required"});
        }
        // Additional registration logic here
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message:"User already exists"});
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        const newUser = new User({name, email, password:hashedpassword, username});
        await newUser.save();
        

        // when registered sucessfully create profile for user
        const profile = new Profile({userId: newUser._id});
        await profile.save();
        return res.status(201).json({message:"User registered successfully"});
    }
    catch(err){
        return res.status(500).json({message:"Server error", error: err.message});
    }
}

// login controller

export const login = async (req,res)=>{
    // Login logic here
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message:"All fields are required"});
    }
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.status(400).json({message: "Inavalid credentials"});
        }
       const token = crypto.randomBytes(32).toString("hex");
       await User.updateOne({_id: user._id}, {token: token});
       return res.status(200).json({message:"Login successful", token: token});
    
    }catch(err){
        return res.status(500).json({message:"Server error", error: err.message});  
    }
}

// upload profile picture

export const uploadProfilePicture = async (req, res) => {
     const {token} = req.body;
    try{
        
       const user = await User.findOne({
        token: token
       })
       if(!user){
        return res.status(404).json({message:"User not found"});
       }
        user.profilePicture = req.file.filename;
     
       await user.save();
         return res.status(200).json({message:"Profile picture updated successfully"}); 

    }catch(err){
        return res.status(500).json({message:"Server error", error: err.message});
    }
}

// upload backdrop picture
export const uploadBackDropPicture = async (req, res) => {
    const {token} = req.body;
   try{
    const user = await User.findOne({
        token: token
       })
       if(!user){
        return res.status(404).json({message:"User not found"});
       }
       user.backdrop = req.file.filename;

     
       await user.save();
         return res.status(200).json({message:"Backdrop picture updated successfully"}); 

    }catch(err){
        return res.status(500).json({message:"Server error", error: err.message});
    }
}

// update username and email of user

export const updateUserProfile = async (req, res) => {
    try{
        const {token, ...newUserData} = req.body;
        const user = await User.findOne({token: token});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const {username, email} = newUserData;
        const existingUser = await User.findOne({$or: [{username}, {email}], _id: {$ne: user._id}});
        if(existingUser){
            if(existingUser || String(existingUser._id) !== String(user._id)){
                return res.status(400).json({message:"Username already in use"});
            }
        }
        Object.assign(user, newUserData);
        await user.save();
        return res.status(200).json({message:"User profile updated successfully"});
    }catch(err){
        return res.status(500).json({message:"Server error", error: err.message});
    }
}

// get user and profile details

export const getUserAndProfile = async (req, res) => {
    try {

        const authHeader = req.headers.authorization;
         const token = req.query.token || (authHeader && authHeader.split(' ')[1]);
        //  console.log("Token from getUserAndProfile controller:", token);
         //console.log("Headers:", req.headers);
          // console.log("Query:", req.query);
        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userProfile = await Profile.findOne({ userId: user._id })
            .populate('userId', 'name email username profilePicture backdrop');

        return res.status(200).json({
            user,
            profile: userProfile || { userId: user._id, bio: '', currentPost: '', pastWork: [], education: [] }
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};


export const updateProfileDetails = async (req, res) => {
    try {
        const { token, name, ...profileData } = req.body;

        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update name in User collection
        if (name) {
            user.name = name;
            await user.save();
        }

        // Update profile fields in Profile collection
        let profile = await Profile.findOne({ userId: user._id });
        if (profile) {
            Object.assign(profile, profileData);
            await profile.save();
        } else {
            profile = new Profile({ userId: user._id, ...profileData });
            await profile.save();
        }

        return res.status(200).json({
            message: "Profile details updated successfully",
            user,
            profile
        });
    } catch (err) {
        console.error("Error in updateProfileDetails:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// search users by name or username
export const getAllUserProfiles = async (req,res)=>{
    try{
        const profile = await Profile.find().populate('userId', 'name username email profilePicture');
        return res.status(200).json({profiles: profile});
    }catch(err){
        return res.status(500).json({message:"Server error", error: err.message});
    }
}



export const downloadProfile = async (req, res) => {
  try {

    // const { user_id } = req.query;
    // console.log("user_id from downloadProfile query:", user_id);
      const user_id = req.query.user_id || req.query.id;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const userProfile = await Profile.findOne({ userId: user_id })
      .populate('userId', 'name username email profilePicture');

    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    // console.log("userProfile found for downloadProfile:", userProfile);

    //  Generate PDF
    const pdfFileName = await convertUserDataToPDF(userProfile);
    const pdfFilePath = path.join("uploads", pdfFileName);

    // Check if file exists before sending
    if (!fs.existsSync(pdfFilePath)) {
      return res.status(500).json({ message: "Failed to generate PDF file" });
    }

    //  Send the generated PDF
    res.download(pdfFilePath, `${userProfile.userId.username}_profile.pdf`, (err) => {
      if (err) {
        console.error("Error sending PDF:", err);
      }
    
      fs.unlink(pdfFilePath, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting temp PDF:", unlinkErr);
      });
    });

  } catch (error) {
    console.error("Error generating profile PDF:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};




// send connection request to another user improved new version 
export const sendConnectionRequest = async (req, res) => {
    const { token, connectionId } = req.body;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user._id.toString() === connectionId) {
            return res.status(400).json({ message: "You cannot send request to yourself" });
        }

        const connectionUser = await User.findById(connectionId);
        if (!connectionUser) {
            return res.status(404).json({ message: "Connection user not found" });
        }

        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { userId: user._id, connectionId },
                { userId: connectionId, connectionId: user._id }
            ]
        });

        if (existingRequest) {
            if (existingRequest.status === "pending") {
                return res.status(400).json({
                    message: "Connection request already sent",
                    status: existingRequest.status,
                    requestId: existingRequest._id
                });
            }

            if (existingRequest.status === "rejected") {
                existingRequest.status = "pending";
                await existingRequest.save();
                return res.status(200).json({
                    message: "Connection request sent again",
                    status: existingRequest.status,
                    requestId: existingRequest._id
                });
            }

            if (existingRequest.status === "accepted") {
                return res.status(400).json({
                    message: "You are already connected",
                    status: existingRequest.status,
                    requestId: existingRequest._id
                });
            }
        }

        // No existing request → create new
        const request = new ConnectionRequest({
            userId: user._id,
            connectionId,
            status: "pending"
        });

        await request.save();

        return res.status(200).json({
            message: "Connection request sent successfully",
            status: request.status,
            requestId: request._id
        });

    } catch (err) {
        console.error("Error in sendConnectionRequest:", err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};


// get my connection requests => outgoing connection requests.(i am sending request)
export const getMyConnectionsRequests = async (req, res) => {
    const { token } = req.query;
    try{
        const user = await User.findOne({token});
        if(!user){
            return res.status(404).json({message:"User not found"});
        } 
           const connections = await ConnectionRequest.find({userId: user._id})
               .populate('connectionId', 'name username email profilePicture');
              return res.status(200).json({connections});
    }catch(err){
        return res.status(500).json({message:"Server error", error: err.message});
    }   
}

// incoming connection requests. 

export const whatAreMyConnections = async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const connections = await ConnectionRequest.find({
            connectionId: user._id,
        }).populate("userId", "name username email profilePicture");

        return res.status(200).json( connections);
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const acceptConnectionRequest = async (req, res) => {
    const { token, connection_id, action_type } = req.body;
    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        const connection = await ConnectionRequest.findById(connection_id);
        if (!connection) return res.status(404).json({ message: "Connection request not found" });

        if (action_type === 'accept') {
            connection.status = "accepted";
            await connection.save();
            const reverse = await ConnectionRequest.findOne({
                userId: connection.connectionId,
                connectionId: connection.userId
            });
            if (!reverse) {
                await ConnectionRequest.create({
                    userId: connection.connectionId,
                    connectionId: connection.userId,
                    status: "accepted"
                });
            }

        } else {
            connection.status = "rejected";
            await connection.save();
        }

        // 🔹 Return updated request object
        const updatedConnection = await ConnectionRequest.findById(connection_id)
            .populate("userId", "name username profilePicture")
            .populate("connectionId", "name username profilePicture");

        return res.status(200).json({
            message: "Connection request updated successfully",
            request: updatedConnection
        });

    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};



export const getUserProfileAndUserBasedOnUsername = async(req,res)=>{
    const {username} = req.query;

    try{
        const user = await User.findOne({
            username
        });
        if(!user){
            return res.status(404).json({ message: "User not found"});
        }
        const userProfile = await Profile.findOne({userId: user._id})
        .populate('userId', 'name username email profilePicture backdrop');

        return res.json({"profile": userProfile});
    }catch(err){
        return res.status(500).json({ message: "Server error", error: err.message });
    }
}