class VitalStatus {

    // get block () { return $('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-grid-md-11 > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)') }
    get block () { return $('#repartition-table-card') }

    get aliveFemales () { return $('#female-alive-cell') }
    get deadFemales () { return $('#female-deceased-cell') }
    get aliveMales () { return $('#male-alive-cell') }
    get deadMales () { return $('#male-deceased-cell') }
}

module.exports = new VitalStatus()