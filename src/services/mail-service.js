// const ApiError = require("../core/api-errors")
const fs = require("fs")
const nodemailer = require("nodemailer")
const path = require("path")
const logger = require('logger')


const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.AUTH_EMAIL,
		pass: process.env.AUTH_PASS
	}
  });
  

const sendEmail = (to, subject, html) => {
  const mailOptions = {
	from: 'sarah.shakeel@synavos.com',
	to,
	subject,
	html
  };
  
transporter.sendMail(mailOptions, function(error, info){
	if (error) {
	  console.log(error);
	} else {
	  console.log('Email sent: ' + info.response);
	}
  });
}

const consumerForgotPasswordEmail = (to, resetToken) => new Promise(() => {
	let link = process.env.BASE_URL + "user/reset-password/"+resetToken
	_sendForgotPasswordEmail(to, link)
})

const adminForgotPasswordEmail = (to, resetToken) => new Promise(() => {
	let link = process.env.BASE_URL + "admin/reset-password/"+resetToken
	_sendForgotPasswordEmail(to, link)
})

const _sendForgotPasswordEmail = async (to, link) => {
	const subject = "Forget password"
	let anchorTag = "<a style=\" text-decoration: none !important; font-weight: bold; color: black;\" href="+link+">Reset Your Password</a>"
	console.log(link)
	let html = fs.readFileSync(path.join(__dirname, "/", "../views/reset-password-link.html"), "utf8")
	html = html.replace("##link##", anchorTag)

	sendEmail(to, subject, html)
}

module.exports = {
	sendEmail,
	consumerForgotPasswordEmail,
	adminForgotPasswordEmail
}