import React from 'react'
import * as d3 from 'd3'

import PropTypes from 'prop-types'

const GroupedBarChart = ({ encountersFacets }) => {
  const [node, setNode] = React.useState()
  var height = 250
  var width = 450

  const svg = d3.select(node)
  svg.selectAll('*').remove()
  svg.attr('height', height).attr('width', width)

  var data = [
    { Mois: 'Janvier', Hommes: 0, Femmes: 0 },
    { Mois: 'Février', Hommes: 0, Femmes: 0 },
    { Mois: 'Mars', Hommes: 0, Femmes: 0 },
    { Mois: 'Avril', Hommes: 0, Femmes: 0 },
    { Mois: 'Mai', Hommes: 0, Femmes: 0 },
    { Mois: 'Juin', Hommes: 0, Femmes: 0 },
    { Mois: 'Juillet', Hommes: 0, Femmes: 0 },
    { Mois: 'Août', Hommes: 0, Femmes: 0 },
    { Mois: 'Septembre', Hommes: 0, Femmes: 0 },
    { Mois: 'Octobre', Hommes: 0, Femmes: 0 },
    { Mois: 'Novembre', Hommes: 0, Femmes: 0 },
    { Mois: 'Décembre', Hommes: 0, Femmes: 0 }
  ]

  const facet = encountersFacets[0].extension
  if (facet[0]) {
    for (let i = 0; i < facet.length; i++) {
      for (let j = 0; j < facet[i].extension[1].extension.length; j += 2) {
        const mois = parseInt(facet[i].extension[1].extension[j].url, 10)
        const tabCount = facet[i].extension[1].extension[j + 1].extension
        for (let k = 0; k < tabCount.length; k++) {
          if (tabCount[k].url === 'male') {
            data[mois - 1].Hommes += tabCount[k].valueDecimal
          } else if (tabCount[k].url === 'female') {
            data[mois - 1].Femmes += tabCount[k].valueDecimal
          }
        }
      }
    }
  }

  data = Object.assign(
    data,
    {
      columns: ['Mois', 'Hommes', 'Femmes']
    },
    { y: 'Visites' }
  )

  const margin = { top: 20, right: 10, bottom: 35, left: 50 }

  const groupKey = data.columns[0]

  const keys = data.columns.slice(1)

  const legend = (svg) => {
    const g = svg
      .attr('transform', `translate(${width},0)`)
      .attr('text-anchor', 'end')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .selectAll('g')
      .data(color.domain().slice().reverse())
      .join('g')
      .attr('transform', (d, i) => `translate(0,${i * 15})`)

    g.append('rect')
      .attr('x', -19)
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', color)

    g.append('text')
      .attr('x', -24)
      .attr('y', 5)
      .attr('dy', '0.35em')
      .text((d) => d)
  }

  const x0 = d3
    .scaleBand()
    .domain(data.map((d) => d[groupKey]))
    .rangeRound([margin.left, width - margin.right])
    .paddingInner(0.1)

  const x1 = d3
    .scaleBand()
    .domain(keys)
    .rangeRound([0, x0.bandwidth()])
    .padding(0.05)

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d3.max(keys, (key) => d[key]))])
    .nice()
    .rangeRound([height - margin.bottom, margin.top])

  const color = d3.scaleOrdinal().range(['#78D4FA', '#FC568F', '#8446E4'])

  const xAxis = (g) =>
    g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0).tickSizeOuter(0))
      .selectAll('text')
      .attr('transform', 'rotate(-20)')

  const yAxis = (g) =>
    g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(null, 's'))
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .select('.tick:last-of-type text')
          .clone()
          .attr('x', 3)
          .attr('text-anchor', 'start')
          .attr('font-weight', 'bold')
          .text(data.y)
      )

  svg
    .append('g')
    .selectAll('g')
    .data(data)
    .join('g')
    .attr('transform', (d) => `translate(${x0(d[groupKey])},0)`)
    .selectAll('rect')
    .data((d) => keys.map((key) => ({ key, value: d[key] })))
    .join('rect')
    .attr('x', (d) => x1(d.key))
    .attr('y', (d) => y(d.value))
    .attr('width', x1.bandwidth())
    .attr('height', (d) => y(0) - y(d.value))
    .attr('fill', (d) => color(d.key))

  svg.append('g').call(xAxis)

  svg.append('g').call(yAxis)

  svg.append('g').call(legend)

  return <svg ref={(node) => setNode(node)}></svg>
}
GroupedBarChart.propTypes = {
  encountersFacets: PropTypes.array
}

export default GroupedBarChart
