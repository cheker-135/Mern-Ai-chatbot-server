import mongoose from "mongoose";
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    profileImg: {
        type: String,
    },
    isAdmin: {
       type: Boolean,
       default: false, // Default value for isAdmin is false
   },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    resetToken: {
        type: String,
    },
    expireAccessToken: [
        {
            type: Object,
        },
    ],
    expireRefreshToken: [
        {
            type: Object,
        },
    ],
    chatHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "ChatHistory",
        },
    ],
    maxRateLimit: {
        type: Number,
        default: 10,
    },
    currentLimit: {
        type: Number,
        default: 0,
    },
    recentRateLimitTime: {
        type: Number,
        default: 0,
    },
});
export default  mongoose.model("User", userSchema);
//# sourceMappingURL=user.js.map
