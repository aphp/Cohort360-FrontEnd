class SourcePopulation {

    get titleValue () { return 'Population source' }
    get messageValue () { return 'Sur quelle population source souhaitez-vous baser votre requête ?' }
    get buttonLib () { return 'Structure hospitalière' }

    get block () { return $('.MuiCard-root') }
    get title () { return this.block.$('span.MuiTypography-root') }
    get message () { return this.block.$('.MuiTypography-alignCenter') }
    get button () { return this.block.$('.MuiButton-contained') }

}

module.exports = new SourcePopulation()