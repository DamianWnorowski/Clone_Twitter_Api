const bcrypt = require('bcrypt');
const config = require('../settings/main');

module.exports = (mongoose) => {
    const UserSchema = new mongoose.Schema(
        {
            username: { 
                type: String,
                required: true
            },
            email: { 
                type: String,
                required: true
            },
            password: {
                type: String,
                required: true
            },
            key: {
                type: String
            },
            isVerified: {
                type: Boolean, 
                default: false
            },
        },
        {
            timestamps: true
        });
        
    //Called before saving User data
    UserSchema.pre('save', function(next) {
        const user = this;
        const saltRounds = config.passwordSaltRounds;
        //If password is not new and has not been modified, skip hashing
        if (!user.isModified('password')) return next();
        
        bcrypt.hash(user.password, saltRounds, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    })
    
    //Method for comparing passwords, expects 'next' to be a function with parameters (err:Error, match:bool)
    UserSchema.methods.verifyPassword = function (submittedPassword, next) {
        bcrypt.compare(submittedPassword, this.password, (err, match) => {
            if (err) { return next(err); }
            next(null, match);
        });
    };
    
    //Export 'User' model
    return mongoose.model('User', UserSchema);
}