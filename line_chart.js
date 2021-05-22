const lineWidth = 700
const lineHeight = 600
const lineMargin = { top:10, bottom:25, left:50,right:50}
const line_chart_Width = lineWidth - lineMargin.left - lineMargin.right;
const line_chart_Height = lineHeight - lineMargin.top - lineMargin.bottom

let lineSvgContainer = d3.select('#country-chart');
let lineSvg = lineSvgContainer.append("svg")
    .attr("id", "lineSvg")
    .attr("width", lineWidth)
    .attr("height", lineHeight)


let annotations = lineSvg.append("g").attr("id","annotations");

let lineChart = lineSvg.append("g").attr("transform", `translate(${lineMargin.left}, ${lineMargin.top})`)

let linelegends = d3.select("#linelegendDiv")
    .append("svg")
    .attr('width', lineWidth)
    .attr('height',100)
    .append('g')
    .attr('transform', 'translate(50, 0)')


line_xAxis = d3.axisBottom()

line_xAxisG = annotations.append("g")
    .attr("class", "line_xAxis")
    .attr("transform",`translate(${lineMargin.left},${line_chart_Height+lineMargin.top})`)


line_yAxis = d3.axisLeft()


line_yAxisG = annotations.append("g")
    .attr("class", "line_yAxis")
    .attr("transform",`translate(${lineMargin.left},${lineMargin.top})`)







function createLineChart(data) {
    updateLineChart(data, "United States");

}

function updateLineChart(data, new_country) {

    let age5 = "age5_14"
    let age15 = "age15_24"
    let age25 = "age25_64"
    let age65 = "age65"
    let country = new_country;
    let line_colorScale = ["#E3F4DE","#8FD4BD","#42A6CC","#084081"]

    d3.select('p#country-name').text(country)

    console.log("Performing update for " + country);
    let filtered5= data.filter(function(d){return d.indicator === age5 }).filter(d => d.country===country)

    let filtered15= data.filter(function(d){return d.indicator === age15 }).filter(d => d.country===country)

    let filtered25= data.filter(function(d){return d.indicator === age25 }).filter(d => d.country===country)

    let filtered65= data.filter(function(d){return d.indicator === age65 }).filter(d => d.country===country)

    let newData = []

    for (let i = 0; i < filtered5.length; ++i) {
        newData.push({
            country : filtered5[i].country,
            year : filtered5[i].year,
            age5Value : filtered5[i].value,
            age15Value : filtered15[i].value,
            age25Value : filtered25[i].value,
            age65Value : filtered65[i].value,
            region : filtered5[i].region
        });
    }

    // create stack
    let mygroups = ["age5Value", "age15Value", "age25Value","age65Value"] // list of group names
    let stack = d3.stack().keys(mygroups)
    let stackedValues = stack(newData);
    let stackedData = [];

    // Copy the stack offsets back into the data.
    stackedValues.forEach((layer,index)=>{
        let currentStack = [];
        layer.forEach((d,i)=>{
            currentStack.push({
                values:d,
                year:newData[i].year
            });
        });
        stackedData.push(currentStack)
    });

    //set up x and y scale
    let yScale = d3
        .scaleLinear()
        .range([line_chart_Height, 0])
        .domain([0, d3.max(stackedValues[stackedValues.length - 1], dp => dp[1])]);

    line_yAxis.scale(yScale).ticks().tickFormat(d3.format(".3s"))
    line_yAxisG.call(line_yAxis);

    let a = d3.max(stackedValues[stackedValues.length - 1], dp => dp[1])

    let xScale = d3
        .scaleLinear()
        .range([0, line_chart_Width])
        .domain(d3.extent(newData, dataPoint => dataPoint.year));


    // Add the X Axis
    line_xAxis.scale(xScale).ticks().tickFormat(d3.format("d"));
    line_xAxisG.call(line_xAxis)


    let area = d3
        .area()
        .x(dataPoint => xScale(dataPoint.year))
        .y0(dataPoint => yScale(dataPoint.values[0]))
        .y1(dataPoint => yScale(dataPoint.values[1]));

    d3.selectAll(".series")
        .remove()

    let series = lineChart
        .selectAll(".series")
        .data(stackedData)
        .join(
        enter => {
            enter.append("g")
                .attr("class", "series")
           .append("path")
                .style("fill", (d, i) => line_colorScale[i])
                .style("opacity", 0.75)
                .attr("d", d => area(d))
        },
        update => {
            update.transition()
                .duration(100)
                .style("fill", (d, i) => line_colorScale[i])
                .style("opacity", 0.75)
                .attr("d", d => area(d))
        },
            exit => {exit.remove()}
);//end join


    //Add legends
    let line_legend_title = linelegends.append('text')
        .attr('x', 20)
        .attr('y', 20)
        .attr('fill', 'black')
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('font-weight', 'bold')
        .attr('font-size', '12px')
        .text('Age Group');

    let line_legendName = [
        { index: 0, label: 'Age 5-14' },
        { index: 1, label: 'Age 15-24' },
        { index: 2, label: 'Age 25-64' },
        { index: 3, label: 'Age 65 and above' },
    ];

    let line_legend_colorScale = d3.scaleOrdinal().domain(line_legendName)
        .range(["#084081","#E3F4DE","#8FD4BD","#42A6CC"])

    let line_entries = linelegends
        .selectAll('g')
        .data(line_legendName)
        .join('g')
        .attr('transform', d => `translate(${20 + d.index * 80},50)`);

    let line_symbols = line_entries.append('circle')
        .attr('cx',5) // <-- offset symbol x-position by radius
        .attr('r', 5)
        .style('fill', d=>line_legend_colorScale(d.label));

    let labels = line_entries
        .append('text')
        .attr('x',14)
        .attr('y',4)
        .attr('fill', 'black')
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('font-size', '11px')
        .text(d=>d.label);
}


function newCountryUpdate(country) {
    updateLineChart(window.popData, country);
}