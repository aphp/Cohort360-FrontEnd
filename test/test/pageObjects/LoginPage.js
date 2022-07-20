const Page = require('./Page')
const LoginLogout = require('../objects/LoginLogout')
const LegalNoticeBlock = require('../blockObjects/LegalNotice')

class LoginPage extends Page {
    
    get path () { return '' }

    get legalNoticeBlock () { return LegalNoticeBlock }
    
    get invalidCredentialsErrorMessageValue () { return 'Votre code APH ou votre mot de passe est incorrect' }
    get invalidCredentialsErrorMessage () { return $('#error-login-message') }

    get loginField () { return LoginLogout.loginField }
    get passwordField () { return LoginLogout.passwordField }
    get submitButton () { return LoginLogout.submitButton }
   
    
    async login (username, password) {
        await super.login(username, password)
    }

    open () {
        return super.open(this.path)
    }

    getUrl () {
        return super.getUrl(this.path)
    }

}

module.exports = new LoginPage()
