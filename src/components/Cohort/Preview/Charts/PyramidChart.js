import React, { memo } from 'react'
import * as d3 from 'd3'

import PropTypes from 'prop-types'

const PyramidChart = memo((props) => {
  const [node, setNode] = React.useState()
  const height = 250
  const width = props.width

  const svg = d3.select(node)
  svg.selectAll('*').remove()
  svg.attr('height', height).attr('width', width)

  const facet = props.patients[0].extension
  let valueMax = 0
  const data = []

  if (facet[0]) {
    // conversion de l'âge en integer
    if (!Number.isInteger(facet[0].extension[0].url)) {
      for (let i = 0; i < facet.length; i++) {
        const ageInYears = parseInt(facet[i].extension[0].url, 10) / 12;
        data.push({
          url: ageInYears,
          extension: [
            {
              url: 'female',
              valueDecimal: 0
            },
            {
              url: 'male',
              valueDecimal: 0
            }
          ]
        })
      }
    }

    for (let i = 0; i < facet.length; i++) {
      for (let j = 0; j < facet[i].extension.length; j++) {
        if (facet[i].extension[j].url === 'gender-simple') {
          const tabValues = facet[i].extension[j].extension;
          for (let k = 0; k < tabValues.length; k++) {
            if (tabValues[k].url === 'female') {
              data[i].extension[0].valueDecimal = tabValues[k].valueDecimal;
            } else if (tabValues[k].url === 'male') {
              data[i].extension[1].valueDecimal = tabValues[k].valueDecimal;
            }
          }
        }
      }
    }

    // recherche de la valeur maximale dans les tableaux
    for (let i = 0; i < data.length; i++) {
      const femaleValue = data[i].extension[0].valueDecimal
      const maleValue = data[i].extension[1].valueDecimal
      if (valueMax < maleValue || valueMax < femaleValue) {
        valueMax = Math.max(femaleValue, maleValue)
      }
    }
  }

  const margin = { top: 20, right: 20, bottom: 35, left: 30 }

  const femaleValue = d3
    .scaleLinear()
    .domain([0, valueMax])
    .range([width / 2, width - margin.right])

  const maleValue = d3
    .scaleLinear()
    .domain([0, valueMax])
    .range([width / 2, margin.left])

  const y = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.url), d3.max(data, (d) => d.url)])
    .nice()
    .range([height - margin.bottom, margin.top])

  const femaleAreaGenerator = d3
    .area()
    .curve(d3.curveLinear)
    .x0(width / 2)
    .x1((d) => femaleValue(d.extension[0].valueDecimal))
    .y((d) => y(d.url))

  var maleAreaGenerator = d3
    .area()
    .curve(d3.curveLinear)
    .x0(width / 2)
    .x1((d) => maleValue(d.extension[1].valueDecimal))
    .y((d) => y(d.url))

  var femaleAxis = (g) =>
    g.attr('transform', `translate(0,${height - margin.bottom})`).call(
      d3
        .axisBottom(femaleValue)
        .ticks(width / 80)
        .tickSizeOuter(0)
    )

  var maleAxis = (g) =>
    g.attr('transform', `translate(0,${height - margin.bottom})`).call(
      d3
        .axisBottom(maleValue)
        .ticks(width / 80)
        .tickSizeOuter(0)
    )

  var yAxis = (g) =>
    g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .select('.tick:last-of-type text')
          .clone()
          .attr('x', 3)
          .attr('text-anchor', 'start')
          .attr('font-weight', 'bold')
          .text('Ans')
      )

  svg
    .append('path')
    .attr('d', femaleAreaGenerator(data))
    .style('fill', '#FC568F')

  svg.append('path').attr('d', maleAreaGenerator(data)).style('fill', '#78D4FA')

  svg.append('g').call(femaleAxis)

  svg.append('g').call(maleAxis)

  svg.append('g').call(yAxis)

  svg
    .append('rect')
    .attr('x', 315)
    .attr('y', 10)
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', '#FC568F')

  svg
    .attr('text-anchor', 'end')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .append('text')
    .attr('x', 370)
    .attr('y', 15)
    .attr('dy', '0.35em')
    .text('Femmes')

  svg
    .append('rect')
    .attr('x', 315)
    .attr('y', 25)
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', '#78D4FA')

  svg
    .attr('text-anchor', 'end')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .append('text')
    .attr('x', 372)
    .attr('y', 30)
    .attr('dy', '0.35em')
    .text('Hommes')

  return <svg ref={(node) => setNode(node)}></svg>
})

PyramidChart.displayName = PyramidChart

PyramidChart.propTypes = {
  patients: PropTypes.array,
  width: PropTypes.number
}

export default PyramidChart
