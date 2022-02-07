const SelectedFilterButtonList = require("./SelectedFilterButtonList")

class SelectedPatientsFilterButtonList extends SelectedFilterButtonList {

    init () { if (super.buttonListBlock == null) super.buttonListBlock = $('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-justify-content-xs-flex-end > div:nth-child(2)') }

    get genderButtonLib () { return 'Genre' }
    get ageButtonLib () { return 'Âge' }
    get aliveVitalStatusButtonLib () { return 'Patients vivants' }
    get deadVitalStatusButtonLib () { return 'Patients décédés' }

    get buttonListBlock () { 
        this.init()
        return super.buttonListBlock 
    }

    get buttonList () {
        this.init()
        return super.buttonList 
    }
    
    isGenderFilterSelected () {
        return super.isFilterSelected(this.genderButtonLib)
    }

    isAgeFilterSelected () {
        return super.isFilterSelected(this.ageButtonLib)
    }

    isVitalStatusFilterSelected () {
        return super.isFilterSelected(this.aliveVitalStatusButtonLib) || super.isFilterSelected(this.deadVitalStatusButtonLib)
    }
}

module.exports = new SelectedPatientsFilterButtonList()   