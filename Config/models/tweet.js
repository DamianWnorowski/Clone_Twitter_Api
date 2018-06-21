module.exports = (mongoose = null) => {
    if(!mongoose) return null;
    const TweetSchema = new mongoose.Schema(
        {
            username: {
                type: String,
                required: true,
            },
            id: {
                type: String,
                required: true,
            },
            property: {
                likes: {
                    type: Number,
                    default: 0
                },
                peopleLiked:{
                    type:[String],
                    default:0
                }
            },
            childType: {
                type: String,
                default: null,
            },
            retweeted: {
                type: Number,
                default: 0
            },
            content: {
                type: String,
                required: true
            },
            timestamp: {
                type: Number,
                required:true,
            },
            parent: {
                type: String,
                default: null
            },
            media: {
                type: Array,
                default: null,
            },
        });
    
    return mongoose.model('Tweet', TweetSchema);
}