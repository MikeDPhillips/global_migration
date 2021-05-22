const lineWidth = 400
const lineHeight = 400
const lineMargin = { top:10, right:10, bottom:10, left:10}
const line_chart_Width = lineWidth - lineMargin.left -lineMargin.right
const line_chart_Height = lineHeight - lineMargin.top - lineMargin.bottom

let lineSvgContainer = d3.select('#country-chart');
let lineSvg = lineSvgContainer.append("svg")
    .attr("id", "lineSvg")
    .attr("width", lineWidth)
    .attr("height", lineHeight)

let lineChart = lineSvg.append("g").attr("transform", `translate(${lineMargin.left}, ${lineMargin.top})`)

d3.csv("pop_data_long.csv",d3.autoType).then((data)=>{
    console.log(data)
})

