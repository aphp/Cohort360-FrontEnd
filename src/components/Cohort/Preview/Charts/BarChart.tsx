//@ts-nocheck
import React, { useRef, useEffect, memo } from 'react'
import * as d3 from 'd3'

import { SimpleChartDataType } from 'types'

type BarChartProps = {
  data?: SimpleChartDataType[]
  height?: number
  width?: number
}

const BarChart: React.FC<BarChartProps> = memo(({ data, height = 250, width = 300 }) => {
  const node = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!data) {
      return
    }

    const total_value =
      data && data.length > 0 ? data.reduce((a, b) => (typeof a === 'number' ? a + b.value : a.value + b.value)) : 0

    const svg = d3.select(node.current)
    svg.selectAll('*').remove()
    svg.attr('height', height).attr('width', width)

    const margin = { top: 20, right: 0, bottom: 30, left: 30 }

    const x = d3
      .scaleBand()
      .domain(d3.range(data.length).map((n) => n.toString()))
      .range([margin.left, width - margin.right])
      .padding(0.1)

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .nice()
      .range([height - margin.bottom, margin.top])

    const xAxis = (g) =>
      g.attr('transform', `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(x)
          .tickFormat((i) => data[i].label)
          .tickSizeOuter(0)
      )

    const yAxis = (g) =>
      g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(null, 's'))
        .call((g) => g.select('.domain').remove())
        .call((g) =>
          g.append('text').attr('y', 10).attr('fill', 'currentColor').attr('text-anchor', 'start').text(data.y)
        )

    const div = d3.select('#tooltip').style('opacity', 0)

    svg
      .append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d, i) => x(i))
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => y(0) - y(d.value))
      .attr('width', x.bandwidth())
      .attr('fill', (d) => d.color)
      .on('mouseover', function (event, d) {
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
  }, [node, data, data.length, height, width])

  return <svg ref={node}></svg>
})

export default BarChart
