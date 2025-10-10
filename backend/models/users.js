const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  // password: {
  //   type: String,
  //   required: true
  // },

  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },

  profilePhoto: {
    type: String,
    default: '',
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'instructor'],
    default: 'user'
  },
  bio: {
    type: String,
  },
  defaultCity: {
    type: String,
  },
  citiesVisited: {
    type: Number,
    default: 0
  },
  visitedCities: [
    {
      type: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
module.exports = mongoose.model('User', userSchema);
