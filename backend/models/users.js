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
  lastSeen:{
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// passport can verify both username and email because of this configuration just pass as "name" from frontend and it will work for both username and email
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
// userSchema.plugin(passportLocalMongoose, { usernameField: 'name' });
module.exports = mongoose.model('User', userSchema);
