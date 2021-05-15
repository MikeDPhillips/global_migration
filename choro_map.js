const wmWidth = 900
const wmHeight = wmWidth*.618
const wmMargin = { top:10, right:10, bottom:10, left:10}
const wmMapWidth = wmWidth - wmMargin.left -wmMargin.right
const wmMapHeight = wmHeight - wmMargin.top - wmMargin.bottom



let wmSvg = d3.select("#world-chart").append("svg")
    .attr("id", "world")
    .attr("width", wmWidth)
    .attr("height", wmHeight)

console.log(wmSvg);
let wmMap = wmSvg.append("g").attr("transform", `translate(${wmMargin.left}, ${wmMargin.top})`)

Promise.all([d3.json("data/countries-110m-noant.json"),
    d3.csv("data/total_population.csv", d3.autoType())]
)

    .then( ([wmGeomap, wmPop]) => {
      console.log("Here comes the csv")
      console.log(wmPop)
      let wmCountries = topojson.feature(wmGeomap, wmGeomap.objects.countries);
      let wmMesh = topojson.mesh(wmGeomap, wmGeomap.objects.countries);

      //Color for map
      let wmPopExtent = d3.extent(wmPop, d => d.Total)

      let fillScale= d3.scaleQuantile()
          .domain(wmPop.map(d => d.Total))
          .range(d3.schemeBlues[9])

      let wmProjection = d3.geoNaturalEarth2()
          .scale(wmMapWidth / 1.4 / Math.PI)
          .translate([wmMapWidth / 2, wmMapHeight / 2]);

      let wmPath = d3.geoPath().projection(wmProjection);

      wmMap.selectAll("path.country")
          .data(wmCountries.features)
          .join("path")
          .attr("class", "country")
          .attr("note", d=>d.id)
          .attr("d", wmPath)
          .attr("fill", d => {
            d.pop = getPopulation(wmPop, d.properties.name, '2019');
             return( fillScale(d.pop));
      })
          .on("mouseenter", (event, d) => {
            console.log(event)
            console.log("entered")
          });



      wmMap.append("path").datum(wmMesh)
          .attr("class", "outline")
          .attr("d", wmPath)





    }); //end of then

function getPopulation(data, id, year) {
  let val = data.filter( d => d.Country === id & d.Year == year);
  if(val.length == 0) {    console.log(id); return null;}
  else {

    return val[0].Total;
  }
}