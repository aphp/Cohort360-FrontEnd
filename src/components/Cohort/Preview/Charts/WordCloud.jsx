import React, { memo, useState } from 'react'

import PropTypes from 'prop-types'
import * as d3 from 'd3'
import * as cloud from 'd3-cloud'

const WordCloud = memo(({ wordcloudData }) => {
  const [node, setNode] = useState()

  const height = 250
  const width = 1000

  const svg = d3.select(node)
  svg.selectAll('*').remove()
  svg.attr('height', height).attr('width', width)
  svg.attr('viewBox', [50, 0, width, height])

  const data = wordcloudData
  if (!data) return <></>

  if (data[0]) {
    // Calcul de la frequence
    const xMax = data[0].extension[0].valueDecimal

    for (let i = 0; i < data.length; i++) {
      const freq = (data[i].extension[0].valueDecimal * 100) / xMax
      data[i].extension[0].valueDecimal = Math.round(freq * 10) / 10 // <- pour arrondir les décimales
    }
  }

  // DEBUT CODE WORDCLOUD
  // var wordColors = d3.scaleSequential(d3.interpolateWarm) <- pour colorer les mots de manière aléatoire
  const wordColors = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.extension[0].url))
    .range(
      d3.quantize((t) => d3.interpolateCool(t * 0.8 + 0.1), data.length)
      // .reverse() <- pour inverser l'ordre des couleurs
    )

  const fontFamily = 'sans-serif'
  const fontScale = 4.5

  const rotate = 0
  const padding = 0

  const layout = cloud()
    .size([width, height])
    .words(data.map((d) => Object.create(d)))
    .padding(padding)
    .rotate(rotate)
    .font(fontFamily)
    .fontSize((d) => Math.sqrt(d.extension[0].valueDecimal) * fontScale)
    .on('word', ({ size, x, y, rotate, extension }) => {
      svg
        .append('text')
        .attr('font-size', size)
        .attr('transform', `translate(${x},${y}) rotate(${rotate})`)
        .style('fill', wordColors(Math.random()))
        .text(extension[0].url)
    })

  layout.start()

  return <svg ref={(node) => setNode(node)}></svg>
})
WordCloud.propTypes = {
  wordcloudData: PropTypes.array
}
WordCloud.displayName = 'WordCloud'
export default WordCloud
