const COHORT360_PARAMS = require('../params/cohort360-param.js')
const Page = require('./Page')
const LeftMenu = require('../objects/LeftMenu')
const CreateProjectBox = require('../objects/ResearchProjectCreate')
const EditProjectBox = require('../objects/ResearchProjectEdit')
const DeleteProjectBox = require('../objects/ResearchProjectDelete')
const ProjectListBlock = require('../blockObjects/ResearchProjectList')

class MyResearchProjectsPage extends Page {

    get path () { return COHORT360_PARAMS.MY_RESEARCH_PROJECTS_PAGE_PATH }

    get titleValue () { return 'Mes projets de recherche' }
    get addProjectButtonLib () { return 'Ajouter un projet' }

    get title () { return $('#myProject-title') }
    get addProjectButton () { return $('button.MuiButton-text:nth-child(1)') }

    // Bloc liste des projets
    get projectListBlock () { return ProjectListBlock }

    get createProjectBox () { return CreateProjectBox }
    get editProjectBox () { return EditProjectBox }
    get deleteProjectBox () { return DeleteProjectBox }

    open () {
        return super.open(this.path)
    }

    getUrl () {
        return super.getUrl(this.path)
    }

    login (username, password) {
        super.login (username, password)
        LeftMenu.open()
        LeftMenu.openMyResearchMenu()
        LeftMenu.myResearchProjectLink.click()
        browser.waitUntil(() => browser.getUrl() === this.getUrl())
        // super.access.getText()
    }
}

module.exports = new MyResearchProjectsPage()