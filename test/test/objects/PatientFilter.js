const GenderFilterBlock = require("../blockObjects/GenderFilter")
const AgeFilterBlock = require("../blockObjects/AgeFilter")
const VitalStatusFilterBlock = require("../blockObjects/VitalStatusFilter")

class PatientFilter {
    
    get box () { return $('.MuiDialog-paper') }

    get titleValue () { return 'Filtrer les patients :' }
    get cancelButtonValue () { return 'Annuler' }
    get validateButtonValue () { return 'Valider' }

    get title () { return this.box.$('h2.MuiTypography-h6') }

    get genderFilterBlock () { 
        GenderFilterBlock.box = this.box
        return GenderFilterBlock 
    }

    get ageFilterBlock () { 
        AgeFilterBlock.box = this.box
        return AgeFilterBlock 
    }

    get vitalStatusFilterBlock () { 
        VitalStatusFilterBlock.box = this.box
        return VitalStatusFilterBlock 
    }

    get cancelButton () { return this.box.$('button:nth-child(1)') }
    get validateButton () { return this.box.$('button:nth-child(2)') }

}

module.exports = new PatientFilter()