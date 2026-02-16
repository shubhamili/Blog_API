import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, html) => {


    // console.log('first', to, subject, html)


    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD // should be App Password
        }
    });


    // const d = await transporter.verify();
    // console.log("SMTP ready");
    // console.log("d hello :", d);



    await transporter.sendMail({
        from: `"Pustakalay" <${process.env.SMTP_EMAIL}>`,
        to,
        subject,
        html
    });
    // console.log("d:", d);

};

export default sendEmail;
