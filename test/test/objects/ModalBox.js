class ModalBox {
    
    get okButton () { return $('button.MuiButtonBase-root:nth-child(1)') }
    get box () { return $('.MuiPaper-root') }
    get boxContent () { return $('.MuiDialogContent-root') }

}

module.exports = new ModalBox()