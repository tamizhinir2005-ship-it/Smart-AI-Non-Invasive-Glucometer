const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Check if credentials are placeholders
    const isPlaceholder = !process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your-email@gmail.com');

    if (isPlaceholder) {
        console.log('--- DEVELOPMENT MODE: Email content below ---');
        console.log('To:', options.email);
        console.log('Subject:', options.subject);
        console.log('Reset Link:', options.html.match(/href="([^"]+)"/)?.[1] || options.message);
        console.log('-------------------------------------------');
        return;
    }

    try {
        console.log('--- STARTING EMAIL SEND PROCESS ---');
        console.log(`Target: ${options.email}`);

        // Detailed Gmail Configuration
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const message = {
            from: `"GlucoTrack Support" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        console.log('Transporter created. Attempting to verify connection...');
        await transporter.verify();
        console.log('SMTP connection verified successfully.');

        console.log('Sending email...');
        const info = await transporter.sendMail(message);
        console.log('--- EMAIL SENT SUCCESSFULLY ---');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        console.log('-------------------------------');
    } catch (err) {
        console.error('--- NODEMAILER ERROR ---');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        console.error('Error Code:', err.code);
        console.error('------------------------');
        throw err;
    }
};

module.exports = sendEmail;
