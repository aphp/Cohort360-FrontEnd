class LegalNotice {

    get linkValue () { return 'En cliquant sur "connexion", vous acceptez la mention légale.' }
    get p1Value () { return 'L’usage de Cohort360 est soumis au respect des règles d’accès aux données de santé définies par la Commission Médicale d’Etablissement de l’AP-HP disponibles à l’adresse recherche-innovation.aphp.fr.' }
    get p2Value () { return 'En appuyant sur le bouton « OK », vous acceptez ces conditions d’utilisation. Les données relatives à votre connexion et à vos actions sur l’application (date, heure, type d’action), sont enregistrées et traitées pour des finalités de sécurité du système d’information et afin de réaliser des statistiques d’utilisation de l’application.' }
    get p3Value () { return 'Elles sont destinées à l’équipe projet de la DSI et sont conservées dans des fichiers de logs pendant 3 ans. Vous pouvez exercer votre droit d’accès et de rectification aux informations qui vous concernent, en écrivant à la déléguée à la protection des données de l’AP-HP à l’adresse protection.donnees.dsi@aphp.fr.' }
    
    get link () { return $('a*=mention légale') }

}

module.exports = new LegalNotice()