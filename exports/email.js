//required packages for mail
var fs = require("fs");
var nodemailer = require("nodemailer");
var ejs = require("ejs");

//email config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nwilliamspe@gmail.com',
        pass: 'ycSZ7O2Z$LqP'
    }
});

var mailFunction  = {
    sendMail: function(emailAddress, productname) {
        ejs.renderFile(__dirname +'/email.ejs', {name: productname}, function (error, data) {
            if (error) {
                console.error(error)
            } else {
                const mailOptions = {
                    from: 'nwilliamspe@gmail.com',
                    to: emailAddress,
                    subject: 'WorldPlugs order success!',
                    html: data
                };

                transporter.sendMail(mailOptions, function (error, result) {
                    if (error) {
                        console.error(error)
                    } else {
                        console.log("success", result)
                    }
                })

                
            }
        })
    }
}

module.exports = mailFunction