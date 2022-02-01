const COHORT360_PARAMS = require('../params/cohort360-param.js')

class LeftMenu {
    
    get openButton () { return $('.MuiDrawer-paper button.MuiButtonBase-root:nth-child(2)') }
    get reduceButton () { return $('.MuiDrawer-paper button.MuiButtonBase-root:nth-child(2)') }
    
    get logo () { return $('.jss23 > img:nth-child(1)') }
    
    get user () { return $('.MuiGrid-grid-xs-10') }
    get logoutButton () { return $('ul.MuiList-root.MuiList-padding li.MuiListItem-root.MuiListItem-gutters div.MuiGrid-root.MuiGrid-container.MuiGrid-wrap-xs-nowrap.MuiGrid-align-items-xs-center.MuiGrid-justify-content-xs-space-between div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-grid-xs-2 div.MuiListItemIcon-root button[type="button"].MuiButtonBase-root.MuiIconButton-root') }
    
    get newCohortButton () { return $('button.MuiButton-root') }
    // get newCohortPlusLink () { return $('a.MuiTypography-root:nth-child(1)') }
    get newCohortPlusLink () { return $('button.MuiButton-root:nth-child(1)') }
    
    get homeButton () { return $('div.MuiButtonBase-root:nth-child(4)') }
    
    get myPatientsButton () { return $('#patients') }
    get myPatientsBlock () { return $('#patients-collapse') }                                  
    get myPatientsSearchLink () { return this.myPatientsBlock.$('#patientResearch-link') }
    get myPatientsAllLink () { return this.myPatientsBlock.$('#myPatient-link') }
    get myPatientsExplorePerimeterLink () { return this.myPatientsBlock.$('#scoopeTree-link') }

    get myResearchButton () { return $('#research') }
    get myResearchBlock () { return $('#research-collapse') }
    get myResearchSavedLink () { return this.myResearchBlock.$('#savedResearch-link') }
    get myResearchProjectLink () { return this.myResearchBlock.$('#myProject-link') }

    async isOpened () {
        // if (this.reduceButton.isDisplayed() && this.reduceButton.isClickable()) {
        if (await this.reduceButton.$('svg').getAttribute('class') == 'MuiSvgIcon-root MuiSvgIcon-colorAction') {
            return true
        }
        return false
    }

    async isReduced () {
        // if (this.openButton.isDisplayed() && this.openButton.isClickable()) {
            if (await this.reduceButton.$('svg').getAttribute('class') == null) {
            return true
        }
        return false 
    }

    async open () {
        if (await this.isReduced()) {
            await this.openButton.click()
        } 
    }

    async reduce () {
        if (await this.isOpened()) {
            await this.reduceButton.click()
        } 
    }

    async logout () {
        await this.open()
        await this.logoutButton.click()
    }

    async newCohort () {
        if (await this.isOpened()) {
            await this.newCohortButton.click()
        }
        else {
            await this.newCohortPlusLink.click()
        }
    } 

    async openMyPatientsMenu () {
        if (!await this.myPatientsBlock.isDisplayed()) {
            await this.myPatientsButton.click()
            await this.myPatientsBlock.waitForDisplayed()
        }
    }

    async reduceMyPatientsMenu () {
        if (await this.myPatientsBlock.isDisplayed()) {
            await this.myPatientsButton.click()
            await this.myPatientsBlock.waitForDisplayed({ reverse: true })
        }
    }

    async openMyResearchMenu () {
        if (!await this.myResearchBlock.isDisplayed()) {
            await this.myResearchButton.click()
            await this.myResearchBlock.waitForDisplayed()
        }
    }

    async reduceMyResearchMenu () {
        if (await this.myResearchBlock.isDisplayed()) {
            await this.myResearchButton.click()
            await this.myResearchBlock.waitForDisplayed({ reverse: true })
        }
    }
}

module.exports = new LeftMenu()
