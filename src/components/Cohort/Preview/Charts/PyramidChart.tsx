//@ts-nocheck
import React, { useRef, useEffect, memo } from 'react'
import * as d3 from 'd3'

type PyramidProps = {
  data?: Map<number, { male: number; female: number }>
  width?: number
  height?: number
}

const PyramidChart: React.FC<PyramidProps> = memo(({ data, width = 400, height = 250 }) => {
  const node = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!data) {
      return
    }
    let valueMax = 0
    const valuesPos = []
    const customData: { age: number; male: number; female: number }[] = []
    for (const entry of data.entries()) {
      const [age, ageGenderValues] = entry
      const maleValue = ageGenderValues.male
      const femaleValue = ageGenderValues.female
      customData.push({
        age,
        male: maleValue,
        female: femaleValue
      })

      if (valueMax < maleValue || valueMax < femaleValue) {
        valueMax = Math.max(femaleValue, maleValue)
      }
      if (femaleValue !== 0 || maleValue !== 0) {
        valuesPos.push(age)
      }
    }
    customData.sort((d1, d2) => d1.age - d2.age)
    const yValueMin = valuesPos[0] === 0 ? valuesPos[0] : valuesPos[0] - 1
    const yValueMax = valuesPos[valuesPos.length - 1] + 1

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

    svg.append('rect').attr('x', 315).attr('y', 10).attr('width', 10).attr('height', 10).attr('fill', '#FC568F')

    svg
      .attr('text-anchor', 'end')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .append('text')
      .attr('x', 370)
      .attr('y', 15)
      .attr('dy', '0.35em')
      .text('Femmes')

    svg.append('rect').attr('x', 315).attr('y', 25).attr('width', 10).attr('height', 10).attr('fill', '#78D4FA')

    svg
      .attr('text-anchor', 'end')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .append('text')
      .attr('x', 372)
      .attr('y', 30)
      .attr('dy', '0.35em')
      .text('Hommes')
  }, [node, data, height, width])

  return <svg ref={node}></svg>
})
export default PyramidChart
