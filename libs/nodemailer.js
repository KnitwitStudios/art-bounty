const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'knitwitgame@gmail.com',
    pass: 'XXXXXXXXXXXX'
  }
});

let mailOptions = {
  from: 'knitwitgame@gmail.com',
  to: '',
  subject: 'Your KWS Art Bounty User ID',
  text: ''
};

const messageIntro = "Hello! You've requested an user id to use Knitwit Studios. ";
const positiveOutro = messageIntro + "Your user-id is: ";


exports.sendEmailWithUserId = (userEmail, userId) => {
    mailOptions.to = userEmail;
    mailOptions.text = positiveOutro + userId;

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            throw error;
        }
    });
}
