//@ts-nocheck
import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import legend from './Legend'

import { VisiteRepartitionType, Month } from 'types'
import { GenderStatusLabel } from 'types/searchCriterias'

type GroupedBarChartProps = {
  data?: VisiteRepartitionType
  height?: number
  width?: number
}

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({ data, height = 250, width = 450 }) => {
  const node = useRef<SVGSVGElement | null>(null)
  const [legendHtml, setLegend] = useState()

  useEffect(() => {
    if (!data) {
      return
    }
    const customData = [
      { Mois: Month.JANUARY, Hommes: 0, Femmes: 0 },
      { Mois: Month.FEBRUARY, Hommes: 0, Femmes: 0 },
      { Mois: Month.MARCH, Hommes: 0, Femmes: 0 },
      { Mois: Month.APRIL, Hommes: 0, Femmes: 0 },
      { Mois: Month.MAY, Hommes: 0, Femmes: 0 },
      { Mois: Month.JUNE, Hommes: 0, Femmes: 0 },
      { Mois: Month.JULY, Hommes: 0, Femmes: 0 },
      { Mois: Month.AUGUST, Hommes: 0, Femmes: 0 },
      { Mois: Month.SEPTEMBER, Hommes: 0, Femmes: 0 },
      { Mois: Month.OCTOBER, Hommes: 0, Femmes: 0 },
      { Mois: Month.NOVEMBER, Hommes: 0, Femmes: 0 },
      { Mois: Month.DECEMBER, Hommes: 0, Femmes: 0 }
    ]
    const months = Object.keys(data)
    for (const month of months) {
      const entryData = data[month]
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

    const keys = [GenderStatusLabel.MALE, GenderStatusLabel.FEMALE]
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
      .on('mouseover', function (event, d) {
        const currentMonth = customData.find((customItem) => customItem[d.key] === d.value)
        const total_value = (currentMonth?.Hommes || 0) + (currentMonth?.Femmes || 0)
        d3.select(this).transition().duration('50').attr('opacity', '.5')
        div.transition().duration(50).style('opacity', 1)
        div
          .html(`${d.value} (${parseInt((d.value / total_value) * 10000) / 100}%)`)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 15 + 'px')
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
      <svg id="month-repartition-visit-card-svg" ref={node}></svg>
      <div style={{ display: 'flex' }} dangerouslySetInnerHTML={{ __html: legendHtml }} />
    </div>
  )
}

export default GroupedBarChart
