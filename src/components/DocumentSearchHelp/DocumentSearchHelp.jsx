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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className={classes.title}>Aide à la recherche textuelle</DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container direction="column">
          <Typography>Les opérateurs ci-dessous vous aideront à affiner la recherche textuelle.</Typography>

          <Typography variant="button" className={classes.subtitle}>
            Rappel :
          </Typography>

          <TableContainer component={Paper} className={classes.tableContainer}>
            <Table className={classes.table} aria-label="customized table">
              <TableHead>
                <TableRow className={classes.tableHead}>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Rappel
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Description
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Exemple
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>Recherche racinisée</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">
                      La recherche considère un mot et ses dérivés comme étant équivalents
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>
                      Le mot embolie peut retourner les résultats : embolie, embolise, embolisation, embolique, ….
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>Insensible à la casse</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">La recherche ignore les majuscules/minuscules</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>
                      Le mot Embolie est équivalent à : emBoLIE, Embolie, embolie, ...
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>Ignore la ponctuation</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">
                      La recherche ne prend pas en compte la ponctuation comme , ; ! ? …
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>
                      Pour rechercher la phrase : Les données administratives, sociales, est équivent à rechercher la
                      phrase : Les données administratives sociales (sans virgule)
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>Ignore les accents</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">La recherche ne prend pas en compte les accents des mots</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>
                      Le mot diabète est équivalent à diabete (sans accents)
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>Ignore les articles</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">
                      La recherche ne prend pas en compte les articles suivants: le, la, l', lorsqu', de, un, une, …
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>
                      Le mot une embolie est équivalent à embolie (sans article)
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>Ignore les mots vides</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">
                      La recherche ne prend pas en compte les termes suivants: au, ce nous, êtes, sommes, et, même, moi,
                      été, sans, …
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>Les termes être fumeur sont équivalents à fumeur</Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>Espace entre deux mots</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography align="justify">
                      En absence d'opérateurs logiques entre deux mots, c'est l'opérateur OR qui s'applique par défaut
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold}>
                      Pour la recherche des mots embolie pulmonaire, c'est équivalent à rechercher embolie OR pulmonaire
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="button" className={classes.subtitle}>
            Recherche textuelle basique
          </Typography>
          <Typography variant="caption" className={classes.helper}>
            Les opérateurs logiques ne fonctionnent qu'en majuscule
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
                  <TableCell align="center" className={classes.tableHeadCell} style={{ width: 150 }}>
                    Syntaxe
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Exemple
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>AND</Typography>
                    <Typography className={classes.bold}>{'&&'}</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography align="justify">
                      Recherche la présence de plusieurs mots au sein d'un document
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>
                      Mot1 <span className={classes.bold}>AND</span> Mot2
                    </Typography>
                    <Typography>
                      Mot1 <span className={classes.bold}>{'&&'}</span> Mot2
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>
                      infarctus <span className={classes.bold}>AND</span> myocarde
                    </Typography>
                    <Typography align="justify">
                      Les deux mots <span className={classes.bold}>infarctus</span> et{' '}
                      <span className={classes.bold}>myocarde</span> sont présents dans chaque document
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>OR</Typography>
                    <Typography className={classes.bold}>||</Typography>
                    <Typography className={classes.bold}>Espace entre deux mots</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>Recherche dans les documents si au moins un des mots est présent</Typography>
                    <Typography className={classes.bold}>Ces 4 opérateurs sont équivalents</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>
                      Mot1 <span className={classes.bold}>OR</span> Mot 2
                    </Typography>
                    <Typography>
                      Mot1 <span className={classes.bold}>||</span> Mot 2
                    </Typography>
                    <Typography>
                      Mot1 <span className={classes.bold}> </span> Mot 2
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>
                      greffe <span className={classes.bold}>OR</span> rein
                    </Typography>
                    <Typography align="justify">
                      Les résultats retournent les documents qui contiennent soit{' '}
                      <span className={classes.bold}>greffe</span>, soit <span className={classes.bold}>rein</span>,
                      soit les deux mots dans le même document
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>NOT</Typography>
                    <Typography className={classes.bold}>!</Typography>
                    <Typography className={classes.bold}>-</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography align="justify">
                      Exprime la négation. La recherche exclut le terme qui suit NOT ou ! ou -
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>
                      Mot1 <span className={classes.bold}>NOT</span> Mot 2
                    </Typography>
                    <Typography>
                      Mot1 <span className={classes.bold}>!</span>Mot2
                    </Typography>
                    <Typography>
                      Mot1 <span className={classes.bold}>-</span>Mot2
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>
                      thyroide <span className={classes.bold}>NOT</span> tumeur
                    </Typography>
                    <Typography align="justify">
                      Les résultats retournent les documents qui contiennent le terme thyroide, mais pas le terme tumeur
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>() opérateur logique ()</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography align="justify">
                      Les parenthèses permettent de créer des groupes de recherches (sous-recherche)
                    </Typography>
                    <Typography align="justify">
                      Un opérateur logique peut être ajouté dans les groupes de recherches et entre les groupes de
                      recherche
                    </Typography>
                    <Typography align="justify">
                      En absence d'opérateur, un opérateur OR est appliqué par défaut
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>
                      <span className={classes.bold}>(</span>Mot1 Mot2<span className={classes.bold}>)</span> AND{' '}
                      <span className={classes.bold}>(</span>Mot3 Mot4<span className={classes.bold}>)</span>
                    </Typography>
                    <Typography>
                      <span className={classes.bold}>(</span>Mot1 Mot2<span className={classes.bold}>)</span> NOT{' '}
                      <span className={classes.bold}>(</span>Mot3 Mot4<span className={classes.bold}>)</span>
                    </Typography>
                    <Typography>
                      <span className={classes.bold}>(</span>Mot1 Mot2<span className={classes.bold}>)</span> OR{' '}
                      <span className={classes.bold}>(</span>Mot3 Mot4<span className={classes.bold}>)</span>
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>
                      <span className={classes.bold}>(</span>embolie AND pulmonaire
                      <span className={classes.bold}>)</span> NOT <span className={classes.bold}>(</span>infarctus AND
                      myocarde
                      <span className={classes.bold}>)</span>
                    </Typography>
                    <Typography>
                      Les résultats retournent les documents qui contiennent les deux termes embolie et pulmonaire mais
                      qui ne contiennent pas les deux mots suivants à la fois : infarctus et myocarde.
                    </Typography>

                    <br />

                    <Typography>Exemple :</Typography>
                    <Typography style={{ marginLeft: 8 }}>
                      - embolie, pulmonaire, infarctus, myocarde =&gt; KO : document ne correspond pas à la recherche.
                    </Typography>
                    <Typography style={{ marginLeft: 8 }}>
                      - embolie, pulmonaire, infarctus =&gt; OK : document correspond à la recherche.
                    </Typography>
                    <Typography style={{ marginLeft: 8 }}>
                      - embolie, pulmonaire, myocarde =&gt; OK : document correspond à la recherche.
                    </Typography>
                    <Typography style={{ marginLeft: 8 }}>
                      - embolie, pulmonaire =&gt; OK : document correspond à la recherche.
                    </Typography>
                    <Typography style={{ marginLeft: 8 }}>
                      - embolie =&gt; KO : document ne correspond pas à la recherche.
                    </Typography>
                    <Typography style={{ marginLeft: 8 }}>
                      - pulmonaire =&gt; KO : document ne correspond pas à la recherche.
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>*</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography align="justify">Le caractère joker * remplace une chaine de caractères</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>
                      <span className={classes.bold}>*</span>Mot
                    </Typography>
                    <Typography>
                      Mo<span className={classes.bold}>*</span>
                    </Typography>
                    <Typography>
                      Mo<span className={classes.bold}>*</span>t"
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>
                      <span className={classes.bold}>*</span>graphie : Recherche tous les mots qui finissent par{' '}
                      <span className={classes.bold}>graphie</span> et le mot{' '}
                      <span className={classes.bold}>graphie</span> lui même.
                      <br />
                      Par exemple : echographie, radiographie, mammographie, ...
                    </Typography>
                    <br />
                    <Typography>
                      fum<span className={classes.bold}>*</span> : Recherche tous les mots qui commencent par{' '}
                      <span className={classes.bold}>fum</span>
                      <br />
                      Par exemple: fumeur, fume, fumait, ...
                    </Typography>
                    <br />
                    <Typography>
                      Te<span className={classes.bold}>*</span>t : Recherche tous les mots qui commencent par{' '}
                      <span className={classes.bold}>Te</span> et finissent par <span className={classes.bold}>t</span>
                      <br />
                      Par exemple: test, tenant, ...
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>?</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography align="justify">
                      Le caractère joker <span className={classes.bold}>?</span> remplace un caractère inconnu
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>
                      Mo<span className={classes.bold}>?</span>t
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography className={classes.bold}>A?AT</Typography>
                    <Typography>
                      Les résultats peuvent retourner les documents comprenant les termes :{' '}
                      <span className={classes.bold}>ASAT, ALAT, …</span>
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>~</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography align="justify">
                      Recherche un mot similaire. Cette recherche est utilisée dans le cas où un mot est mal
                      orthographié dans les contenus médicaux
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>
                      Mot<span className={classes.bold}>~</span>
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography className={classes.bold}>diabète~</Typography>
                    <Typography>Les résultats retournent les documents qui contiennent des mots similaires.</Typography>
                    <Typography>Par exemple duabète, diabte, ...</Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>+</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography align="justify">
                      Priorise un mot. La recherche inclus systématiquement le terme qui suit le caractère spécial{' '}
                      <span className={classes.bold}>+</span>
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>
                      Mot1 <span className={classes.bold}>+</span> Mot2
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography className={classes.bold}>embolie +pulmonaire</Typography>
                    <Typography>Recherche les documents qui contiennent obligatoirement le mot pulmonaire.</Typography>
                    <Typography>
                      Les résultats retournent les documents{' '}
                      <span className={classes.bold}>qui contiennent embolie pulmonaire, pulmonaire</span>, mais{' '}
                      <span className={classes.bold}>pas uniquement embolie</span>
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="button" className={classes.subtitle}>
            Recherche textuelle avancée
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
                  <TableCell align="center" className={classes.tableHeadCell} style={{ width: 150 }}>
                    Syntaxe
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Exemple
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>" "</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>Permet de rechercher des expressions exactes.</Typography>
                    <Typography align="justify">
                      La recherche par la racine des mots ne s’appliquent pas, dans ce cas précis. Les accents, les
                      majuscules/minuscules et les articles ne sont pas ignorés
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>
                      <span className={classes.bold}>"</span>mot1 mot2<span className={classes.bold}>"</span>
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>
                      <span className={classes.bold}>"</span>embolie pulmonaire<span className={classes.bold}>"</span>
                    </Typography>
                    <Typography align="justify">
                      Recherche dans les documents l'expression{' '}
                      <span className={classes.bold}>embolie pulmonaire exacte</span>, c’est-à-dire les deux termes côte
                      à côte et avec la même orthographe
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>"... ..."~nombre de mots</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>Recherche deux termes avec une distance de mots entre les deux</Typography>
                    <Typography align="justify">Le recherche s'applique par la racine des mots</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>
                      <span className={classes.bold}>"</span>mot1 mot2<span className={classes.bold}>"~3</span>
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>
                      <span className={classes.bold}>"</span>embolie pulmonaire<span className={classes.bold}>"~3</span>
                    </Typography>
                    <Typography align="justify">
                      Recherche dans les documents le mot <span className={classes.bold}>embolie</span> et le mot{' '}
                      <span className={classes.bold}>pulmonaire</span> mais ces deux mots peuvent être{' '}
                      <span className={classes.bold}>séparés au maximum par 3 mots</span>
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>^nombre</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>
                      Permet de rechercher un terme en renforçant sa valeur en lui accordant un facteur.
                    </Typography>
                    <Typography align="justify">
                      Il est utile pour booster la recherche d'un mot par rapport aux autres
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>
                      mot1<span className={classes.bold}>^3</span> mot2<span className={classes.bold}>^4</span>
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>
                      embolie<span className={classes.bold}>^3</span> pulmonaire<span className={classes.bold}>^4</span>
                    </Typography>
                    <Typography align="justify">
                      Recherche dans les documents le mot{' '}
                      <span className={classes.bold}>embolie avec le niveau de pertinence 3</span> et le mot{' '}
                      <span className={classes.bold}>pulmonaire avec le niveau de pertinence 2</span>
                    </Typography>
                    <Typography>Le mot embolie sera considéré plus pertinent que le mot pulmonaire</Typography>
                  </TableCell>
                </TableRow>

                <TableRow className={classes.tableBodyRows}>
                  <TableCell align="center">
                    <Typography className={classes.bold}>{'( ... ... )^=nombre'}</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>
                      Permet de rechercher un <span className={classes.bold}>groupe de mots</span> en renforçant sa
                      valeur en lui accordant un facteur.
                    </Typography>
                    <Typography align="justify">
                      Il est utile pour booster la recherche d'un groupe de mots par rapport aux autres
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>
                      (mot1 mot2)<span className={classes.bold}>^=3</span>
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography className={classes.bold}>
                      (embolie AND pulmonaire)^=3 OR (cancer AND ovaire)^=2
                    </Typography>
                    <Typography align="justify">
                      Recherche dans les documents le groupe de mots{' '}
                      <span className={classes.bold}>embolie et pulmonaire avec un niveau de pertinence de 3</span> et
                      le groupe de mots{' '}
                      <span className={classes.bold}>cancer et ovaire avec un niveau de pertinence 2</span>.
                    </Typography>
                    <Typography>Le premier groupe de mots sera considéré plus pertinent que le second</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography className={classes.subtitle}>
            Pour plus de fonctionnalités dans la recherche textuelle, vous pouvez consulter le lien suivant : <br />
            <Link href="https://lucene.apache.org/solr/guide/8_1/the-standard-query-parser.html#fuzzy-searches">
              https://lucene.apache.org/solr/guide/8_1/the-standard-query-parser.html#fuzzy-searches.
            </Link>
          </Typography>
        </Grid>
      </DialogContent>

      <DialogActions className={classes.dialog}>
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
