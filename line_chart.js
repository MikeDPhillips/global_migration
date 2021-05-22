const lineWidth = 400
const lineHeight = 400
const lineMargin = { top:10, right:10, bottom:10, left:10}
const line_chart_Width = lineWidth - lineMargin.left -lineMargin.right
const line_chart_Height = lineHeight - lineMargin.top - lineMargin.bottom

let lineSvg = lineSvgContainer.append("svg")
    .attr("id", "lineSvg")
    .attr("width", lineWidth)
    .attr("height", lineHeight)

let lineChart = lineSvg.append("g").attr("transform", `translate(${lineMargin.left}, ${lineMargin.top})`)