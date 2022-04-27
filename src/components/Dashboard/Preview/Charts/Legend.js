const legend = ({
  color,
  columns = null,
  dataValues = null,
  swatchSize = 15,
  swatchWidth = swatchSize,
  swatchHeight = swatchSize,
  marginLeft = 0
}) => {
  return `
      <div style="display: flex; align-items: center; margin-left: ${+marginLeft}px; min-height: 33px; font: 10px sans-serif;">
        <style>
          .circle {
            height: 10px;
            width: 10px;
            border-radius: 50%;
            display: inline-block;
            border: 1px solid #868E96;
          }

          .legend {
            display: inline-flex;
            align-items: center;
            margin-right: 1em;
            margin-left: 4px;
          }

          .container {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            align-items: center;
          }

          .circle::before {
            content: '';
            width: ${+swatchWidth}px;
            height: ${+swatchHeight}px;
            margin-right: 0.5em;
            background: var(--color);
          }

          .line {
            display: flex;
            align-items: center;
            margin-top: 8px;
          }

          .bold {
            font-weight: bold;
          }
        </style>
        <div ${columns !== null ? `style="width: 100%; columns: ${columns}"` : 'class="container"'}>
        ${color
          .domain()
          .map(
            (value, index) =>
              `<div class="line">
                  <span class="circle" style="background-color: ${color(value)}"></span> 
                  <span class="legend" >
                    ${value}
                    <span class="bold">${dataValues !== null ? `: ${dataValues[index]}` : ''}</span>
                  </span>
              </div>`
          )
          .join('')}
        </div>
      </div>

    `
}

export default legend
