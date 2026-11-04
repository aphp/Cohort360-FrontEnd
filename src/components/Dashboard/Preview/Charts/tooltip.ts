import * as d3 from 'd3'

type Tooltip = d3.Selection<d3.BaseType, unknown, HTMLElement, unknown>

/**
 * Tooltip text "value (share%)". The share is 0 when the total is 0, instead of "NaN%".
 */
export const formatValueWithShare = (value: number, total: number): string =>
  `${value} (${total ? Math.trunc((value / total) * 10000) / 100 : 0}%)`

export const showTooltip = (
  element: d3.BaseType,
  tooltip: Tooltip,
  event: MouseEvent,
  value: number,
  total: number
) => {
  d3.select(element).transition().duration(50).attr('opacity', '.5')
  tooltip.transition().duration(50).style('opacity', 1)
  tooltip
    .html(formatValueWithShare(value, total))
    .style('left', event.pageX + 10 + 'px')
    .style('top', event.pageY - 15 + 'px')
}

export const hideTooltip = (element: d3.BaseType, tooltip: Tooltip) => {
  d3.select(element).transition().duration(50).attr('opacity', '1')
  tooltip.transition().duration(50).style('opacity', 0)
}
