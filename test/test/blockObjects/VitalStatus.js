class VitalStatus {

    // get block () { return $('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-grid-md-11 > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)') }
    get block () { return $('div.MuiGrid-grid-md-8 > div.MuiPaper-root.MuiPaper-elevation1.MuiPaper-rounded') }

    get aliveFemales () { return this.block.$('tr:nth-child(1) > td:nth-child(2)') }
    get deadFemales () { return this.block.$('tr:nth-child(1) > td:nth-child(3)') }
    get aliveMales () { return this.block.$('tr:nth-child(2) > td:nth-child(2)') }
    get deadMales () { return this.block.$('tr:nth-child(2) > td:nth-child(3)') }
}

module.exports = new VitalStatus()