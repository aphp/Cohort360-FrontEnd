//@ts-nocheck
import React, { useRef, useEffect, memo } from 'react'
import { SimpleChartDataType } from 'types'
import * as d3 from 'd3'

type PieChartProps = {
  data: SimpleChartDataType[]
  height?: number
  width?: number
}

const PieChart: React.FC<PieChartProps> = memo(({ data, height = 240, width = 200 }) => {
  const node = useRef<SVGSVGElement | null>(null)
  useEffect(() => {
    const svg = d3.select(node.current)
    svg.selectAll('*').remove()
    svg
      .attr('height', height)
      .attr('width', width)
      .attr('viewBox', [-width / 2, -height / 2, width, height])
    const radius = (Math.min(width, height) / 2 - 15) * 0.6

    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.label))
      .range(data.map((d) => d.color))

    const pie = d3
      .pie<DataType>()
      // .sort(null)
      .value((d) => d.value)

    const arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(Math.min(width, height) / 2)

    const arcLabel = d3.arc().innerRadius(radius).outerRadius(radius)

    const arcs = pie(data)

    svg
      .append('g')
      .attr('stroke', 'white')
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
})

export default PieChart
