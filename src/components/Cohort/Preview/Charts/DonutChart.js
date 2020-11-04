import React from 'react'

import PropTypes from 'prop-types'

import * as d3 from 'd3'

const DonutChart = (props) => {
  const [node, setNode] = React.useState()

  const data = props.encountersFacets[0].extension

  for (var i = 0; i < data.length; i++) {
    if (data[i].extension[0].url === 'ext') {
      data[i].extension[0].url =
        'Consultation externe'
    } else if (
      data[i].extension[0].url === 'incomp'
    ) {
      data[i].extension[0].url =
        'Hospitalisation incomplète'
    } else if (
      data[i].extension[0].url === 'urg'
    ) {
      data[i].extension[0].url = 'Urgence'
    } else if (
      data[i].extension[0].url === 'hosp'
    ) {
      data[i].extension[0].url =
        'Hospitalisation'
    }
  }

  var height = 250
  var width = 260

  var svg = d3.select(node)
  svg.selectAll('*').remove()
  svg.attr('height', height).attr('width', width)

  svg.attr('viewBox', [-width / 2, -height / 2, width, height])

  var radius = Math.min(width, height) / 2 - 25

  var colors = props.colors
  var color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.extension[0].url))
    .range(colors)

  var pie = d3
    .pie()
    .padAngle(0.01)
    .sort(null)
    .value((d) => d.extension[0].valueDecimal)

  var arcs = pie(data)

  var arc = d3
    .arc()
    .innerRadius(radius * 0.8)
    .outerRadius(radius - 1)

  svg
    .selectAll('path')
    .data(arcs)
    .join('path')
    .attr('fill', (d) => color(d.data.extension[0].url))
    .attr('d', arc)
    .append('title')
    .text(
      (d) =>
        `${
        d.data.extension[0].url
        }: ${d.data.extension[0].valueDecimal.toLocaleString()}`
    )

  svg
    .append('g')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .attr('text-anchor', 'middle')
    .selectAll('text')
    .data(arcs)
    .join('text')
    .attr('transform', (d) => `translate(${arc.centroid(d)})`)
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
}
DonutChart.propTypes = {
  encountersFacets: PropTypes.array,
  colors: PropTypes.array
}

export default DonutChart
