## Development

Pour que l'application puisse parler au server, veuillez renseigner l'url de l'api dans le fichier .env

```
REACT_APP_FHIR_API_URL=<http://api-url.com/api>
```

## MISSING INFORMATION

- Comment accéder au "dernier acte" du patient ? C'est quoi plus précisément ? Patient -> Encounter.diagnosis.condition -> Procedure.code ?
- Comment accéder aux derniers résultats de laboratoire d'un patient ? Observation ? Groupés par Specimen (=échantillon) ?
- Comment sont modélisés les commentaires associés à un patient ? Observation(subjectId, performerId) ?
- Comment est modélisée l'inclusion d'un patient dans un essai clinique ? ResearchStudy ?
- We need the "EpisodeOfCare" (=hospitalization) resource to display the patient timeline. We only have Encounter (=consultations) at this time.
