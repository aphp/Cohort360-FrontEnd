import React from 'react'
import PropTypes from 'prop-types'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core'

import useStyles from './styles.js'

const DocumentSearchHelp = ({ open, onClose }) => {
  const classes = useStyles()

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.title}>Aide à la recherche textuelle</DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container direction="column">
          <Typography>Les opérateurs ci-dessous vont aideront à affiner la recherche textuelle.</Typography>
          <Typography variant="button" className={classes.subtitle}>
            Recherche textuelle basique :
          </Typography>
          <TableContainer component={Paper} className={classes.tableContainer}>
            <Table className={classes.table} aria-label="customized table">
              <TableHead>
                <TableRow className={classes.tableHead}>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Opérateurs / Caractères à utiliser
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Description
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Syntaxe
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow className={classes.tableBodyRows} hover>
                  <TableCell align="center">
                    <Typography className={classes.bold}>AND</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">
                      Recherche si dans un document, les mots, ou groupe de mots (encadrés de parenthèse pour ce
                      dernier) sont présents. La recherche se base sur la racine des mots. Par exemple pour le mot
                      embolie, la recherche peut retourner embolisation.
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>Mot1 AND Mot2 () AND ()</Typography>
                  </TableCell>
                </TableRow>
                <TableRow className={classes.tableBodyRows} hover>
                  <TableCell align="center">
                    <Typography className={classes.bold}>OR</Typography>
                    <Typography className={classes.bold}>|</Typography>
                    <Typography className={classes.bold}>||</Typography>
                    <Typography className={classes.bold}>Espace entre deux mots</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">
                      Recherche dans les documents si au moins un des mots est présent.
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>Mot1 OR Mot2</Typography>
                    <Typography className={classes.bold}>Mot1 |Mot2</Typography>
                    <Typography className={classes.bold}>Mot1 || Mot2</Typography>
                    <Typography className={classes.bold}>Mot1 Mot2</Typography>
                  </TableCell>
                </TableRow>
                <TableRow className={classes.tableBodyRows} hover>
                  <TableCell align="center">
                    <Typography className={classes.bold}>NOT</Typography>
                    <Typography className={classes.bold}>!</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">
                      Exprime la négation. La recherche exclut le terme qui suit NOT ou bien !
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>Mot1 NOT Mot2</Typography>
                    <Typography className={classes.bold}>Mot1 ! Mot2</Typography>
                  </TableCell>
                </TableRow>
                <TableRow className={classes.tableBodyRows} hover>
                  <TableCell align="center">
                    <Typography className={classes.bold}>()</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">Les parenthèses permettent de faire un groupe de mots.</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>(Mot1 Mot2)</Typography>
                  </TableCell>
                </TableRow>
                <TableRow className={classes.tableBodyRows} hover>
                  <TableCell align="center">
                    <Typography className={classes.bold}>() ()</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">
                      Recherche dans les documents si au moins un des groupes de mots est présent.
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>(Mot1 Mot2)(Mot3 Mot4)</Typography>
                  </TableCell>
                </TableRow>
                <TableRow className={classes.tableBodyRows} hover>
                  <TableCell align="center">
                    <Typography className={classes.bold}>*</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">
                      Lorsque * est placé à la fin du mot, la recherche s&apos;effectue sur tous les mots pouvant
                      correspondre à la fin du mot souhaité. Par exemple pour embol*, les résultats peuvent être
                      embolisation, embolie, ...
                    </Typography>
                    <Typography align="justify">
                      Dans le cas où * est placé à l&apos;intérieur d&apos;une chaine de caractères, la recherche
                      s&apos;effectue sur tous les mots pouvant correspondre au mot souhaité, quelque soit le nombre de
                      caractères inconnus. Par exemple, pour te*t, les résultats peuvent être testés, texte, tenant,
                      test, ...
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>Mo*</Typography>
                    <Typography className={classes.bold}>Mo*t</Typography>
                  </TableCell>
                </TableRow>
                <TableRow className={classes.tableBodyRows} hover>
                  <TableCell align="center">
                    <Typography className={classes.bold}>?</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">
                      Dans le cas où ? est placé à l&apos;intérieur d&apos;une chaine de caractères, la recherche
                      s&apos;effectue sur tous les mots pouvant correspondre au mot souhaité, avec le caractère inconnu.
                      Par exemple pour te?t, les résultats peuvent être testés, texte, test, ...
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>Mo?t</Typography>
                  </TableCell>
                </TableRow>
                <TableRow className={classes.tableBodyRows} hover>
                  <TableCell align="center">
                    <Typography className={classes.bold}>~</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">
                      Recherche de mots similaires. Par exemple pour hormone~, les résultats peuvent être hormonede
                      (considéré comme faute de frappe), hormono,...
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>Mot~</Typography>
                  </TableCell>
                </TableRow>
                <TableRow className={classes.tableBodyRows} hover>
                  <TableCell align="center">
                    <Typography className={classes.bold}>+</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">
                      Le terme qui suit + doit forcément être présent dans les résultats de la recherche. Par exemple
                      pour embolie+myocarde, la recherche doit forcément trouver le terme myocarde, même si dans le même
                      docupment le terme embolie &apos;est pas présent.
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>+Mot</Typography>
                  </TableCell>
                </TableRow>
                <TableRow className={classes.tableBodyRows} hover>
                  <TableCell align="center">
                    <Typography className={classes.bold}>-</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">Le terme qui suit - est exclu de la recherche.</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>- Mot</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="button" className={classes.subtitle}>
            Recherche textuelle avancée :
          </Typography>
          <TableContainer component={Paper} className={classes.tableContainer}>
            <Table className={classes.table} aria-label="customized table">
              <TableHead>
                <TableRow className={classes.tableHead}>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Opérateurs / Caractères à utiliser
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Description
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow className={classes.tableBodyRows} hover>
                  <TableCell align="center">
                    <Typography className={classes.bold}>&quot;mot1 mot2&quot;</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">Recherche des deux termes côte à côte.</Typography>
                  </TableCell>
                </TableRow>
                <TableRow className={classes.tableBodyRows} hover>
                  <TableCell align="center">
                    <Typography className={classes.bold}>&quot;mot1 mot2&quot;~nombre de mots</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">
                      Recherche des deux termes avec une distance de mots entre les deux. Par exemple pour « embolie
                      infarctus »~10, la recherche s’effectue dans les documents ayant les deux termes avec une distance
                      de 10 mots maximum entre les deux.
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow className={classes.tableBodyRows} hover>
                  <TableCell align="center">
                    <Typography className={classes.bold}>^nombre</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">
                      Permet de rechercher un terme ou un groupe de mots en renforçant sa valeur en lui accordant un
                      facteur. Par exemple, la requête embolie pulmonaire^4 recherche tous les documents ayant les
                      termes embolie et pulmonaire mais avec le terme pulmonaire le plus recherché/efficace/important.
                    </Typography>
                    <Typography align="justify">
                      Ceci est possible avec des groupes de mots également, par exemple &quot;infarctus du
                      myocarde&quot;^3 &quot;embolie pulmonaire&quot;.
                    </Typography>
                    <Typography align="justify">
                      Le facteur est à 1 par défaut, il peut aussi être inférieur à 1 (par exemple à 0.2).
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography className={classes.subtitle}>
            Pour plus de fonctionnalités dans la recherche textuelle, vous pouvez consulter le lien suivant :
            <Link href="https://lucene.apache.org/solr/guide/8_1/the-standard-query-parser.html#fuzzy-searches">
              https://lucene.apache.org/solr/guide/8_1/the-standard-query-parser.html#fuzzy-searches.
            </Link>
          </Typography>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

DocumentSearchHelp.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
}

export default DocumentSearchHelp
