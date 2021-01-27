const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
    {
    username: {
        type: String,
        required: true,
        unique: true,
        min: 3,
        max: 25
    },
    email: {
        type: String,
        required: true,
        unique: true,
        min: 6,
        max: 255
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 8
    }
},
{timestamps: true}
);

module.exports = mongoose.model('User', UserSchema);
