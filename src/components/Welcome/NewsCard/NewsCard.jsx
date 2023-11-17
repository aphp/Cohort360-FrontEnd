import React, { useEffect, useState } from 'react'
import useStyles from './styles'

import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

import apiBackend from 'services/apiBackend'

const TutorialsCard = () => {
  const [_news, setNews] = useState(null)
  const { classes } = useStyles()

  useEffect(() => {
    const fetchNews = async () => {
      const response = await apiBackend.get('/release-notes/')
      setNews(response)
    }
    fetchNews()
  }, [])

  return (
    <>
      <div id="news-card-title">
        <Typography component="h2" variant="h2" color="primary" gutterBottom>
          Actualités
        </Typography>
      </div>

      <>
        {_news?.data?.results?.map((entry, index) => (
          <div key={index}>
            <Divider className={classes.divider} style={{ marginTop: 16, marginBottom: 16 }} />
            <Typography color="textSecondary" style={{ paddingBottom: 14 }}>
              <b>{entry.title}</b>
            </Typography>
            {entry.message.map((item, midx) => (
              <Typography key={midx} color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
                {item}
              </Typography>
            ))}
            <Typography color="textSecondary" style={{ paddingTop: 6 }}>
              <b>{entry.author}</b>
            </Typography>
          </div>
        ))}
      </>
    </>
  )
}

export default TutorialsCard
