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
    sendMail: function(emailAddress, datas, total) {
        ejs.renderFile(__dirname +'/email.ejs', {items: datas, total: total}, function (error, data) {
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
                        //console.log("success", result)
                        console.log("success")
                    }
                })

                
            }
        })
    }
}

module.exports = mailFunction