const express = require('express');
const router = express.Router();
const sendVerificationEmail = require("../utils/verifyEmail");

router.post("/", async (req,res)=>{
    const {email,name} = req.body;

    const resp = await sendVerificationEmail(name,email);

    if(resp.ok){
        return res.status(200).json({message: "OTP sent successfully"});
    }
    else{
        return res.status(500).json({message: "Error sending OTP"});
    }

});

module.exports = router;