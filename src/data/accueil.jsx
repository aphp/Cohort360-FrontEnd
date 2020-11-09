const Data = {
  researches: [
    {
      research_id: 1,
      dossier: 'Covid-19',
      titre: 'COVID19-réan',
      statut: 'Requête',
      perimetre: '-',
      n_patients: '-',
      date: '20-03-2020',
      favorite: 1
    },
    {
      research_id: 2,
      dossier: 'Covid-19',
      titre: 'COVID19-réan_StA',
      statut: 'Pré-cohorte',
      perimetre: 'Réanimation_Saint Antoine',
      n_patients: 10,
      date: '20-03-2020',
      favorite: 0
    }
  ],
  practitioner: {
    first_name: 'Robin',
    last_name: 'Hood',
    last_connexion: '1 Avril 2020 à 10:00',
    n_patients: 148000,
    perimeter: [
      'Hôpital Bichat - DUM Cardiologie',
      'Hôpital Bichat - UF Cardiologie 1',
      'APHP Nord - Université de Paris'
    ]
  }
}

export default Data
