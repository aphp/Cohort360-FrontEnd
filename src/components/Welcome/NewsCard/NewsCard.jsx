import React from 'react'
import useStyles from './styles'

import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'

// import FirstNews from './News/FirstNews'
// import SecondNews from './News/SecondNews'
// import ThirdNews from './News/ThirdNews'
// import FourthNews from './News/FourthNews'
// import FifthNews from './News/FifthNews'

import news from './News/news.json'

export default function TutorialsCard() {
  const classes = useStyles()

  console.log('news', news)

  return (
    <>
      <div id="news-card-title">
        <Typography component="h2" variant="h2" color="primary" gutterBottom>
          Actualités
        </Typography>
      </div>

      <>
        {news?.entry?.map((entry, index) => (
          <>
            <div id="je suis la" key={index}>
              <Divider className={classes.divider} style={{ marginTop: 16, marginBottom: 16 }} />
              <Typography color="textSecondary" style={{ paddingBottom: 14 }}>
                <b>{entry.news.title}</b>
              </Typography>
              <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
                {entry.news.message}
              </Typography>
              <Typography color="textSecondary" style={{ paddingTop: 6 }}>
                {entry.news.footer}
              </Typography>
            </div>
          </>
        ))}
      </>
    </>
  )
}
