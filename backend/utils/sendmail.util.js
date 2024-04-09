import nodeMailer from "nodemailer";

const sendEmail = async (options) => {
    const transporter = nodeMailer.createTransport({
        host:'smtp.gmail.com',
        port:465,
        // service: process.env.SMPT_SERVICE,
        service: 'yashpawar12122004@gmail.com',
        auth: {
            user: 'yashpawar12122004@gmail.com',
            // user: process.env.SMPT_MAIL,
            pass: 'nwxb yuwl uioz dzkc',
            // pass: 'yash1212204',
        },
    });

    const mailOptions = {
        from: 'yashpawar12122004@gmail.com',
        // from: process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;
