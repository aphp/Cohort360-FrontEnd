class News {

    // Bloc "Actualités" (values)
    // --------------------------
    get titleValue () { return 'Actualités' }

    // Bloc "Actualités" (selectors)
    // -----------------------------
    get title () { return $('#news-card-title') }

}

module.exports = new News()