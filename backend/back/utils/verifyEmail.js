const nodemailer = require("nodemailer");
const otpModel = require("../models/otp");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEM_EMAIL,
        pass: process.env.NODEM_PASSWORD
    }
});

async function sendVerificationEmail(name,email) {
    console.log(`Sending verification email to ${email} with name ${name}`);

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

        const otpsent = new otpModel({
            email: email,
            otp: otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // OTP expires in 5 minutes
        })

        await otpsent.save();

        console.log(`Sending verification email to ${email} with OTP ${otp}`);

        const response = await transporter.sendMail({
            from: process.env.NODEM_EMAIL,
            to: email,
            subject: "Verify Your Email",
             html: `
                <h2>Email Verification</h2>
                <p>Your OTP code is:</p>
                <h1>${otp}</h1>
                <p>This code will expire in 5 minutes.</p>
            `
        });

        console.log("Verification email sent:");
        
        return {
            ok: true,
        };

    } catch (error) {
        console.error(error.message);
        return {ok: false};
    }
}

module.exports = sendVerificationEmail;