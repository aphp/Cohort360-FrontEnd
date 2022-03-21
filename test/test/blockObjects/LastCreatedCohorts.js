const CommonCohorts = require('./CommonCohorts')

class LastCreatedCohorts extends CommonCohorts {

    // Bloc "Mes dernières cohortes créées" (values)
    // ---------------------------------------------
    get titleValue () { return 'Mes dernières cohortes créées' }

    // Bloc "Mes dernières cohortes créées" (selectors)
    // ------------------------------------------------
    get title () { return $('div.MuiGrid-spacing-xs-3:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > h2:nth-child(1)') }
    get allCohortsLink () { return $('div.MuiGrid-spacing-xs-3:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)') }
    get table () { return $('div.MuiGrid-spacing-xs-3:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1)') }
    get tableHeaderTitle () { return $('div.MuiGrid-spacing-xs-3:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(1)') }
    get tableHeaderFavorite () { return $('div.MuiGrid-spacing-xs-3:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(2)') }
    get tableHeaderType () { return $('div.MuiGrid-spacing-xs-3:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(3)') }
    get tableHeaderStatus () { return $('div.MuiGrid-spacing-xs-3:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(4)') }
    get tableHeaderNbPatients () { return $('div.MuiGrid-spacing-xs-3:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(5)') }
    get tableHeaderEstimateNbPatients () { return $('div.MuiGrid-spacing-xs-3:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(6)') }
    get tableHeaderModificationDate () { return $('div.MuiGrid-spacing-xs-3:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(7)') }
    get noCohortMessage () { return $('div.MuiGrid-spacing-xs-3:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > span:nth-child(1)') }
    get tableFirstLine () { return $('div.MuiGrid-spacing-xs-3:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(1)') }
    get tableFirstLineFavoritesButton () { return $('div.MuiGrid-spacing-xs-3:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(2) > button:nth-child(1)') }
    get tableFirstLineDeleteButton () { return $('div.MuiGrid-spacing-xs-3:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(7) > button:nth-child(1)') }

    async tableHeader () {
        return await this.tableHeaderTitle.getText() + ' | ' + await this.tableHeaderFavorite.getText() + ' | ' + await this.tableHeaderType.getText() + ' | ' + await this.tableHeaderStatus.getText() + ' | ' + await this.tableHeaderNbPatients.getText() + ' | ' + await this.tableHeaderEstimateNbPatients.getText() + ' | ' + await this.tableHeaderModificationDate.getText()
    }
}

module.exports = new LastCreatedCohorts()