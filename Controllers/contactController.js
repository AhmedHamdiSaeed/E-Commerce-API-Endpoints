// controllers/emailController.js

const nodemailer = require('nodemailer');
const Email = require('../models/contact');

exports.sendEmail = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Save email data to MongoDB
    const newEmail = await Email.create({ name, email, message });
    console.log('Email saved:', newEmail);

    // Send the email using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'radwareda442@gmail.com', 
        pass: 'qwhf fxxh jvfw rjld' 
      }
    });

    const mailOptions = {
      from: 'radwareda442@gmail.com',
      to: email,
      subject: 'Your Subject Here',
      text: message
    
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (info) {
        console.log('Email sent: ' + info.response);
        res.send('Email sent and saved successfully');
        res.json(info.response);
      }
    });
  } catch (error) {
    console.error('Error saving email:', error);
    res.status(500).json({ error: error.message });
  }
};
