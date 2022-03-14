const sgMail = require('@sendgrid/mail')

const sendGridAPIKey = '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'
sgMail.setApiKey(sendGridAPIKey)

sgMail.send({
    to: 'sarah.shakeel@synavos.com',
    from: 'sarah.shakeel@synavos.com',
    subject: 'My First Creation',
    text: 'I hope this one actually gets to you.'
}).then(() => {
    console.log('Message sent')
}).catch((error) => {
    console.log(error.response.body)
})