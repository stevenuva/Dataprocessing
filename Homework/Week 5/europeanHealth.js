// width and height
var w = 700;
var h = 600;

window.onload = function(){
  loadData();
};

// load data
function loadData(){
  d3.queue()
    .defer(d3.request, "eu_health_spending.json")
    .defer(d3.request, "eu_life_expect.json")
    .awaitAll(checkResponse);

    // check the queue response
    function checkResponse(error, response) {
    if (error) throw error;
    else{
      // seperate data with array
      var jsonData = [];
      for (var i = 0; i < response.length; i++) {
          jsonData.push(JSON.parse(response[i].responseText))
      };
    };
    // return jsonData and create bar and map;
    createBar(jsonData)
    createMap(jsonData)
  };
};

// source: https://bl.ocks.org/MariellaCC/0055298b94fcf2c16940
function createMap(jsonData){
  // create svg containing a map
  var svg = d3.select("#map")
              .append("svg")
              .attr("width", w)
              .attr("height", h);

  var healthExpenditure = [];
  var country = [];

  // loop to find countries and their health expenditure per capita
  for (var i = 0; i < numberCountries; i++) {
    country.push(jsonData[0].data[i].LOCATION)
    healthExpenditure.push(parseInt(jsonData[0].data[i].Value))
    }

  // define max for color variable
  var maxColor = d3.max(healthExpenditure)

  var projection = d3.geo.mercator()
                         .center([ 13, 52 ])
                         .translate([ w/2, h/2 ])
                         .scale([ w/1.5 ]);

  // define path generator
  var path = d3.geo.path()
               .projection(projection);


  // load in GeoJSON data
  d3.json("geoMap.json", function(json) {

      // bind data and create one path per GeoJSON feature
      svg.selectAll("path")
         .data(json.features)
         .enter()
         .append("path")
         .attr("d", path)
         .attr("stroke", "rgba(0, 0, 0, 0.2)")
         /*
         color countries acording to their health expenditure
         grey color for countries outside EU of which their is also no data
         */
         .attr("fill", function(d) {
          if (country.includes(d.properties.adm0_a3)){
          var a = country.indexOf(d.properties.adm0_a3)
          return "rgba(0," + ((healthExpenditure[a] / maxColor) * 255)+ ", 0, 0.6)"
          }
          else{
            return "lightgrey"
          }
          })
         .on("click", function(d){
            console.log(d.properties.adm0_a3)
          })
  });
};

// create bar
// unable to add tip box inside the svg element!!!
function createBar(jsonData){

  // check num countries and length data
  numberCountries = jsonData[0].data.length
  lengthData = (jsonData[1].data.length / numberCountries)

  var dataEurope = [];

  // sort data per country concerning life expetancy
  // ensures data concerning the sexes combined ends up last in the array
  for (var i = 0; i < numberCountries; i++) {
    var countryData = []
    countryData.push(jsonData[0].data[i].LOCATION)
    countryData.push(jsonData[1].data[i * 3].Value)
    countryData.push(jsonData[1].data[(i * 3) + 2].Value)
    countryData.push(jsonData[1].data[(i * 3) + 1].Value)
    dataEurope.push(countryData)
    }

  // determine margins and height widt axis
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = w - margin.left - margin.right,
      height = h - margin.top - margin.bottom;

  // create svg element
  var svg = d3.select("#bar").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  var xScale = d3.scaleBand()
          .range([0, width])
          .padding(0.5);

  var yScale = d3.scaleLinear()
          .range([height, 0]);

 // create tooltip
 var tool_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d) { return "Life expectancy: " + d + " years"; });

  var dataGroup = ["Male", "Female", "Combined"]

  xScale.domain(dataGroup.map(function(d) { return d; }))
  yScale.domain([65, d3.max(dataEurope, function(d) {return d[2]})]);

svg.call(tool_tip);

// create bars
svg.selectAll(".bar")
      .data(dataEurope[0].slice(1,4))
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d, i) { return xScale(dataGroup[i]); })
      .attr("width", xScale.bandwidth())
      .attr("y", function(d) { return yScale(d); })
      .attr("height", function(d) { return height - yScale(d); })
      .on('mouseover', tool_tip.show)
      .on('mouseout', tool_tip.hide);

 // add the x axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));

  // add the y axis
  svg.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".60em")
          .style("text-anchor", "end")
          .style("font-size", "18px")
          .style('fill', 'black')
          .text("Life Expectancy (years)");
};
