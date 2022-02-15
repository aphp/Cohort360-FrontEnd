class NbPatients {

    // get block () { return $('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-grid-md-11 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)') }
    get block () { return $('#patient-number-card') }
    

    // Bloc "Nombre de patients" (values)
    // ----------------------------------
    get titleValue () { return 'Nombre de patients' }

    // Bloc "Nombre de patients" (selectors)
    // -------------------------------------
    // get title () { return $('.jss48 > div:nth-child(1) > h3:nth-child(1)') }
    get title () { return $('#patient-number-card-title') }
    get value() { return $('#patient-number-card-value') }
}

module.exports = new NbPatients()