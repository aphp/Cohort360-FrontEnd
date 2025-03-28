import React from 'react'

const displayCount = (criteriaCount: number) => {
  if (criteriaCount < 1000) {
    return criteriaCount.toString() // Normal values (less than 1,000)
  } else if (criteriaCount < 1000000) {
    return `~${Math.round(criteriaCount / 1000)}k` // Thousands
  } else if (criteriaCount < 1000000000) {
    return `~${Math.round(criteriaCount / 1000000)}M` // Millions
  } else if (criteriaCount < 1000000000000) {
    return `~${Math.round(criteriaCount / 1000000000)}B` // Billions
  }
  return `~${Math.round(criteriaCount / 1000000000000)}T` // Trillions
}

export const getStageDetails = (
  itemId: number,
  idRemap: Record<number, number>,
  stageDetails?: Record<string, string>
) => {
  const id = idRemap[itemId] || itemId
  const countDetail = stageDetails?.[`criteria_count_${id}`]
  const ratioDetail = stageDetails?.[`criteria_ratio_${id}`]
  if (countDetail !== undefined) {
    const criteriaCountValue = parseFloat(countDetail)
    return displayCount(criteriaCountValue)
  }
  if (ratioDetail !== undefined) {
    const criteriaCountValue = parseFloat(ratioDetail)
    return `${(criteriaCountValue * 100).toFixed(0)}%`
  }
  return undefined
}

type CriteriaCountProps = {
  criteriaCount?: string
  extraLeftMargin?: number
}

const CriteriaCount = ({ criteriaCount, extraLeftMargin = 0 }: CriteriaCountProps) => {
  if (criteriaCount) {
    try {
      return (
        <div
          style={{
            position: 'absolute',
            left: -42 + extraLeftMargin,
            top: '50%',
            transform: 'translateY(-100%)',
            padding: '2px 6px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'black',
            zIndex: 1
          }}
        >
          {criteriaCount}
        </div>
      )
    } catch (e) {
      console.log('Error parsing criteria count', e)
    }
  }
  return null
}

export default CriteriaCount
