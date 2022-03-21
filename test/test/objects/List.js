const COHORT360_PARAMS = require('../params/cohort360-param.js')

module.exports = class List {

    MAX_LINE = COHORT360_PARAMS.MAX_LINE
    NB_LINE = COHORT360_PARAMS.NB_LINE

    get maxLine () { return this.MAX_LINE }
    set maxLine (pMaxLine) {
        this.MAX_LINE = pMaxLine
    }

    get nbLine () { 
        if (this.NB_LINE > this.MAX_LINE)
            return this.MAX_LINE
        return this.NB_LINE 
    }
    set nbLine (pNbLine) {
        this.NB_LINE = pNbLine
    }

    LINE_NUMBER = 0

    get lineNumber () {
        return this.LINE_NUMBER
    }

    set lineNumber (pLineNumber) {
        this.LINE_NUMBER = pLineNumber
    }

    ALL_LINE_BLOCKS = null

    get allLineBlocks () { return this.ALL_LINE_BLOCKS }
    set allLineBlocks (pAllLineBlocks) {
        this.ALL_LINE_BLOCKS = pAllLineBlocks
        if (this.MAX_LINE > pAllLineBlocks.length)
            this.MAX_LINE = pAllLineBlocks.length
    }

    clearList () {
        this.ALL_LINE_BLOCKS = null
    }

    CURRENT_LINE_BLOCK = null

    async currentLineBlock () {
        if (this.LINE_NUMBER > await this.ALL_LINE_BLOCKS.length)
            return null
        
        return await this.ALL_LINE_BLOCKS[this.LINE_NUMBER]
    }

    setCurrentLine (pLineNumber) { this.LINE_NUMBER = pLineNumber }

    get linesToCheck () {
        var lines = []

        for (var j=0; j<this.nbLine; j++) {
            var lLineNumber = Math.floor(Math.random() * this.maxLine)
            while (lines.includes(lLineNumber))
                lLineNumber = Math.floor(Math.random() * this.maxLine)
            lines[j] = lLineNumber
        }

        return lines.sort(function (a, b) { return a - b })
    }

    getLinesToCheck (pNbLines) {
        if (pNbLines < this.maxLine)
            this.maxLine = pNbLines

        return this.linesToCheck
    }

}