import React, { memo } from 'react'

import PropTypes from 'prop-types'

import * as d3 from 'd3'

const PieChart = memo((props) => {
  'Statut vital'
  const [node, setNode] = React.useState()

  const data = props.repartitionMap[0].extension

  for (var i = 0; i < data.length; i++) {
    if (data[i].extension[0].url === 'false') {
      data[i].extension[0].url = 'Patients vivants'
    } else if (data[i].extension[0].url === 'true') {
      data[i].extension[0].url = 'Patients décédés'
    }
  }

  var height = 250
  var width = 200

  const svg = d3.select(node)
  svg.selectAll('*').remove()
  svg.attr('height', height).attr('width', width)

  svg.attr('viewBox', [-width / 2, -height / 2, width, height])

  var radius = (Math.min(width, height) / 2 - 15) * 0.6

  var color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.extension[0].url))
    .range(
      ['#6DF2E3', '#D0D7D8']
    )

  var pie = d3
    .pie()
    .sort(null)
    .value((d) => d.extension[0].valueDecimal)

  var arc = d3
    .arc()
    .innerRadius(0)
    .outerRadius(Math.min(width, height) / 2)

  var arcLabel = d3.arc().innerRadius(radius).outerRadius(radius)

  var arcs = pie(data)

  svg
    .append('g')
    .attr('stroke', 'white')
    .selectAll('path')
    .data(arcs)
    .join('path')
    .attr('fill', (d) => color(d.data.extension[0].url))
    .attr('d', arc)
    .append('title')
    .text(
      (d) =>
        `${d.data.extension[0].url
        }: ${d.data.extension[0].valueDecimal.toLocaleString()}`
    )

  svg
    .append('g')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 12)
    .attr('text-anchor', 'middle')
    .selectAll('text')
    .data(arcs)
    .join('text')
    .attr('transform', (d) => `translate(${arcLabel.centroid(d)})`)
    .call((text) =>
      text
        .append('tspan')
        .attr('y', '-0.4em')
        .attr('font-weight', 'bold')
        .text((d) => d.data.extension[0].url)
    )
    .call((text) =>
      text
        .filter((d) => d.endAngle - d.startAngle > 0.25)
        .append('tspan')
        .attr('x', 0)
        .attr('y', '0.7em')
        .attr('fill-opacity', 0.7)
        .text((d) => d.data.extension[0].valueDecimal.toLocaleString())
    )

  return <svg ref={(node) => setNode(node)}></svg>
})

PieChart.displayName = PieChart

PieChart.propTypes = {
  repartitionMap: PropTypes.array
}

export default PieChart
