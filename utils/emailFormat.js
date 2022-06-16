

module.exports = {
    emailWelcome: (name, email) => {
        return {
            from: 'Second Hand App',
            to: email,
            subject: 'Verify your email',
            text: `Welcome to Second Hand App,`,
            html: `<!doctype html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width">
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                        <title>Simple Transactional Email</title>
                    </head>
                    <body>
                        <p> Hello ${name}, Welcome to Second Hand App </p>
                    </body>
                    </html>`
        }
    },
    emailForgotPassword: (email, otp) => {
        return {
            from: 'Second Hand App',
            to: email,
            subject: 'Verify your email',
            text: `Welcome to Second Hand App,`,
            html: `<!doctype html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width">
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                        <title>Simple Transactional Email</title>
                    </head>
                    <body>
                    <!-- OTP -->
                        <p>Use this OTP to reset your password</p> 
                        <p>${otp}</p>
                    </body>
                    </html>`
        }
    }
}