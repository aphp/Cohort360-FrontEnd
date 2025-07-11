import { Tooltip } from '@mui/material'
import React from 'react'
import { useAppSelector } from 'state'
import { displayCount } from 'utils/numbers'

export type CriteriaCountType = {
  display: string
  value?: number
}

export const hasStageDetails = (extra: Record<string, string> | undefined): 'all' | 'ratio' | null => {
  if (extra) {
    const criteriaCountKeys = Object.keys(extra).filter((key) => key.startsWith('criteria_count_'))
    const criteriaRatioKeys = Object.keys(extra).filter((key) => key.startsWith('criteria_ratio_'))
    if (criteriaCountKeys.length > 0) {
      return 'all'
    } else if (criteriaRatioKeys.length > 0) {
      return 'ratio'
    }
  }
  return null
}

export const getStageDetails = (
  itemId: number,
  idRemap: Record<number, number>,
  stageDetails?: Record<string, string>
): CriteriaCountType | undefined => {
  const id = idRemap[itemId] || itemId
  const countDetail = stageDetails?.[`criteria_count_${id}`]
  const ratioDetail = stageDetails?.[`criteria_ratio_${id}`]
  if (countDetail !== undefined) {
    const criteriaCountValue = parseFloat(countDetail)
    return { display: displayCount(criteriaCountValue), value: criteriaCountValue }
  }
  if (ratioDetail !== undefined) {
    const criteriaCountValue = parseFloat(ratioDetail)
    return { display: `${(criteriaCountValue * 100).toFixed(0)}%` }
  }
  return undefined
}

type CriteriaCountProps = {
  criteriaCount?: CriteriaCountType
  extraLeftMargin?: number
}

const CriteriaCount = ({ criteriaCount, extraLeftMargin = 0 }: CriteriaCountProps) => {
  const { detailedMode } = useAppSelector((state) => state.preferences.requests)
  if (detailedMode) {
    const displayCount = criteriaCount
      ? () => {
          if (criteriaCount?.value) {
            return (
              <Tooltip
                placement="left"
                title={criteriaCount.value.toString()}
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: 'offset',
                        options: {
                          offset: [0, -8]
                        }
                      }
                    ]
                  }
                }}
              >
                <div>{criteriaCount.display}</div>
              </Tooltip>
            )
          }
          return <div>{criteriaCount.display}</div>
        }
      : () => {
          return (
            <>
              <span
                className="loader"
                style={{
                  margin: '0 auto 4px auto',
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ccc',
                  borderTop: '2px solid #333',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  display: 'inline-block'
                }}
              />

              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg);}
                    100% { transform: rotate(360deg);}
                  }
                `}
              </style>
            </>
          )
        }
    try {
      return (
        <div
          className="criteria-count"
          style={{
            position: 'absolute',
            left: -41 + extraLeftMargin,
            top: '50%',
            transform: 'translateY(-100%)',
            padding: '2px 6px',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'center',
            width: '40px',
            color: 'black',
            zIndex: 1
          }}
        >
          {displayCount()}
        </div>
      )
    } catch (e) {
      console.log('Error parsing criteria count', e)
    }
  }
  return null
}

export default CriteriaCount
