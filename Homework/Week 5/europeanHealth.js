/**
 *    Steven Kuhnen (10305882)
 *    Data Processing: week 5 (Linked views)
 *    europeanHealth.js
 *
 *    Retrieves necessary json data
 *    Creates a map and a bar chart which are linked together
 *    Has two update functions to change the values on the map
 */

// global variables width and height
var w = 600;
var h = 400;

var jsonData = [];
var countries = [];
var healthExpenditureDollars = [];
var healthExpenditureGdp = [];
var lifeExpectancy = [];

// call function load data when page is loaded
window.onload = function() {
  loadData();
};

/**
 *  function which loads three json files
 *  calls another function to check the queue response
 */
function loadData() {
  d3.queue()
    .defer(d3.json, "eu_health_spending.json")
    .defer(d3.json, "eu_life_expect.json")
    .defer(d3.json, "geoMap.json")
    .awaitAll(checkResponse);
};

/**
 *  function checks if the queue response is vallid
 *  seperates the json data if response is vallid
 *  calls another function to clean the data
 */
function checkResponse(error, response) {
    if (error) throw error;
    else {
        // push the different json outputs to an array
        for (var i = 0; i < response.length; i++) {
            jsonData.push(response[i])
        };
        // clean the json data
        restructData(jsonData)
  };
};

/**
 *  function to clean up the data
 *  stores the data into different arrays
 *  calls functions to create a map and a bar chart
 */
function restructData(jsonData) {
    var numberCountries = jsonData[0].data.length

    /*
      loop to sort the data for every country
      stores healthcare expenditure and life expenditure data in seperate arrays
    */
    for (var j = 0; j < numberCountries; j++) {
        var expectCountry = []

        // add country codes to an array
        var country = jsonData[0].data[j].LOCATION
        countries.push(country)

        // pushes object with data containing healtcare expenditure in dollars
        healthExpenditureDollars.push({
            key: country,
            value: parseInt(jsonData[0].data[j].Dollars)
        })

        /*
          pushes a object with data containing healtcare expenditure as a
          percentage of the gdp to an array
        */
        healthExpenditureGdp.push({
            key: country,
            value: parseInt(jsonData[0].data[j].GDP)
        })

        /*
          add country codes and life expectancy data together
          change of the origninal data order was necessary to push the data of
          the combined population life expectancy last
        */
        expectCountry.push(country)
        expectCountry.push(jsonData[1].data[j * 3].Value)
        expectCountry.push(jsonData[1].data[(j * 3) + 2].Value)
        expectCountry.push(jsonData[1].data[(j * 3) + 1].Value)
        lifeExpectancy.push(expectCountry)
    }

    // variables needed for the initial map
    var text = ",- per capita"
    var sign = "$ "

    // call function to create a map based of the healtexpenditure in dollars
    createMap(healthExpenditureDollars, text, sign)

    // call function to create a bar chart without bars
    createBar()
}

/**
 *  function to change the map data from gdp to dollars
 */
function updateMapDollars() {
  // remove gdp map element
  d3.selectAll("#map svg").remove("svg");

  // variables need for the dollar map variant
  var dollarText = ",- per capita"
  var dollarSign = "$ "

  // call function to create the map with the necessary dollar parameters
  createMap(healthExpenditureDollars, dollarText, dollarSign)

  // change the title of the map
  document.getElementById("maptitle").innerHTML = "Health Expenditure Members European Union in US dollars/capita (2015)";
};

/**
 *  function to change the map data from dollars to gdp
 */
function updateMapGdp() {
  // remove dollar map element
  d3.selectAll("#map svg").remove("svg");

  // variables need for the gdp map variant
  var gdpText = "% of the GDP"
  var gdpSign = ""

  // call function to create the map with the necessary gdp parameters
  createMap(healthExpenditureGdp, gdpText, gdpSign)

  // change the title of the map
  document.getElementById("maptitle").innerHTML = "Health Expenditure Members European Union in % of GDP (2015)";
};


/**
 *  function to create a map
 *  expects an array containg health expenditure data
 *  two extra parameters necessary to add dollar or gdp values on to the map
 */
function createMap(healthExpenditure, text, sign) {

    // create svg for the map
    var svg = d3.select("#map")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    // define maximum needed to assign different colors to the countries
    var maxColor = d3.max(healthExpenditure, function(d) { return d.value });
    var maxRgb = 255;

    // create a legend for the map
    createLegend()

    /*
      project and draw the map
      ource: https://bl.ocks.org/MariellaCC/0055298b94fcf2c16940
    */
    var projection = d3.geo.mercator()
                           .center([ 13, 52 ])
                           .translate([ w/2, h/2 ])
                           .scale([ w/1.5 ]);

    // define path generator
    var path = d3.geo.path()
                     .projection(projection);

    // create tooltip
    var tooltip = d3.select("body").append("div").attr("class", "toolTip");

    // add data to every country on the map
    svg.selectAll("path")
       .data(jsonData[2].features)
       .enter()
       .append("path")
       .attr("d", path)
       .attr("stroke", "rgba(0, 0, 0, 0.2)")
       /*
         colors countries acording to their health expenditure
         lightgrey color for countries outside the European Union
       */
       .attr("fill", function(d) {
          // checks if country code is also present in the countries array
          if (countries.includes(d.properties.adm0_a3)) {
              // find the index of the countrycode
              var index = countries.indexOf(d.properties.adm0_a3)

              // return a color based on a countries health expenditure
              return "rgba(0," + (((healthExpenditure[index].value) / maxColor)
              * maxRgb)+ ", 0, 0.6)"
          }
          else {
              return "lightgrey"
          }
       })
       /*
          displays a textbox when the mouse moves over a country on the map
          map will display the specif healtcare expenditure data
          bars on the barchart will be filled accordingly
       */
       .on("mousemove", function(d) {
        // checks if country code is also present in the countries array
          if (countries.includes(d.properties.adm0_a3)) {

              // find the index of the countrycode
              var index = countries.indexOf(d.properties.adm0_a3)

              /*
                  calls tooltip variable
                  source: https://bl.ocks.org/giguerre/fa47e4bee6f6f878f94e196ca5075233
              */
              tooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 70 + "px")
                .style("display", "inline-block")
                .html(d.properties.brk_name + ": " + sign +
                      healthExpenditure[index].value + text)

              // remove the old bars
              d3.selectAll("#bar svg").remove("svg");

              /*
                call function to add new bars
                index to find the appropriate data in the lifeExpectancy array
              */
              createBar(d.properties.adm0_a3, index)

              // change the title of the bar chart
              document.getElementById("bartitle").innerHTML = "Life Expactanc" +
              "y  at Birth (Male, Female and Combined) (2015) <br> Country: " +
              d.properties.brk_name;
          }
          else {
            // display on map that the data is unavailable
              tooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 70 + "px")
                .style("display", "inline-block")
                .html(d.properties.brk_name + ": data unavailable")
          }
      })
      // displays none when the mouse is no longer on a specific country
      .on("mouseout", function(d) { tooltip.style("display", "none");});
};

/**
 *  function to create a legend
 */
function createLegend() {

  // variables needed for the legend
  var padding = w / 3;
  var legendColor = ["rgb(0, 255, 0)", "rgb(0, 150, 0)", "lightgrey"]
  var legendX = 10;
  var legendTextX = 30;
  var legendTextY = 13;
  var legendText = ["Relatively High Expenditure", "Relatively Low Expenditure",
                    "No Data (Non-EU member)"]

  // create svg for the legend
  var legend = d3.select("#legend")
              .append("svg")
              .attr("width", w)
              .attr("height", 20);

  // loop to add boxes with color and text to the legend
  for (var k = 0; k < legendText.length; k++) {
    // add rectangle boxes
    legend.append('rect')
      .attr("x", legendX + (padding * k))
      .attr("y", 0)
      .attr('width', "15")
      .attr('height', "15")
      .style('fill', legendColor[k])
      .style('stroke', "black")

    // add text
    legend.append("text")
        .attr("x", legendTextX + (padding * k))
        .attr("y", legendTextY)
        .attr("font-size", "14px")
        .attr("fill", "black")
        .text(legendText[k]);
  }
};

/**
 *  function to create a bar chart
 *  takes a country code and an index as parameters
 *  fills bars only when country code is indeed a vallid country code
 *  inspiration bar chart: https://bl.ocks.org/adgramigna/cd9fecfd898e3aa760fbc6f6e0fe01b7
 */
function createBar(countryCode, index) {

  // determine margins height widt axis
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = w - margin.left - margin.right,
      height = h - margin.top - margin.bottom;

   // text for the x axis
  var dataGroup = ["Male", "Female", "Combined"]

  // create svg element
  var svg = d3.select("#bar").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  // determine x scale
  var xScale = d3.scaleBand()
          .range([0, width])
          .padding(0.5);
  xScale.domain(dataGroup.map(function(d) { return d; }))

  // determine y scale
  var yScale = d3.scaleLinear()
          .range([height, 0]);
  yScale.domain([65, d3.max(lifeExpectancy, function(d) { return d[2] })]);

  // create tooltip
  var tooltip = d3.select("body").append("div").attr("class", "toolTip");

  // create the bars if the user hoovers over a member of the eu on the map
  if (typeof(countryCode) === "string") {
      svg.selectAll(".bar")
         // remove the country code out of the chose array
         .data(lifeExpectancy[index].slice(1,4))
         .enter().append("rect")
         .attr("class", "bar")
         .attr("x", function(d, i) { return xScale(dataGroup[i]); })
         .attr("width", xScale.bandwidth())
         .attr("y", function(d) {return yScale(d); })
         .attr("height", function(d) { return height - yScale(d); })
         /*
          displays a textbox when the mouse moves over a bar
          textbox will show the corresponding life expectancy
         */
         .on("mousemove", function(d) {
              tooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 70 + "px")
                .style("display", "inline-block")
                .html("Life expectancy: " + d + " years");
         })
         // displays none when the mouse is no longer on a specific country
         .on("mouseout", function(d) { tooltip.style("display", "none");});
  }

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
          .style("font-size", "14px")
          .text("Life Expectancy (years)");
};
