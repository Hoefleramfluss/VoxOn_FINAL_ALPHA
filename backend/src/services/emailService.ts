
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

// These are loaded from env variables
const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const EMAIL_USER = process.env.GMAIL_USER; // e.g. 'noreply@voiceomni.com'

const createTransporter = async () => {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        console.warn('Gmail API credentials missing. Email sending disabled.');
        return null;
    }

    const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    try {
        const accessToken = await new Promise((resolve, reject) => {
            oauth2Client.getAccessToken((err, token) => {
                if (err) {
                    reject("Failed to create access token: " + err);
                }
                resolve(token);
            });
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: EMAIL_USER,
                accessToken: accessToken as string,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN
            }
        });

        return transporter;
    } catch (e) {
        console.error("Email Transporter Error:", e);
        return null;
    }
};

export const sendEmail = async (to: string, subject: string, htmlBody: string) => {
    const transporter = await createTransporter();
    if (!transporter) return false;

    const mailOptions = {
        from: `VoiceOmni <${EMAIL_USER}>`,
        to,
        subject,
        html: htmlBody
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

export const sendWelcomeEmail = async (to: string, name: string) => {
    const body = `
        <h1>Welcome to VoiceOmni, ${name}!</h1>
        <p>We are thrilled to have you on board.</p>
        <p>You can now log in to your dashboard and start creating voice bots.</p>
        <br/>
        <p>Best,<br/>The VoiceOmni Team</p>
    `;
    return sendEmail(to, 'Welcome to VoiceOmni', body);
};
