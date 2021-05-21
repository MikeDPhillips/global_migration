const fancyWidth = 600
const fancyHeight = fancyWidth*.618
const fancyMargin = { top:10, right:10, bottom:10, left:10}
const fancy_chart_Width = wmWidth - wmMargin.left -wmMargin.right
const fancy_chart_Height = wmHeight - wmMargin.top - wmMargin.bottom

let fancySvg = d3.select("#fancy-chart").append("svg")
    .attr("id", "fancy")
    .attr("width", fancyWidth)
    .attr("height", fancyHeight)

let fancyChart = fancySvg.append("g").attr("transform", `translate(${fancyMargin.left}, ${fancyMargin.top})`)

Promise.all([
    d3.csv("data/pop_data_long.csv", d3.autoType())]
).then( ([allPop]) => {

   allPop.forEach( d => {
        d.value = Number(d.value);
        d.year = Number(d.year);
    })

    console.log(allPop)

  let xKey = "growth_rate"
  let yKey = "natural_increase"
  let year = 2016

  let filteredX= allPop.filter(function(d){return d.indicator == "growth_rate" })
      .filter(d => d.year==year)
  let filteredY= allPop.filter(function(d){return d.indicator == "natural_increase" })
      .filter(d => d.year==year)

  console.log(filteredX)
  console.log(filteredY)

  let plotData = []

  for (let i = 0; i < filteredX.length; ++i) {
    plotData.push({
      country : filteredX[i].country,
      year : filteredX[i].year,
      xValue : filteredX[i].value,
      yValue : filteredY[i].value
    });
  }

  console.log(plotData);


    let xExtent = d3.extent(plotData, d => d.xValue);
    let xScale = d3.scaleLinear()
        .domain(xExtent).range([0, fancy_chart_Width]);

    console.log(xExtent)

    let yExtent = d3.extent(plotData, d=>d.yValue);
    let yScale = d3.scaleLinear().domain(yExtent).range([fancy_chart_Height, 0]);

    console.log(yExtent)

    let yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(d3.format(".3f"))
    let xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".1f"))


    fancySvg.append("g")
        .attr("transform","translate("+fancyMargin.left+","+(fancyMargin.top)+")")
        .attr("transform","translate(50,"+(fancyMargin.top-10)+")") //30
        .call(yAxis);

    fancySvg.append("g")
        .attr("class","xAxis")
       // .attr("transform","translate("+fancyMargin.left+","+(fancy_chart_Height+fancyMargin.top)+")")
        .attr("transform","translate(50,"+(fancy_chart_Height-220)+")") //20
        .call(xAxis);

    fancySvg.append('g')
        .selectAll("dot")
        .data(plotData)
        .enter()
        .append("circle")
        .attr("country", d => d.country)
        .attr("cx", d => {
          return(xScale(d.xValue))
        })
        .attr("cy", d => yScale(d.yValue))
        .attr("r", 5)
        .style("fill", "#69b3a2")

})