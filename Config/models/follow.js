module.exports = (mongoose = null) => {
    if(!mongoose) return null;
    const FollowSchema = new mongoose.Schema(
        {
            username: { 
                type: String,
                required: true,
            },
            followers: {
                type: [String], 
                default: []
            },
            following: {
                type: [String],
                default: []
            },
            followerCount: {
                type: Number,
                default: 0
            },
            followingCount: {
                type: Number,
                default: 0
            }
        },
        {
            timestamps: true
        });
        
    return mongoose.model('Follow', FollowSchema);
}