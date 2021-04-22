//@ts-nocheck
import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import legend from './Legend'

import { ComplexChartDataType, Month } from 'types'

type GroupedBarChartProps = {
  data?: ComplexChartDataType<Month>
  height?: number
  width?: number
}

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({ data, height = 250, width = 450 }) => {
  const node = useRef<SVGSVGElement | null>(null)
  const [legendHtml, setLegend] = useState()

  useEffect(() => {
    if (!data || (data && !data.size)) {
      return
    }
    const customData = [
      { Mois: Month.january, Hommes: 0, Femmes: 0 },
      { Mois: Month.february, Hommes: 0, Femmes: 0 },
      { Mois: Month.march, Hommes: 0, Femmes: 0 },
      { Mois: Month.april, Hommes: 0, Femmes: 0 },
      { Mois: Month.may, Hommes: 0, Femmes: 0 },
      { Mois: Month.june, Hommes: 0, Femmes: 0 },
      { Mois: Month.july, Hommes: 0, Femmes: 0 },
      { Mois: Month.august, Hommes: 0, Femmes: 0 },
      { Mois: Month.september, Hommes: 0, Femmes: 0 },
      { Mois: Month.october, Hommes: 0, Femmes: 0 },
      { Mois: Month.november, Hommes: 0, Femmes: 0 },
      { Mois: Month.december, Hommes: 0, Femmes: 0 }
    ]
    for (const entry of data) {
      const [month, entryData] = entry
      const monthDataIndex = customData.findIndex((d) => d.Mois === month)
      if (monthDataIndex >= 0) {
        const maleCount = entryData.male
        const femaleCount = entryData.female
        customData[monthDataIndex] = {
          ...customData[monthDataIndex],
          Hommes: parseInt(maleCount),
          Femmes: parseInt(femaleCount)
        }
      }
    }

    const svg = d3.select(node.current)
    svg.selectAll('*').remove()
    svg.attr('height', height).attr('width', width)

    const margin = { top: 20, right: 10, bottom: 35, left: 50 }

    const groupKey = 'Mois'

    const keys = ['Hommes', 'Femmes']
    const color = d3.scaleOrdinal().domain(keys).range(['#78D4FA', '#FC568F', '#8446E4'])

    const div = d3.select('#tooltip').style('opacity', 0)

    const x0 = d3
      .scaleBand()
      .domain(customData.map((d) => d[groupKey]))
      .rangeRound([margin.left, width - margin.right])
      .paddingInner(0.1)

    const x1 = d3.scaleBand().domain(keys).rangeRound([0, x0.bandwidth()]).padding(0.05)

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(customData, (d) => d3.max(keys, (key) => d[key]))])
      .nice()
      .rangeRound([height - margin.bottom, margin.top])

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
            .text('Visites')
        )

    svg
      .append('g')
      .selectAll('g')
      .data(customData)
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
      .on('mouseover', function (d) {
        const currentMonth = customData.find((customItem) => customItem[d.key] === d.value)
        const total_value = (currentMonth?.Hommes ?? 0) + (currentMonth?.Femmes ?? 0)
        d3.select(this).transition().duration('50').attr('opacity', '.5')
        div.transition().duration(50).style('opacity', 1)
        div
          .html(`${d.value} (${parseInt((d.value / total_value) * 10000) / 100}%)`)
          .style('left', d3.event.pageX + 10 + 'px')
          .style('top', d3.event.pageY - 15 + 'px')
      })
      .on('mouseout', function () {
        d3.select(this).transition().duration('50').attr('opacity', '1')
        div.transition().duration(50).style('opacity', 0)
      })

    svg.append('g').call(xAxis)

    svg.append('g').call(yAxis)

    setLegend(
      legend({
        color: color,
        columns: '70px'
      })
    )
  }, [node, data, height, width])

  return (
    <div style={{ display: 'flex' }}>
      <svg ref={node}></svg>
      <div style={{ display: 'flex' }} dangerouslySetInnerHTML={{ __html: legendHtml }} />
    </div>
  )
}

export default GroupedBarChart
