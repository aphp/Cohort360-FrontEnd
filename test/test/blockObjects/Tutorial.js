class Tutorial {

    // Bloc "Tutoriels" (values)
    // -------------------------
    get titleValue () { return 'Tutoriels' }

    // Bloc "Tutoriels" (selectors)
    // ----------------------------
    get title () { return $('#tutorials-card-title') }
    get carousel () { return $('#tutorials-card-carousel') }

}

module.exports = new Tutorial()