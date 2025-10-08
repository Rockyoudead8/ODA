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
var QuizRouter = require('./routes/QuizResult');
const generateSoundRoute = require('./routes/generateSound');
var listingsRouter = require('./routes/listings');
var passport = require("passport");
var localStrategy = require("passport-local");
const userModel = require("./models/users");
const cors = require('cors');
var isLoggedIn = require('./middlewares/mw');
var app = express();

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
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: "adhakbaglgagfgfdf",
}));

// body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Passport config
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());
passport.use(userModel.createStrategy());

//logger
app.use(logger('dev'));

// routes
app.use('/', indexRouter);

app.use('/api', listingsRouter);
app.use('/api/auth', usersRouter); // user auth routes 

app.use('/api/toggle-visit', usersRouter);

// app.use(isLoggedIn); // Middleware to check if user is logged in for all routes below this line

app.use('/api/generate-sound', generateSoundRoute);
app.use('/api/comments', commentsRoute);
app.use('/api/generate_info', infoRouter);
app.use('/api/submit_quiz', submitRouter);
app.use("/api/upload", uploadRoutes);
app.use('/api/leaderboard', QuizRouter);




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
