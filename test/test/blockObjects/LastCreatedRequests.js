const CommonRequests = require('./CommonRequests')

class LastCreatedRequests extends CommonRequests {

    // Bloc "Mes dernières requêtes créées" (values)
    // ---------------------------------------------
    get titleValue () { return 'Mes dernières requêtes créées' }

    // Bloc "Mes dernières requêtes créées" (selectors)
    // ------------------------------------------------
    get title () { return $('div.MuiGrid-spacing-xs-3:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > h2:nth-child(1)') }
    get allRequestsLink () { return $('div.MuiGrid-spacing-xs-3:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)') }
    get table () { return $('div.MuiGrid-spacing-xs-3:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1)') }
    get tableHeaderTitle () { return $('div.MuiGrid-spacing-xs-3:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(1)') }
    get tableHeaderModificationDate () { return $('div.MuiGrid-spacing-xs-3:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(2)') }
    get noRequestMessage () { return $('div.MuiGrid-spacing-xs-3:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > span:nth-child(1)') }
    get tableFirstLine () { return $('div.MuiGrid-spacing-xs-3:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(1)') }
    get tableFirstLineDeleteButton () { return $('div.MuiGrid-spacing-xs-3:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(3) > div:nth-child(1) > div:nth-child(3) > button:nth-child(1)') }
    get tableFirstLineEditButton () { return $('div.MuiGrid-spacing-xs-3:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(3) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1)') }
    get tableFirstLineShareButton () { return $('div.MuiGrid-spacing-xs-3:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(3) > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)') }

    async tableHeader () {
        return await this.tableHeaderTitle.getText() + ' | ' + await this.tableHeaderModificationDate.getText()
    }
}

module.exports = new LastCreatedRequests()