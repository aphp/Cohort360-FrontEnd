const COHORT360_PARAMS = require('../params/cohort360-param.js')
const LoginLogout = require('../objects/LoginLogout')
const ModalBox = require('../objects/ModalBox')

module.exports = class Page {
    
    get baseURL () { return COHORT360_PARAMS.URL }
    
    // Fenêtre modale
    get modalBox () { return ModalBox }
    
    async login (username, password) {
        try {
            LoginLogout.login(username, password)
            await browser.waitUntil(() => browser.getUrl() === (this.baseURL + COHORT360_PARAMS.HOME_PAGE_PATH), { timeout: 3000 })
        }
        catch (error) {
            return false
        }
        return true
    }

    async logout () {
        try {
            LoginLogout.logout()
            await browser.waitUntil(() => browser.getUrl() === this.baseURL, { timeout: 3000 })
        }
        catch (error) {
            return false
        }
        return true
    } 

    open (path) {
        return browser.url(this.baseURL + path)
    }

    getUrl (path) {
        return this.baseURL + path
    }

    scrollToTop () { $('#root').scrollIntoView() }
    
}
