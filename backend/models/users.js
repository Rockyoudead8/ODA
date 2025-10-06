const mongoose = require("mongoose");



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
  password: {
    type: String,
    required: true
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
  bio:{
    type :String,
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

module.exports = mongoose.model('User', userSchema);
