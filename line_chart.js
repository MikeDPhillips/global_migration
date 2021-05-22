const lineWidth = 400
const lineHeight = 400
const lineMargin = { top:10, bottom:10, left:10,right:10}
const line_chart_Width = lineWidth - lineMargin.left
const line_chart_Height = lineHeight - lineMargin.top - lineMargin.bottom

let lineSvgContainer = d3.select('#country-chart');
let lineSvg = lineSvgContainer.append("svg")
    .attr("id", "lineSvg")
    .attr("width", lineWidth)
    .attr("height", lineHeight)


let lineChart = lineSvg.append("g").attr("transform", `translate(${lineMargin.left}, ${lineMargin.top})`)

let linelegends = d3.select("#linelegendDiv")
    .append("svg")
    .attr('width', 400)
    .attr('height',100)
    .append('g')
    .attr('transform', 'translate(0, 30)')


d3.csv("data/pop_data_long.csv",d3.autoType).then((data)=>{
    console.log(data)

    data.forEach( d => {
        d.value = Number(d.value);
        d.year = Number(d.year);
    })

    console.log(data)

    let age5 = "age5_14"
    let age15 = "age15_24"
    let age25 = "age25_64"
    let age65 = "age65"
    let country = "Afghanistan"
    let line_colorScale = ["#E3F4DE","#8FD4BD","#42A6CC","#084081"]

    d3.select('p#country-name').text(country)

    let filtered5= data.filter(function(d){return d.indicator == age5 }).filter(d => d.country==country)

    let filtered15= data.filter(function(d){return d.indicator == age15 }).filter(d => d.country==country)

    let filtered25= data.filter(function(d){return d.indicator == age25 }).filter(d => d.country==country)

    let filtered65= data.filter(function(d){return d.indicator == age65 }).filter(d => d.country==country)

    console.log(filtered5)
    console.log(filtered15)
    console.log(filtered25)
    console.log(filtered65)

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

    console.log(newData);


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

    console.log(stackedData)
    console.log(stackedValues)

    //set up x and y scale
    let yScale = d3
        .scaleLinear()
        .range([line_chart_Height, 0])
        .domain([0, d3.max(stackedValues[stackedValues.length - 1], dp => dp[1])]);

    let a = d3.max(stackedValues[stackedValues.length - 1], dp => dp[1])
    console.log(a)

    let xScale = d3
        .scaleLinear()
        .range([0, line_chart_Width])
        .domain(d3.extent(newData, dataPoint => dataPoint.year));

    // Add the X Axis
    lineChart
        .append("g").attr("transform",'translate(20,370)')
        //.attr("transform", `translate(0,${line_chart_Height})`)
        .call(d3.axisBottom(xScale).ticks(5));

    // Add the Y Axis
    lineChart
        .append("g")
        .attr("transform", `translate(20, -10)`)
        .call(d3.axisLeft(yScale).tickFormat(d3.format(".0s")));



    let area = d3
        .area()
        .x(dataPoint => xScale(dataPoint.year))
        .y0(dataPoint => yScale(dataPoint.values[0]))
        .y1(dataPoint => yScale(dataPoint.values[1]));

    let series = lineChart
        .selectAll(".series")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("class", "series");

    series
        .append("path")
        .attr("transform", `translate(20,-10)`)
        .style("fill", (d, i) => line_colorScale[i])
        .style("opacity",0.75)
        //.attr("stroke", "steelblue")
        //.attr("stroke-linejoin", "round")
        //.attr("stroke-linecap", "round")
        //.attr("stroke-width", 1.5)
        .attr("d", d => area(d));

    //Add legends
    let line_legend_title = linelegends.append('text')
        .attr('x', 0)
        .attr('y', 0)
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
        .attr('transform', d => `translate(${20 + d.index * 80},20)`);

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

})

