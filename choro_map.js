const wmWidth = 900
const wmHeight = wmWidth*.618
const wmMargin = { top:10, right:10, bottom:10, left:10}
const wmMapWidth = wmWidth - wmMargin.left -wmMargin.right
const wmMapHeight = wmHeight - wmMargin.top - wmMargin.bottom



let wmSvg = d3.select("#world-chart").append("svg")
    .attr("id", "world")
    .attr("width", wmWidth)
    .attr("height", wmHeight)


let wmMap = wmSvg.append("g").attr("transform", `translate(${wmMargin.left}, ${wmMargin.top})`)

Promise.all([d3.json("data/countries-110m-noant.json"),
    d3.csv("data/pop_data_long.csv", d3.autoType())])
    .then( ([wmGeomap, wmAllPop])=> {


      let wmCountries = topojson.feature(wmGeomap, wmGeomap.objects.countries);
      let wmMesh = topojson.mesh(wmGeomap, wmGeomap.objects.countries);

      wmAllPop.forEach( d => {
        d.value = Number(d.value);
        d.year = Number(d.year);
      })

      console.log(wmAllPop)

      let indicator = 'total_pop'
      let wmYear = 2018

      let dataToMap =  wmAllPop.filter(d => d.indicator == indicator)
          .filter(d => d.year==wmYear)

      console.log(dataToMap)

      //Color for map
      let wmPopExtent = d3.extent(dataToMap, d => d.value)

      let fillScale= d3.scaleQuantile()
          .domain(dataToMap.map(d => d.Total))
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
          .on("mouseout",  mouseLeavesPlot)
          .on("mouseenter", mouseEntersPlot)


      wmMap.append("path").datum(wmMesh)
          .attr("class", "outline")
          .attr("d", wmPath)

      updateMap(dataToMap);

      function updateMap(newData) {
        wmMap.selectAll("path.country")
            .data(newData)
            .enter()
                .append("path")
                  .attr("opacity", 0)
                  .attr("fill", d =>  fillScale(d.value))
                  .call( enter => enter.transition().attr('opacity'),1)
            .update()
                .transition()
                      //.attr("country", d => d3.select(this).attr("note"))
                      .attr("country", d => d.country)
                        .attr("cid", d => d['country.code'])
                        .attr("pop", d => d.value)
                    .attr("fill", d =>  fillScale(d.value))
            .exit()
                .transition().attr('opacity',0).remove()
      }

        function mouseEntersPlot(event,d) {
          console.log(this.attributes.country.value);

            d3.selectAll(".country")
                .transition()
                .duration(200)
                .style("opacity", 0.3)

            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)

            //d3.select("#country-chart").text(d.properties.name)
          d3.select("#country-chart").text(d.country);

        }

        function mouseLeavesPlot() {
            d3.selectAll(".country")
                .transition()
                .duration(200)
                .style("opacity", 1)
        };

      //Legend
        let w = 300, h = 130;
        let highColor = d3.schemeBlues[9][8]
        let lowColor = d3.schemeBlues[9][0]

        var key = d3.select("#world-chart")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("class", "legend");

        var legend = key.append("defs")
            .append("svg:linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");

        legend.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", lowColor)
            .attr("stop-opacity", 1);

        legend.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", highColor)
            .attr("stop-opacity", 1);

        key.append("rect")
            .attr("width", w)
            .attr("height", h-100)
            .style("fill", "url(#gradient)")
            .attr("transform", "translate(0,10)");

        var x = d3.scaleLinear()
            .range([0, w])
            .domain(d3.extent(wmPop.map(d => d.Total)))


        var xAxis = d3.axisBottom(x);

        key.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(0,40)")
            .call(xAxis.tickFormat(d3.format(".0s")))


        //Time Slider

        let dataTime = d3.range(0, 20).map(function(d) {
            return new Date(2001 + d, 10, 3);
        });

        let sliderTime = d3
            .sliderBottom()
            .min(d3.min(dataTime))
            .max(d3.max(dataTime))
            .step(1000 * 60 * 60 * 24 * 365)
            .width(500)
            .tickFormat(d3.timeFormat('%Y'))
            .tickValues(dataTime)
            .default(new Date(2008, 10, 3))
            .on('onchange', val => {
                d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
                d3.select('p#fancy-value-time').text(d3.timeFormat('%Y')(val))
              //    let new_year = d3.select('p#value-time').text();
             //   rerender(new_year);
            });

        let gTime = d3
            .select("div#world-chart")
            .append('svg')
            .attr("class","slider")
            .attr('width', 600)
            .attr('height', 100)
            .append('g')
            .attr('transform', 'translate(30,10)');

        gTime.call(sliderTime);
        d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));
        d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));



    }); //end of then

function getObjectProperty(data, id, field) {
  let val = data.filter( d => d['country.code'] === id);

  if(val.length == 0) {console.log(id); return null;}
  else {
    return val[0][field];
  }
}