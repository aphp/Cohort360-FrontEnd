const COHORT360_PARAMS = require('../params/cohort360-param.js')
const Page = require('./Page')
const PatientBlock = require('../blockObjects/Patient')
const SearchBlock = require('../blockObjects/PatientSearchFilter')
const NewsBlock = require('../blockObjects/News')
const TutorialBlock = require('../blockObjects/Tutorial')
const FavoriteCohortsBlock = require('../blockObjects/FavoriteCohorts')
const LastCreatedCohortsBlock = require('../blockObjects/LastCreatedCohorts')

class HomePage extends Page {
    
    get path () { return COHORT360_PARAMS.HOME_PAGE_PATH }

    get welcomeMessage () { return $('h1*=Bienvenue') }
    get lastConnectionMessage () { return $('h6.MuiTypography-root') }
    
    // Bloc "Patients pris en charge"
    get patientBlock () { return PatientBlock }

    // Bloc "Explorer les données d'un patient"
    get searchBlock () { 
        SearchBlock.path = this.path
        return SearchBlock 
    }

    // Bloc "Actualités"
    get newsBlock () { return NewsBlock }

    // Bloc "Tutoriels"
    get tutorialBlock () { return TutorialBlock }

    // Bloc "Mes cohortes favorites"
    get favoriteCohortsBlock () { return FavoriteCohortsBlock }
    
    // Bloc "Mes dernières cohortes créées"
    get lastCreatedCohortsBlock () { return LastCreatedCohortsBlock } 
    
    open () {
        return super.open(this.path)
    }

    getUrl () {
        return super.getUrl(this.path)
    }

    async login (username, password) {
        await super.login (username, password)
    }
}

module.exports = new HomePage()
