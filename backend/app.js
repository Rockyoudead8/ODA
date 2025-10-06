require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");
var indexRouter = require('./routes/index');
var infoRouter = require('./routes/GenerateInfo');
var submitRouter= require('./routes/submitQuiz');
var usersRouter = require('./routes/users');
var commentsRoute = require('./routes/comments');
const generateSoundRoute = require('./routes/generateSound');
var listingsRouter = require('./routes/listings');
var passport = require("passport");
var localStrategy = require("passport-local");
const cors = require('cors');
var app = express();

app.use(cors({
  origin: 'http://localhost:3000', // React's port
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
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: "adhakbaglgagfgfdf",
}));
// app.use(passport.initialize());
// app.use(passport.session());
// passport.serializeUser(usersRouter.serializeUser());
// passport.deserializeUser(usersRouter.deserializeUser()); 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




app.use('/', indexRouter);
app.use('/api/auth', usersRouter);
app.use('/api', listingsRouter);
app.use('/api/generate-sound', generateSoundRoute);
app.use('/api/comments', commentsRoute);
app.use('/api/generate_info', infoRouter);
app.use('/api/toggle-visit',usersRouter);
app.use('/api/submit_quiz',submitRouter);
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
