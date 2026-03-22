require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");
var indexRouter = require('./routes/index');
var infoRouter = require('./routes/GenerateInfo');
var submitRouter = require('./routes/submitQuiz');
var usersRouter = require('./routes/users');
var uploadRoutes = require('./routes/upload');
var commentsRoute = require('./routes/comments');
var communityRoutes = require('./routes/community');
var geminiRoute = require('./routes/geminiRoute');
var QuizRouter = require('./routes/QuizResult');
const placesRoutes = require("./routes/places");
const sendOTPRouter = require("./routes/sendOTP");
const MessageRouter = require("./routes/message.route.js");
const GroupRouter = require("./routes/group_route.js");


const generateSoundRoute = require('./routes/generateSound');
var listingsRouter = require('./routes/listings');
var passport = require("passport");
var localStrategy = require("passport-local");
const userModel = require("./models/users");
const cors = require('cors');
var isLoggedIn = require('./middlewares/mw');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt_strategy = require("./config/passport");
const {app, server} = require("./config/socket");

// const app = require("./config/socket").app;
console.log("APP FILE STARTED");

// cors // 
app.use(cors({
  origin: 'http://localhost:3000', // React's port
  credentials: true
}));

const mongoose = require('mongoose');

const connectDB = () => {
  mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err.message));
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Passport config
app.use(passport.initialize());

passport.use(userModel.createStrategy()); // Local strategy (handled by passport-local-mongoose)

jwt_strategy(passport); // JWT strategy for protected routes

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
},

  async function (accessToken, refreshToken, profile, done) {

    try {
      let user = await userModel.findOne({
        $or: [
          { googleId: profile.id },
          { email: profile.emails[0].value }
        ]
      });


      if (!user) {
        // we are signing up the user 
        console.log(profile);
        const newUser = new userModel({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
        })

        await newUser.save();
        return done(null, newUser);
      }
      else {
        // we are logining in the user 
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      }
    }
    catch (err) {
      console.log("error occured");
      return done(err, null);
    }

  }

));


//logger
app.use(logger('dev'));

// routes
app.use('/', indexRouter);

app.use('/api/', listingsRouter);
app.use('/api/auth', usersRouter); // user auth routes 
app.use('/api', usersRouter); // for visit tracking routes like toggle-visit and check-visit
app.use("/api/auth/send-otp", sendOTPRouter);
// app.use('/api/toggle-visit', usersRouter);
// app.use('/api/check-visit', usersRouter);

// app.use(isLoggedIn); // Middleware to check if user is logged in for all routes below this line 

app.use('/api/generate-sound', generateSoundRoute);
// app.use('/api/get_visits',usersRouter);
app.use('/api', commentsRoute);
app.use('/api/generate_info', infoRouter);
app.use('/api/submit_quiz', submitRouter);
app.use("/api/upload", uploadRoutes);
app.use('/api/leaderboard', QuizRouter);
app.use('/api/geocode-cities', geminiRoute);

// for the commuinity page
app.use("/api/community", communityRoutes);

// for fetching places from geoapify and caching them in MongoDB
app.use("/api/places", placesRoutes);

app.use("/api/messages",MessageRouter);
app.use("/api/groups", GroupRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(8000, () => {
  console.log("Server started on port 8000");
  connectDB();
});

module.exports = app;