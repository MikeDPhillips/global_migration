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

Promise.all([d3.json("data/countries-110m-noant.json")]
)

    .then( ([wmGeomap]) => {

      let wmCountries = topojson.feature(wmGeomap, wmGeomap.objects.countries);
      let wmMesh = topojson.mesh(wmGeomap, wmGeomap.objects.countries);

      //let wmProjection = d3.geoEqualEarth().fitSize([wmMapWidth, wmMapHeight], wmCountries)
     // let wmProjection =  d3.geoCylindricalEqualArea()
     //     .parallel([38.58])
      let wmProjection = d3.geoCylindricalStereographic()
          .translate([wmWidth / 2, wmHeight / 2])


      let wmPath = d3.geoPath().projection(wmProjection);

      wmMap.selectAll("path.country")
          .data(wmCountries.features)
          .join("path")
          .attr("class", "country")
          .attr("note", d=>d.id)
          .attr("d", wmPath)
          .on("mouseenter", (event, d) => {
            console.log(event)
            console.log("entered")
          });



      wmMap.append("path").datum(wmMesh)
          .attr("class", "outline")
          .attr("d", wmPath)





    }); //end of then