//@ts-nocheck
import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import legend from './Legend'

import { SimpleChartDataType } from 'types'

import displayDigit from 'utils/displayDigit'

type DonutChartProps = {
  data?: SimpleChartDataType[]
  height?: number
  width?: number
}

const DonutChart: React.FC<DonutChartProps> = ({ data, height = 250, width = 250 }) => {
  const node = useRef<SVGSVGElement | null>(null)
  const [legendHtml, setLegend] = useState()

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

    const div = d3.select('#tooltip').style('opacity', 0)

    svg
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('fill', (d) => color(d.data.label))
      .attr('d', arc)
      .on('mouseover', function (d) {
        d3.select(this).transition().duration('50').attr('opacity', '.5')
        div.transition().duration(50).style('opacity', 1)
        div
          .html(d.value)
          .style('left', d3.event.pageX + 10 + 'px')
          .style('top', d3.event.pageY - 15 + 'px')
      })
      .on('mouseout', function () {
        d3.select(this).transition().duration('50').attr('opacity', '1')
        div.transition().duration(50).style('opacity', 0)
      })

    setLegend(
      legend({
        color: color,
        columns: '250px',
        dataValues: data.map((entry) => displayDigit(entry.value))
      })
    )
  }, [node, data, height, width])

  return (
    <>
      <div style={{ display: 'flex' }}>
        <svg ref={node}></svg>
        <div style={{ display: 'flex' }} dangerouslySetInnerHTML={{ __html: legendHtml }} />
      </div>
    </>
  )
}

export default DonutChart
