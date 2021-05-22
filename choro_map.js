const wmWidth = 700
const wmHeight = 600
const wmMargin = { top:50, right:10, bottom:10, left:10}
const wmMapWidth = wmWidth - wmMargin.left -wmMargin.right
const wmMapHeight = wmHeight - wmMargin.top - wmMargin.bottom

let wmSvg = d3.select("svg#world")
    .attr("id", "world")
    .attr("width", wmWidth)
    .attr("height", wmHeight)


let wmAnn = wmSvg.append("g").attr("class", "annotations")

let wmMap = wmSvg.append("g").attr("transform", `translate(${wmMargin.left}, ${wmMargin.top})`)

let wmProjection = d3.geoNaturalEarth2()
    .scale(wmMapWidth / 1.3 / Math.PI)
    .translate([wmMapWidth / 2, wmMapHeight / 2]);

let wmPath = d3.geoPath().projection(wmProjection);

let indicator = 'total_pop'
let fillScale =null;
function createMap(wmGeomap, wmAllPop) {

  let wmCountries = topojson.feature(wmGeomap, wmGeomap.objects.countries);
  let wmMesh = topojson.mesh(wmGeomap, wmGeomap.objects.countries);

  wmAllPop.forEach(d => {
    d.value = Number(d.value);
    d.year = Number(d.year);
  })

  let wmYear = window.startYear

  let dataToMap = wmAllPop.filter(d => d.indicator === indicator)
      .filter(d => d.year === wmYear)

  console.log(dataToMap)

  let allYearsData = wmAllPop.filter(d => d.indicator === indicator)
  //Color for map
  let wmPopExtent = d3.extent(allYearsData, d => d.value)

  fillScale = d3.scaleQuantile()
      //.domain(allYearsData.map(d => d.value))
      .domain(dataToMap.map(d => d.value).sort(d3.ascending))
      .range(d3.schemeBlues[9])

  console.log(fillScale)

  wmMap.selectAll("path.country")
      .data(wmCountries.features)
      .join("path")
      .attr("class", "country")
      .attr("note", d => d.id)
      .attr("d", wmPath)
      .attr("pop", d => getObjectProperty(dataToMap, d.id, 'value'))
      .attr("pop_col", d => fillScale(getObjectProperty(dataToMap, d.id, 'value')))
      .attr("fill", d => fillScale(getObjectProperty(dataToMap, d.id, 'value')))
      .on("mouseleave", mouseLeavesPlot)
      .on("mouseenter", mouseEntersPlot)


  wmMap.append("path").datum(wmMesh)
      .attr("class", "outline")
      .attr("d", wmPath)

  //Legend
  let w = 700, h = 130;
  let highColor = d3.schemeBlues[9][8]
  let lowColor = d3.schemeBlues[9][0]
  let key = wmAnn.append("g")
      .attr("class", "legend")
  let legend = key.append("defs")
      .append("svg:linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "100%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");
  legend.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", d3.schemeBlues[9][0])
      .attr("stop-opacity", 0.8);
  legend.append("stop")
      .attr("offset", "33%")
      .attr("stop-color", d3.schemeBlues[9][3])
      .attr("stop-opacity", 0.8);
  legend.append("stop")
      .attr("offset", "66%")
      .attr("stop-color", d3.schemeBlues[9][5])
      .attr("stop-opacity", 0.8);
  legend.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", highColor)
      .attr("stop-opacity", 0.8);
  key.append("rect")
      .attr("width", w)
      .attr("height", h - 100)
      .style("fill", "url(#gradient)")
      .attr("transform", "translate(100,0)");
  let x = d3.scaleLinear()
      .range([0, w])
      .domain(wmPopExtent)
  let xAxis = d3.axisBottom(x);
  key.append("g")
      .attr("class", "x_axis")
      .attr("transform", "translate(100,40)")
      .call(xAxis.tickFormat(d3.format(".2s")))


}


function updateMap(newYear) {
  wmMap.selectAll("path.country")
      .remove();

  console.log(newYear)
  let dataToMap =  window.popData .filter(d => d.indicator === indicator)
      .filter(d => d.year===+newYear)

  console.log(dataToMap)
  let wmCountries = topojson.feature(window.mapData, window.mapData.objects.countries);
  wmMap.selectAll("path.country")
      .data(wmCountries.features)
      .join("path")
      .attr("class", "country")
      .attr("note", d=>d.id)
      .attr("d", wmPath)
      .attr("pop", d => getObjectProperty(dataToMap, d.id, 'value'))
      .attr("fill", d => fillScale(getObjectProperty(dataToMap, d.id, 'value')))
      .on("mouseleave",  mouseLeavesPlot)
      .on("mouseenter", mouseEntersPlot)

}

function mouseEntersPlot(event,d) {

  d3.selectAll(".country")
      .transition()
      .duration(100)
      //.style("opacity", 0.50)


  d3.select(this)
      .transition()
      .duration(100)
      .style("opacity", 0.8)


  newCountryUpdate(d.properties.name);

}

function mouseLeavesPlot() {
  d3.selectAll(".country")
      .transition()
      .duration(200)
      .style("opacity", 0.8)

};

function getObjectProperty(data, id, field) {
  let val = data.filter( d => d['country.code'] === id);

  if(val.length == 0) {
    console.log(id); return null;}
  else {
    return val[0][field];
  }
}