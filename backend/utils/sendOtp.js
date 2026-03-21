import twilio from 'twilio';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const sendOtp = async(phoneNumber, otp) => {
    await client.messages.create({
        body: `Your Salon password reset OTP is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber, // e.g. "+919876543210"
    });
};

export default sendOtp;