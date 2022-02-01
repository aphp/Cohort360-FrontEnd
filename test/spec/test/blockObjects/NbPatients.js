class NbPatients {

    // get block () { return $('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-grid-md-11 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)') }
    get block () { return $('div.MuiGrid-grid-md-4 > div.MuiPaper-root.MuiPaper-elevation1.MuiPaper-rounded') }
    

    // Bloc "Nombre de patients" (values)
    // ----------------------------------
    get titleValue () { return 'Nombre de patients' }

    // Bloc "Nombre de patients" (selectors)
    // -------------------------------------
    // get title () { return $('.jss48 > div:nth-child(1) > h3:nth-child(1)') }
    get title () { return this.block.$('div:nth-child(1) > h3:nth-child(1)') }
    get value() { return this.block.$('h4.MuiTypography-root') }
}

module.exports = new NbPatients()