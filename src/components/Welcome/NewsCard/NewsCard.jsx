import React from 'react'
import useStyles from './styles'

import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

import news from './news.json'

export default function TutorialsCard() {
  const { classes } = useStyles()

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
            <div key={index}>
              <Divider className={classes.divider} style={{ marginTop: 16, marginBottom: 16 }} />
              <Typography color="textSecondary" style={{ paddingBottom: 14 }}>
                <b>{entry.news.title}</b>
              </Typography>
              {entry.news.message.map((item, index) => (
                <Typography key={index} color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
                  {item}
                </Typography>
              ))}
              <Typography color="textSecondary" style={{ paddingTop: 6 }}>
                <b>{entry.news.footer}</b>
              </Typography>
            </div>
          </>
        ))}
      </>
    </>
  )
}
