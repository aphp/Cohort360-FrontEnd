const LeftMenu = require('./LeftMenu')
const COHORT360_PARAMS = require('../params/cohort360-param.js')

class LoginLogout {
    
    get loginField () { return $('#identifiant') }
    get passwordField () { return $('#password') }
    get submitButton () { return $('button[type="submit"]') }
    
    login (username, password) {
        
        if (username == null || password == null) {
            username = COHORT360_PARAMS.LOGIN
            password = COHORT360_PARAMS.PASSWORD
            console.log(`username est il appele 3 fois`, username)
            console.log(`password`, password)
        }

        if (browser.getUrl() != COHORT360_PARAMS.URL)
            browser.url(COHORT360_PARAMS.URL)

        /*if (browser.getUrl() != process.env.COHORT360_URL) {
            COHORT360_PARAMS.URL_TEST = process.env.COHORT360_URL
            browser.url(COHORT360_PARAMS.URL_TEST)
        }*/

        if (this.loginField.isDisplayed() && this.passwordField.isDisplayed()) {
            this.loginField.setValue(username)
            this.passwordField.setValue(password)
            this.submitButton.click()
        }
    }

    async logout () {
        await LeftMenu.open()
        await LeftMenu.logoutButton.click()
    }
}

module.exports = new LoginLogout()
