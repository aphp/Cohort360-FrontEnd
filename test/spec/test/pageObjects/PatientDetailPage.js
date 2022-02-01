const COHORT360_PARAMS = require('../params/cohort360-param.js')
const Page = require('./Page')

class PatientDetailPage extends Page {

    get path () { return COHORT360_PARAMS.PATIENT_DETAIL_PAGE_PATH }

    get backButton () { return $('div.MuiGrid-root.MuiGrid-container.MuiGrid-align-items-xs-center > button') }

    get title () { return $('div.MuiGrid-root.MuiGrid-container.MuiGrid-align-items-xs-center > h2.MuiTypography-root') }

    get patientTechIdOrIPP () { 
        if ($('p.MuiTypography-root:nth-child(3)').getText().indexOf('-') != -1)
            $('p.MuiTypography-root:nth-child(3)').waitUntil(() => $('p.MuiTypography-root:nth-child(3)').getText().indexOf('-') == -1)
        return $('p.MuiTypography-root:nth-child(3)') 
    }

    /*constructor () {
        // this.patientTechIdOrIPP.waitUntil(() => this.patientTechIdOrIPP.getText().indexOf('-') == -1)
        $('p.MuiTypography-root:nth-child(3)').waitUntil(() => $('p.MuiTypography-root:nth-child(3)').getText().indexOf('-') == -1)
    }*/

    open () {
        return super.open(this.path)
    }

    getUrl () {
        return super.getUrl(this.path)
    }

}

module.exports = new PatientDetailPage()