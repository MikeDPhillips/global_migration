const fancyWidth = 600
const fancyHeight = 600
const fancyMargin = { top:10, right:10, bottom:10, left:10}
const fancy_chart_Width = fancyWidth - fancyMargin.left -fancyMargin.right
const fancy_chart_Height = fancyHeight - fancyMargin.top - fancyMargin.bottom


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

Promise.all([d3.csv("data/pop_data_long.csv", d3.autoType())]
).then( ([allPop])  => {

   allPop.forEach( d => {
        d.value = Number(d.value);
        d.year = Number(d.year);
    })

    console.log(allPop)

    let xKey = "natural_increase"
    let yKey = "growth_rate"
    let year = 2016

  let filteredX= allPop.filter(function(d){return d.indicator == xKey })
      .filter(d => d.year==year)
  let filteredY= allPop.filter(function(d){return d.indicator == yKey })
      .filter(d => d.year==year)

  console.log(filteredX)
  console.log(filteredY)

  let plotData = []

  for (let i = 0; i < filteredX.length; ++i) {
    plotData.push({
      country : filteredX[i].country,
      year : filteredX[i].year,
      xValue : filteredX[i].value,
      yValue : filteredY[i].value,
        region : filteredX[i].region
    });
  }

  console.log(plotData);

  window.allData = plotData;

   let xExtent = d3.extent(plotData, d => d.xValue);
    let xScale = d3.scaleLinear()
        .domain(xExtent).range([0, fancy_chart_Width]);

    console.log(xExtent)

    let yExtent = d3.extent(plotData, d=>d.yValue);
    let yScale = d3.scaleLinear().domain(yExtent).range([fancy_chart_Height, 0]);

    console.log(yExtent)

    let yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(d3.format(".1f"))
    let xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".1f"))


    fancyChart.append("g")
        //.attr("transform","translate("+fancyMargin.left+","+(fancyMargin.top)+")")
        //.attr("transform","translate(50,"+(fancyMargin.top-10)+")") //30
        .attr("transform","translate(90,10)")
        .call(yAxis);

    fancyChart.append("g")
        .attr("class","xAxis")
        .attr("transform","translate("+fancyMargin.left+","+(fancy_chart_Height+fancyMargin.top)+")")
        .attr("transform","translate(10,341)")
        .call(xAxis);

    fancyChart.append("text")
        .attr("class","fancyLabel")
        .attr("text-anchor", "end")
        .attr("x", 580)
        .attr("y", 380)
        .text("Natural Increase Rate");

    //add y-axis label
    fancyChart.append("text")
        .attr("class","fancyLabel")
        .attr("text-anchor", "end")
        //.attr("transform", "rotate(-90)")
        .attr("x", 85)
        .attr("y", 30)
        .text("Growth Rate");

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
        { index: 0, label: 'Africa' },
        { index: 1, label: 'Asia' },
        { index: 2, label: 'Europe' },
        { index: 3, label: 'Latin America' },
        { index: 4, label: 'North America' },
        { index: 5, label: 'Oceania' },
    ];

    console.log(legendName)

    let fancy_colorScale = d3.scaleOrdinal().domain(legendName)
        .range(['#edc949','#4e79a7','#f28e2c','#e15759','#76b7b2','#59a14f'])

    let entries = legends
        .selectAll('g')
        .data(legendName)
        .join('g')
        .attr('transform', d => `translate(${20 + d.index * 100},20)`);

    let symbols = entries.append('circle')
        .attr('cx',5) // <-- offset symbol x-position by radius
        .attr('r', 5)
        .style('fill', d=>fancy_colorScale(d.label));

    let labels = entries
        .append('text')
        .attr('x',14)
        .attr('y',4)
        .attr('fill', 'black')
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('font-size', '11px')
        .text(d=>d.label);

//tooltip
    let tooltip = fsvgContainer
        .append("div")
        .attr("class","tooltip")
        .style("position", "absolute")
        //.style("font-family", "'Open Sans', sans-serif")
        //.style("font-size", "12px")
        .style("z-index", "10")
        .style("background-color", "#A7CDFA")
        .style("color", "#B380BA")
        .style("border", "solid")
        .style("border-color", "#A89ED6")
        .style("padding", "5px")
        .style("border-radius", "2px")
        .style("visibility", "hidden");

    tooltip;

    fancy_updateChart(newYear)

    //circle
    function fancy_updateChart(newYear){
        fancyChart.append('g')
            .selectAll("dot")
            .data(plotData.filter(d => d.year === newYear))
            .append("circle")
            .transition()
            .duration(1000)
            .attr("country", d => d.country)
            .attr("cx", d => {
                return(xScale(d.xValue))
            })
            .attr("cy", d => yScale(d.yValue))
            .attr("r", 7)
            .style("fill", d=>fancy_colorScale(d.region))
            .style("opacity", "0.5")

            .on("mouseover", function(d) {
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("r",10)
                    .style("opacity", 1)
                tooltip.style("visibility", "visible").text(d['country']);

            })

            .on("mousemove", function(event,d){
                let[x, y] = d3.pointer(event);
                tooltip.style("top", (y)+"px")
                    .style("left",(x)+"px")
                    .text(d['country'])})

            .on("mouseout", function(d) {
                    tooltip.style("visibility", "hidden");
                    d3.selectAll("circle")
                        .attr("r",7)
                        .style("opacity",0.5)
                }
            );

    }




    });



