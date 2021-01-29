//@ts-nocheck
import React, { useRef, useEffect, memo, useState } from 'react'
import { SimpleChartDataType } from 'types'
import * as d3 from 'd3'
import legend from './Legend'

import displayDigit from 'utils/displayDigit'

type PieChartProps = {
  data: SimpleChartDataType[] | 'loading'
  height?: number
  width?: number
}

const PieChart: React.FC<PieChartProps> = memo(({ data, height = 250, width = 250 }) => {
  const node = useRef<SVGSVGElement | null>(null)
  const [legendHtml, setLegend] = useState()

  useEffect(() => {
    const svg = d3.select(node.current)
    svg.selectAll('*').remove()
    svg
      .attr('height', height)
      .attr('width', width)
      .attr('viewBox', [-width / 2, -height / 2, width, height])
    // const radius = (Math.min(width, height) / 2 - 15) * 0.6

    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.label))
      .range(data.map((d) => d.color))

    const radius = Math.min(width, height) / 2 - 25

    const pie = d3
      .pie<DataType>()
      // .sort(null)
      .value((d) => d.value)

    const arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius - 1)

    // const arcLabel = d3.arc().innerRadius(radius).outerRadius(radius)

    const arcs = pie(data)

    svg
      .append('g')
      .attr('stroke', 'white')
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('fill', (d) => color(d.data.label))
      .attr('d', arc)

    setLegend(
      legend({
        color: color,
        columns: '200px',
        dataValues: data.map((entry) => displayDigit(entry.value))
      })
    )
  }, [node, data, height, width])

  return (
    <div style={{ display: 'flex' }}>
      <svg ref={node}></svg>
      <div style={{ display: 'flex' }} dangerouslySetInnerHTML={{ __html: legendHtml }} />
    </div>
  )
})

export default PieChart
