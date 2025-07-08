import React, { useEffect, useState } from 'react'
import useStyles from './styles'

import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

import { listStaticContents, WebContent } from 'services/aphp/callApi'
import Markdown from 'react-markdown'

const TutorialsCard = () => {
  const [_news, setNews] = useState<WebContent[]>()
  const { classes } = useStyles()

  useEffect(() => {
    const fetchNews = async () => {
      const response = await listStaticContents(['RELEASE_NOTE'])
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
        {_news?.map((entry, index) => (
          <div key={index}>
            <Divider className={classes.divider} style={{ marginTop: 8, marginBottom: 16 }} />
            <Typography color="textSecondary" style={{ paddingBottom: 8, color: '#303030' }}>
              <b>{entry.title}</b>
            </Typography>
            <Typography color="textSecondary" className={classes.markdown}>
              <Markdown>{entry.content}</Markdown>
            </Typography>
          </div>
        ))}
      </>
    </>
  )
}

export default TutorialsCard
