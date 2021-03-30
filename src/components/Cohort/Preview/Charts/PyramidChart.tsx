//@ts-nocheck
import React, { useRef, useEffect, memo, useState } from 'react'
import * as d3 from 'd3'
import legend from './Legend'

type PyramidProps = {
  data?: Map<number, { male: number; female: number; other?: number }>
  width?: number
  height?: number
}

const PyramidChart: React.FC<PyramidProps> = memo(({ data, width = 400, height = 250 }) => {
  const node = useRef<SVGSVGElement | null>(null)
  const [legendHtml, setLegend] = useState()

  useEffect(() => {
    if (!data || (data && !data.size)) {
      return
    }
    let valueMax = 0
    const sortedDataEntriesByAge = [...data.entries()].sort(([age1], [age2]) => age1 - age2)
    const minAge = sortedDataEntriesByAge[0][0]
    const maxAge = sortedDataEntriesByAge[sortedDataEntriesByAge.length - 1][0]
    const yValueMin = minAge - 1
    const yValueMax = maxAge + 1

    const customData: { age: number; male: number; female: number }[] = []

    // We need to fill all the ages not referred in the sortedData array
    for (let index = 0; index < yValueMax - yValueMin - 1; index++) {
      const age = yValueMin + index + 1
      const item = sortedDataEntriesByAge.find(([itemAge]) => itemAge === age)?.[1]

      if (item) {
        customData.push({ age, male: item.male, female: item.female })
        const { male: maleValue, female: femaleValue } = item
        if (valueMax < maleValue || valueMax < femaleValue) {
          valueMax = Math.max(femaleValue, maleValue)
        }
      } else {
        customData.push({
          age,
          male: 0,
          female: 0
        })
      }
    }
    const svg = d3.select(node.current)
    svg.selectAll('*').remove()
    svg.attr('height', height).attr('width', width)

    const margin = { top: 20, right: 20, bottom: 35, left: 30 }

    const femaleValue = d3
      .scaleLinear()
      .domain([0, valueMax])
      .range([width / 2, width - margin.right])

    const maleValue = d3
      .scaleLinear()
      .domain([0, valueMax])
      .range([width / 2, margin.left])

    const y = d3
      .scaleLinear()
      .domain([yValueMin, yValueMax])
      .nice()
      .range([height - margin.bottom, margin.top])

    const femaleAreaGenerator = d3
      .area()
      .curve(d3.curveLinear)
      .x0(width / 2)
      .x1((d) => femaleValue(d.female))
      .y((d) => y(d.age))

    const maleAreaGenerator = d3
      .area()
      .curve(d3.curveLinear)
      .x0(width / 2)
      .x1((d) => maleValue(d.male))
      .y((d) => y(d.age))

    const yAxis = (g) =>
      g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call((g) => g.select('.domain').remove())
        .call((g) =>
          g
            .select('.tick:last-of-type text')
            .clone()
            .attr('x', 3)
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
            .text('Ans')
        )

    const femaleAxis = (g) =>
      g.attr('transform', `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(femaleValue)
          .ticks(width / 80)
          .tickSizeOuter(0)
      )

    const maleAxis = (g) =>
      g.attr('transform', `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(maleValue)
          .ticks(width / 80)
          .tickSizeOuter(0)
      )
    svg.append('path').attr('d', femaleAreaGenerator(customData)).style('fill', '#FC568F')

    svg.append('path').attr('d', maleAreaGenerator(customData)).style('fill', '#78D4FA')

    svg.append('g').call(femaleAxis)

    svg.append('g').call(maleAxis)

    svg.append('g').call(yAxis)

    setLegend(
      legend({
        color: d3.scaleOrdinal().domain(['Hommes', 'Femmes']).range(['#78D4FA', '#FC568F']),
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
})
export default PyramidChart
