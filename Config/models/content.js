module.exports = (mongoose) => {
    const ContentSchema = new mongoose.Schema(
        {
            content: {
                type: String,
            },
            tweetId: {
                type: String,
                required: true,
            }
        },
    )
    
    //Export 'Content' model
    return mongoose.model('Content', ContentSchema);
}