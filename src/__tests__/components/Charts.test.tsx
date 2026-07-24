import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import BarChart from 'components/Dashboard/Preview/Charts/BarChart'
import PieChart from 'components/Dashboard/Preview/Charts/PieChart'
import DonutChart from 'components/Dashboard/Preview/Charts/DonutChart'
import { SimpleChartDataType } from 'types'
import { GenderStatusLabel } from 'types/searchCriterias'

const data: SimpleChartDataType[] = [
  { label: GenderStatusLabel.FEMALE, value: 10, color: '#f00' },
  { label: GenderStatusLabel.MALE, value: 8, color: '#00f' },
  { label: 'Autre', value: 2, color: '#0f0' }
]

describe('Charts - rendu D3 sur SVG', () => {
  it('BarChart rend un SVG avec les données', () => {
    const { container } = render(<BarChart data={data} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('BarChart ne plante pas sans données', () => {
    const { container } = render(<BarChart />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('PieChart rend un SVG avec les données', () => {
    const { container } = render(<PieChart data={data} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('DonutChart rend un SVG avec les données', () => {
    const { container } = render(<DonutChart data={data} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('DonutChart gère l’absence de données', () => {
    const { container } = render(<DonutChart />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('les charts se redessinent quand les données changent', () => {
    const { container, rerender } = render(<BarChart data={data} />)
    rerender(<BarChart data={[{ label: GenderStatusLabel.MALE, value: 5, color: '#111' }]} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
