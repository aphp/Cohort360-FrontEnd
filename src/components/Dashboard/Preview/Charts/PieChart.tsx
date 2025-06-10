//@ts-nocheck
import React, { useRef, useEffect, memo, useState } from 'react'
import { SimpleChartDataType } from 'types'
import * as d3 from 'd3'
import legend from './Legend'

import { format } from 'utils/numbers'

import useStyles from './styles'

type PieChartProps = {
  data: SimpleChartDataType[] | 'loading'
  height?: number
  width?: number
}

const PieChart: React.FC<PieChartProps> = memo(({ data, height = 250, width = 250 }) => {
  const { classes } = useStyles()

  const node = useRef<SVGSVGElement | null>(null)
  const [legendHtml, setLegend] = useState()

  const total_value =
    data && data.length > 0 ? data.reduce((a, b) => (typeof a === 'number' ? a + b.value : a.value + b.value)) : 0

  useEffect(() => {
    const svg = d3.select(node.current)
    svg.selectAll('*').remove()
    svg
      .attr('height', height)
      .attr('width', width)
      .attr('viewBox', [-width / 2, -height / 2, width, height])

    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.label))
      .range(data.map((d) => d.color))

    const radius = Math.min(width, height) / 2 - 25

    const pie = d3.pie<DataType>().value((d) => d.value)

    const arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius - 1)

    const arcs = pie(data)

    const div = d3.select('#tooltip').style('opacity', 0)

    svg
      .append('g')
      .attr('stroke', 'white')
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('fill', (d) => color(d.data.label))
      .attr('d', arc)
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

    setLegend(
      legend({
        color: color,
        columns: '200px',
        dataValues: data.map((entry) => format(entry.value))
      })
    )
  }, [node, data, height, width, total_value])

  return (
    <>
      <div style={{ display: 'flex' }}>
        <svg id="vital-repartition-card-svg" ref={node}></svg>
        <div style={{ display: 'flex' }} dangerouslySetInnerHTML={{ __html: legendHtml }} />
      </div>
      <div id="tooltip" className={classes.tooltip} />
    </>
  )
})

export default PieChart
