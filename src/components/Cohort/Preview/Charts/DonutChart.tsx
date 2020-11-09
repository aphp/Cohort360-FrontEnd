//@ts-nocheck
import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'

import { SimpleChartDataType } from 'types'

type DonutChartProps = {
  data?: SimpleChartDataType[]
  height?: number
  width?: number
}

const DonutChart: React.FC<DonutChartProps> = ({ data, height = 250, width = 260 }) => {
  const node = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!data) {
      return
    }
    const svg = d3.select(node.current)
    svg.selectAll('*').remove()
    svg.attr('height', height).attr('width', width)

    svg.attr('viewBox', [-width / 2, -height / 2, width, height])

    const radius = Math.min(width, height) / 2 - 25

    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.label))
      .range(data.map((d) => d.color))

    const pie = d3
      .pie<SimpleChartDataType>()
      .padAngle(0.01)
      .sort(null)
      .value((d) => d.value)

    const arcs = pie(data)

    const arc = d3
      .arc()
      .innerRadius(radius * 0.8)
      .outerRadius(radius - 1)

    svg
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('fill', (d) => color(d.data.label))
      .attr('d', arc)
      .append('title')
      .text((d) => `${d.data.label}: ${d.data.value.toString()}`)

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
          .text((d) => d.data.label)
      )
      .call((text) =>
        text
          .filter((d) => d.endAngle - d.startAngle > 0.25)
          .append('tspan')
          .attr('x', 0)
          .attr('y', '0.7em')
          .attr('fill-opacity', 0.7)
          .text((d) => d.data.value.toString())
      )
  }, [node, data, height, width])

  return <svg ref={node}></svg>
}

export default DonutChart
