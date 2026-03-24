const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const userModel = require("../models/users.js");

// verification of jwt token from the user request header and fetching the user details from the database using the id in the token payload
// for both token and cookies extraction from the request, we will use the ExtractJwt.fromExtractors method to combine both extractors. This way, the strategy will check for the token in both places and authenticate the user accordingly.

const cookieExtrator = function(req){
        let token = null;
        if(req && req.cookies){
            token = req.cookies.jwt;
        }
        return token;
    };

const options = {
    jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtrator,
    ]),
    secretOrKey: process.env.JWT_SECRET,
}

// const strategy = new JwtStrategy(options, async (payload, done) => {

//     const user = await userModel.findById(payload.id);
//     try{

//         if(user){
//             return done(null, user);
//         }  
//         else{
//             return done(null, false);
//         }

//     }
//     catch(error){
//         return done(error, false);
//     }

// }); 

const strategy = new JwtStrategy(options, async (payload, done) => {
    try {
        // 1. Log the payload to see if the token is even being decoded
        console.log("JWT Payload received:", payload);

        // 2. Try to find the user (Search for both .id and ._id just in case)
        const userId = payload.id || payload._id;
        const user = await userModel.findById(userId);

        if (user) {
            return done(null, user);
        } else {
            console.log("Passport: User not found in DB");
            return done(null, false);
        }
    } catch (error) {
        console.error("Passport Strategy Error:", error); // This will finally show in your terminal
        return done(error, false);
    }
});

module.exports = (passport) => {
    passport.use(strategy); 
}