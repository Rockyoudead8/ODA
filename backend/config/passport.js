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

const strategy = new JwtStrategy(options, async (payload, done) => {

    const user = await userModel.findById(payload.id);
    try{

        if(user){
            return done(null, user);
        }  
        else{
            return done(null, false);
        }

    }
    catch(error){
        return done(error, false);
    }

}); 

module.exports = (passport) => {
    passport.use(strategy); 
}