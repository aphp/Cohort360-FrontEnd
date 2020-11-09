//@ts-nocheck
import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'

import { ComplexChartDataType, Month } from 'types'

type GroupedBarChartProps = {
  data?: ComplexChartDataType<Month>
  height?: number
  width?: number
}

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({ data, height = 250, width = 450 }) => {
  const node = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!data) {
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
          Hommes: maleCount,
          Femmes: femaleCount
        }
      }
    }

    const color = d3.scaleOrdinal().range(['#78D4FA', '#FC568F', '#8446E4'])

    const svg = d3.select(node.current)
    svg.selectAll('*').remove()
    svg.attr('height', height).attr('width', width)

    const margin = { top: 20, right: 10, bottom: 35, left: 50 }

    const groupKey = 'Mois'

    const keys = ['Hommes', 'Femmes']

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

      g.append('rect').attr('x', -19).attr('width', 10).attr('height', 10).attr('fill', color)

      g.append('text')
        .attr('x', -24)
        .attr('y', 5)
        .attr('dy', '0.35em')
        .text((d) => d)
    }

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

    svg.append('g').call(xAxis)

    svg.append('g').call(yAxis)

    svg.append('g').call(legend)
  }, [node, data, height, width])

  return <svg ref={node}></svg>
}

export default GroupedBarChart
