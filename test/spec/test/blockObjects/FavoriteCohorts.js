const CommonCohorts = require('./CommonCohorts')

class FavoriteCohorts extends CommonCohorts{

    // Bloc "Mes cohortes favorites" (values)
    // --------------------------------------
    get titleValue () { return 'Mes cohortes favorites' }

    // Bloc "Mes cohortes favorites" (selectors)
    // -----------------------------------------
    get title () { return $('div.MuiGrid-spacing-xs-3:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > h2:nth-child(1)') }
    get allCohortsLink () { return $('div.MuiGrid-spacing-xs-3:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)') }
    get table () { return $('div.MuiGrid-spacing-xs-3:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1)') }
    get tableHeaderTitle () { return $('div.MuiGrid-spacing-xs-3:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(1)') }
    get tableHeaderType () { return $('div.MuiGrid-spacing-xs-3:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(2)') }
    get tableHeaderState () { return $('div.MuiGrid-spacing-xs-3:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(3)') }
    // get tableHeaderPerimeter () { return $('div.MuiGrid-spacing-xs-3:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(4)') }
    get tableHeaderNbPatients () { return $('div.MuiGrid-spacing-xs-3:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(4)') }
    get tableHeaderCreationDate () { return $('div.MuiGrid-spacing-xs-3:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(5)') }
    get tableHeaderFavorites () { return $('div.MuiGrid-spacing-xs-3:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(6)') }
    get tableHeaderDelete () { return $('div.MuiGrid-spacing-xs-3:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(7)') }
    // get tableHeader () { return this.tableHeaderTitle.getText() + ' | ' + this.tableHeaderState.getText() + ' | ' + this.tableHeaderPerimeter.getText() + ' | ' + this.tableHeaderNbPatients.getText() + ' | ' + this.tableHeaderCreationDate.getText() + ' | ' + this.tableHeaderFavorites.getText() + ' | ' + this.tableHeaderDelete.getText() }
    get tableHeader () { return this.tableHeaderTitle.getText() + ' | ' + this.tableHeaderType.getText() + ' | ' + this.tableHeaderState.getText() + ' | ' + this.tableHeaderNbPatients.getText() + ' | ' + this.tableHeaderCreationDate.getText() + ' | ' + this.tableHeaderFavorites.getText() + ' | ' + this.tableHeaderDelete.getText() }
    get noCohortMessage () { return $('div.MuiGrid-spacing-xs-3:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > span:nth-child(1)') }
    get tableFirstLine () { return $('div.MuiGrid-spacing-xs-3:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(1)') }
    get tableFirstLineFavoritesButton () { return $('div.MuiGrid-spacing-xs-3:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(6) > button:nth-child(1)') }
    get tableFirstLineDeleteButton () { return $('div.MuiGrid-spacing-xs-3:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(7) > button:nth-child(1)') }


}

module.exports = new FavoriteCohorts()