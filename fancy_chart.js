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
).then( ([long]) => {
    console.log("Here comes the csv")
    console.log("LONG")
    let newLong = long.filter(function(d){return d.indicator == "growth_rate" || d.indicator == "natural_increase"})
    let long1 = newLong.filter(function(d){return d.indicator == "growth_rate"})
    let long2 = newLong.filter(function(d){return d.indicator == "natural_increase"})

    console.log(newLong)
    console.log(long1)
    console.log(long2)

    let growthExtent = d3.extent(long1, d => d.value);
    let growthScale = d3.scaleLinear()
        .domain(growthExtent).range([0, fancy_chart_Width]);

    console.log(growthExtent)

    let naturalExtent = d3.extent(long2, d=>d.value);
    let naturalScale = d3.scaleLinear().domain(naturalExtent).range([fancy_chart_Height, 0]);

    console.log(naturalExtent)
    let naturalMax = d3.max(long2,function(d){return d.value;})
    console.log(naturalMax)

    let yAxis = d3.axisLeft(naturalScale).ticks(10).tickFormat(d3.format(".3f"))
    let xAxis = d3.axisBottom(growthScale).tickFormat(d3.format(".1f"))


    fancySvg.append("g")
        .attr("transform","translate("+fancyMargin.left+","+(fancyMargin.top)+")")
        .attr("transform","translate(50,"+(fancyMargin.top-10)+")") //30
        .call(yAxis);

    fancySvg.append("g")
        .attr("class","xAxis")
       // .attr("transform","translate("+fancyMargin.left+","+(fancy_chart_Height+fancyMargin.top)+")")
        .attr("transform","translate(50,"+(fancy_chart_Height-220)+")") //20
        .call(xAxis);
})