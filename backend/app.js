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
var geminiRoute = require('./routes/geminiRoute');
var QuizRouter = require('./routes/QuizResult');
const generateSoundRoute = require('./routes/generateSound');
var listingsRouter = require('./routes/listings');
var passport = require("passport");
var localStrategy = require("passport-local");
const userModel = require("./models/users");
const cors = require('cors');
var isLoggedIn = require('./middlewares/mw');
var app = express();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// require("./auth");

app.use(cors({
  origin: 'http://localhost:3000', // React's port
  credentials: true,
}));

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// session config
// session config (UPDATED)
app.use(session({
  secret: process.env.SESSION_SECRET || "adhakbaglgagfgfdf",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set true if using https
    // secure:true,
    sameSite: "lax", // important for localhost
  }
}));


// body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Passport config
app.use(passport.initialize());
app.use(passport.session());

passport.use(userModel.createStrategy()); // Local strategy (handled by passport-local-mongoose)
passport.serializeUser((user,done) => done(null,user.id));
passport.deserializeUser(async (id, done) => { 
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});


passport.use(new GoogleStrategy( {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },

  async function(accessToken, refreshToken, profile, done) { 
    
    try{    let user = await userModel.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value }
          ]
        });


    if(!user){
      // we are signing up the user 
      const newUser = new userModel({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
      })

      await newUser.save();
      return done(null,newUser);
    }
    else{
            // we are logining in the user 
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
            return done(null, user);
    }
  }
  catch(err){
    console.log("error occured");
    return done(err,null);
  }

  }

));


//logger
app.use(logger('dev'));

// routes
app.use('/', indexRouter);

app.use('/api/', listingsRouter);
app.use('/api/auth', usersRouter); // user auth routes 

app.use('/api/toggle-visit', usersRouter);

// app.use(isLoggedIn); // Middleware to check if user is logged in for all routes below this line 

app.use('/api/generate-sound', generateSoundRoute);
app.use('/api/get_visits',usersRouter);
app.use('/api', commentsRoute);
app.use('/api/generate_info', infoRouter);
app.use('/api/submit_quiz', submitRouter);
app.use("/api/upload", uploadRoutes);
app.use('/api/leaderboard', QuizRouter);
app.use('/api/geocode-cities',geminiRoute);




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

module.exports = app;
