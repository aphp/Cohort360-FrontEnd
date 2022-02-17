import React from 'react'
import useStyles from './styles'
import Divider from '@material-ui/core/Divider'
import Title from '../../Title'

import FirstNews from './News/FirstNews'
import SecondNews from './News/SecondNews'
import ThirdNews from './News/ThirdNews'
import FourthNews from './News/FourthNews'

export default function TutorialsCard() {
  const classes = useStyles()
  return (
    <>
      <div id="news-card-title">
        <Title>Actualités</Title>
      </div>
      <Divider className={classes.divider} />

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
