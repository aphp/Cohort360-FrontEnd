import React from 'react'
import useStyles from './styles'

import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'

import FirstNews from './News/FirstNews'
import SecondNews from './News/SecondNews'
import ThirdNews from './News/ThirdNews'
import FourthNews from './News/FourthNews'
import FifthNews from './News/FifthNews'
import SixthNews from './News/SixthNews'
import SeventhNews from './News/SeventhNews'

export default function TutorialsCard() {
  const classes = useStyles()
  return (
    <>
      <div id="news-card-title">
        <Typography component="h2" variant="h2" color="primary" gutterBottom>
          Actualités
        </Typography>
      </div>

      <Divider className={classes.divider} style={{ marginTop: 16, marginBottom: 16 }} />

      <SeventhNews />

      <Divider className={classes.divider} style={{ marginTop: 16, marginBottom: 16 }} />

      <SixthNews />

      <Divider className={classes.divider} style={{ marginTop: 16, marginBottom: 16 }} />

      <FifthNews />

      <Divider className={classes.divider} style={{ marginTop: 16, marginBottom: 16 }} />

      <FourthNews />

      <Divider className={classes.divider} style={{ marginTop: 16, marginBottom: 16 }} />

      <ThirdNews />

      <Divider className={classes.divider} style={{ marginTop: 16, marginBottom: 16 }} />

      <SecondNews />

      <Divider className={classes.divider} style={{ marginTop: 16, marginBottom: 16 }} />

      <FirstNews />
    </>
  )
}
