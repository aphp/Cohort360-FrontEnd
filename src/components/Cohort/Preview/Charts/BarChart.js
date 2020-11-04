import React, { memo } from 'react'

import PropTypes from 'prop-types'

import * as d3 from 'd3'

const BarChart = memo((props) => {
  const [node, setNode] = React.useState()

  const data = props.repartitionMap[0].extension

  for (var i = 0; i < data.length; i++) {
    if (data[i].extension[0].url === 'male') {
      data[i].extension[0].url = 'Hommes'
    } else if (data[i].extension[0].url === 'female') {
      data[i].extension[0].url = 'Femmes'
    } else if (data[i].extension[0].url === 'i' || data[i].extension[0].url === 'unknown') {
      data[i].extension[0].url = 'Autres'
    }
  }

  var height = 250
  var width = 300

  const svg = d3.select(node)
  svg.selectAll('*').remove()
  svg.attr('height', height).attr('width', width)

  var color = d3.scaleOrdinal().range(['#FC568F', '#78D4FA', '#8446E4'])

  var margin = { top: 20, right: 0, bottom: 30, left: 30 }

  var x = d3
    .scaleBand()
    .domain(d3.range(data.length))
    .range([margin.left, width - margin.right])
    .padding(0.1)

  var y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.extension[0].valueDecimal)])
    .nice()
    .range([height - margin.bottom, margin.top])

  var xAxis = (g) =>
    g.attr('transform', `translate(0,${height - margin.bottom})`).call(
      d3
        .axisBottom(x)
        .tickFormat((i) => data[i].extension[0].url)
        .tickSizeOuter(0)
    )

  var yAxis = (g) =>
    g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(null, 's'))
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .append('text')
          .attr('y', 10)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'start')
          .text(data.y)
      )

  svg
    .append('g')
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', (d, i) => x(i))
    .attr('y', (d) => y(d.extension[0].valueDecimal))
    .attr('height', (d) => y(0) - y(d.extension[0].valueDecimal))
    .attr('width', x.bandwidth())
    .attr('fill', (d) => color(d.extension[0].url))

  svg.append('g').call(xAxis)

  svg.append('g').call(yAxis)

  return <svg ref={(node) => setNode(node)}></svg>
})

BarChart.displayName = BarChart

BarChart.propTypes = {
  repartitionMap: PropTypes.array
}
export default BarChart
