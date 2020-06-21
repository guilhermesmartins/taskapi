const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'holomariaserver@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Lemme know how you get along with the app.`,
        //html
    }).catch((error) => {
        console.log(error)
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'holomariaserver@gmail.com',
        subject: 'Thanks for everything!',
        text: `Thanks for going with us in this journey, ${name}
            I hope that we meet again soon`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail   
}