import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
    {
        userId: {     //sender
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        connectionId: {     //reciever
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending"
        }
    },
    { timestamps: true }
);

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionSchema);
export default ConnectionRequest;
