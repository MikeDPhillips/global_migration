const fancyWidth = 600
const fancyHeight = 600
const fancyMargin = { top:10, right:10, bottom:10, left:10}
const fancy_chart_Width = fancyWidth - fancyMargin.left -fancyMargin.right
const fancy_chart_Height = fancyHeight - fancyMargin.top - fancyMargin.bottom
let fancy_colorScale = d3.scaleOrdinal()
    .domain(['Africa','Asia','Europe','Latin America','North America','Oceania'])
    .range(['#4e79a7','#f28e2c','#e15759','#76b7b2','#59a14f','#edc949'])

let fsvgContainer = d3.select('#fancy-chart');
let fancySvg = fsvgContainer.append("svg")
    .attr("id", "fancy")
    .attr("width", fancyWidth)
    .attr("height", fancyHeight)

let fancyChart = fancySvg.append("g").attr("transform", `translate(${fancyMargin.left}, ${fancyMargin.top})`)

let legends = d3.select("#legendDiv")
    .append("svg")
    .attr('width', 600)
    .attr('height',100)
    .append('g')
    .attr('transform', 'translate(0, 30)')
xAxis = d3.axisBottom()
yAxis = d3.axisLeft()


yAxisG = fancyChart.append("g")
    .attr("class", "yAxis")
    //.attr("transform","translate("+fancyMargin.left+","+(fancyMargin.top)+")")
    //.attr("transform","translate(50,"+(fancyMargin.top-10)+")") //30
    .attr("transform", "translate(87,0)")

xAxisG = fancyChart.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(" + fancyMargin.left + "," + (fancy_chart_Height + fancyMargin.top) + ")")
    .attr("transform", "translate(0,290)")


function fancy_createChart(allPop) {

  fancyChart.append("text")
      .attr("class", "fancyLabel")
      .attr("text-anchor", "end")
      .attr("x", 580)
      .attr("y", 340)
      .text("Natural Increase Rate");

  //add y-axis label
  fancyChart.append("text")
      .attr("class", "fancyLabel")
      .attr("text-anchor", "end")
      //.attr("transform", "rotate(-90)")
      .attr("x", 85)
      .attr("y", 30)
      .text("Migration Rate");

  //build legends
  let title = legends.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', 'black')
      .attr('font-family', 'Helvetica Neue, Arial')
      .attr('font-weight', 'bold')
      .attr('font-size', '12px')
      .text('Region');

  let legendName = [
    {index: 0, label: 'Africa'},
    {index: 1, label: 'Asia'},
    {index: 2, label: 'Europe'},
    {index: 3, label: 'Latin America'},
    {index: 4, label: 'North America'},
    {index: 5, label: 'Oceania'},
  ];

  console.log(legendName)

  let entries = legends
      .selectAll('g')
      .data(legendName)
      .join('g')
      .attr('transform', d => `translate(${20 + d.index * 100},20)`);

  let symbols = entries.append('rect')
      .attr('width', 8)
      .attr('height', 8)
      .attr('opacity', 1)
      .style('fill', d => fancy_colorScale(d.label));

  let labels = entries
      .append('text')
      .attr('x', 14)
      .attr('y', 4)
      .attr('fill', 'black')
      .attr('font-family', 'Helvetica Neue, Arial')
      .attr('font-size', '11px')
      .text(d => d.label);


  fancy_updateChart(window.startYear);
}


  //circle
  function fancy_updateChart(newYear) {

    d3.selectAll("circle")
        .remove()

    //d3.selectAll("#myDataViz > *").remove();
    let xKey = "natural_increase"
    let yKey = "mig_rate"
    let year = Number(newYear);


    let allPop = window.popData;
    let filteredX = allPop.filter(function (d) {
      return(d.indicator === xKey)
    })
        .filter(d => d.year === year)
    let filteredY = allPop.filter(function (d) {
      return(d.indicator === yKey)
    })
        .filter(d => d.year === year)

    let plotData = []

    for (let i = 0; i < filteredX.length; ++i) {
      plotData.push({
        country: filteredX[i].country,
        year: filteredX[i].year,
        xValue: filteredX[i].value,
        yValue: filteredY[i].value,
        region: filteredX[i].region
      });
    }

    let xExtent = d3.extent(plotData, d => d.xValue);
    let xScale = d3.scaleLinear()
        .domain(xExtent).range([0, fancy_chart_Width]);

    console.log("x")
    console.log(xExtent)
    //xExtent[0] = Math.floor(xExtent[0])
    //xExtent[1] = Math.ceil(xExtent[1])

    console.log(xExtent)

    let yExtent = d3.extent(plotData, d => d.yValue);
    console.log(yExtent)
    //yExtent[0] = Math.floor(yExtent[0])
    //yExtent[1] = Math.ceil(yExtent[1])
    let yScale = d3.scaleLinear().domain(yExtent).range([fancy_chart_Height, 0]);

    console.log(yExtent)

    yAxis.scale(yScale).ticks(10).tickFormat(d3.format(".1f"))
    yAxisG.transition().call(yAxis)
    xAxis.scale(xScale).tickFormat(d3.format(".1f"))
    xAxisG.transition().call(xAxis)


    fancyChart.append('g')
        .selectAll("circle")
        .data(plotData)
        .join(
            enter => {
              enter.append("circle")
                  .transition()
                  .duration(800)
                  .attr("cy", d => yScale(d.yValue))
                .attr("country", d => d.country)
                .attr("cx", d => {
                  return(xScale(d.xValue));
                })

                .attr("r", 7)
                .style("fill", d => fancy_colorScale(d.region))
                .style("opacity", 0.2)},
            update => {
              update.transition()
                  .duration(100)
                  .attr("country", d => d.country)
                  .attr("cx", d => {
                    return(xScale(d.xValue));
                  })
                  .attr("cy", d => yScale(d.yValue))
                  .attr("r", 7)
                  .style("fill", d => fancy_colorScale(d.region))
                  .style("opacity", 0.75)
            },
            exit => {
                  exit.remove()}
        );//end join


        fancyChart.selectAll("circle")
        .on("mouseover", function(event, d) {
          d3.selectAll("circle")
              .style("opacity", 0.1);
          d3.select(this)
              .transition()
              .duration(100)
              .attr("r",20)
              .style("opacity", 1)
              .style("stroke", 'black')
          d3.select('#selected-name').text(d.country)

        })
        .on("mouseout", function(d) {
          d3.selectAll("circle")
              .attr("r",7)
              .style("stroke",null)
              .style("opacity", 0.75)
        });
}

function newYearUpdate(newYear) {
  fancy_updateChart(newYear);
}





