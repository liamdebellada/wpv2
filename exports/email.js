//required packages for mail
var fs = require("fs");
var nodemailer = require("nodemailer");
var ejs = require("ejs");

//email config
const transporter = nodemailer.createTransport({
    host: 'smtp.livemail.co.uk',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'support@worldplugs.net', // your domain email address
      pass: 'i8pqjk$dw42tog16y1G8G$Zf' // your password
    }
});

var mailFunction  = {
    sendMail: function(emailAddress, datas, total, purchaseID) {
        ejs.renderFile(__dirname +'/email.ejs', {items: datas, total: total, purchaseID: purchaseID}, function (error, data) {
            if (error) {
                console.error(error)
            } else {
                const mailOptions = {
                    from: 'support@worldplugs.net',
                    to: emailAddress,
                    subject: 'Thank you for your order!',
                    html: data
                };

                transporter.sendMail(mailOptions, function (error, result) {
                    if (error) {
                        console.error(error)
                    } else {
                        console.log("success")
                    }
                })

                
            }
        })
    }
}

module.exports = mailFunction