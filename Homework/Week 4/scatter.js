/**
 *    Steven Kuhnen (10305882)
 *    Data Processing: week 4
 *    Scatterplot
 */

// variables with the data
  var gdp = "https://stats.oecd.org/SDMX-JSON/data/PDB_LV/AUS+BEL+CAN+DNK+FIN+FRA+DEU+ISL+IRL+ITA+JPN+KOR+LUX+NLD+NZL+NOR+PRT+ESP+SWE+CHE+TUR+GBR+USA.T_GDPPOP.VPVOB/all?startTime=2016&endTime=2016&dimensionAtObservation=allDimensions"

  var workedHours = "https://stats.oecd.org/SDMX-JSON/data/PDB_LV/AUS+BEL+CAN+DNK+FIN+FRA+DEU+ISL+IRL+ITA+JPN+KOR+LUX+NLD+NZL+NOR+PRT+ESP+SWE+CHE+TUR+GBR+USA.T_HRSAV.PEHRS/all?startTime=2016&endTime=2016&dimensionAtObservation=allDimensions"

  var totPop = "https://stats.oecd.org/SDMX-JSON/data/PDB_LV/AUS+BEL+CAN+DNK+FIN+FRA+DEU+ISL+IRL+ITA+JPN+KOR+LUX+NLD+NZL+NOR+PRT+ESP+SWE+CHE+TUR+GBR+USA.T_POPTOT.PEHRS/all?startTime=2016&endTime=2016&dimensionAtObservation=allDimensions"

  var compUsaLabour = "https://stats.oecd.org/SDMX-JSON/data/PDB_LV/AUS+BEL+CAN+DNK+FIN+FRA+DEU+ISL+IRL+ITA+JPN+KOR+LUX+NLD+NZL+NOR+PRT+ESP+SWE+CHE+TUR+GBR+USA.T_GPHRPO.GAP/all?startTime=2016&endTime=2016&dimensionAtObservation=allDimensions"

  var workedHoursPop = "https://stats.oecd.org/SDMX-JSON/data/PDB_LV/AUS+BEL+CAN+DNK+FIN+FRA+DEU+ISL+IRL+ITA+JPN+KOR+LUX+NLD+NZL+NOR+PRT+ESP+SWE+CHE+TUR+GBR+USA.T_HRSPOP.PEHRS/all?startTime=2016&endTime=2016&dimensionAtObservation=allDimensions"

// if page is loaded
window.onload = function() {
  originalData();
};

// function retrieve the data when the page is loaded
function originalData() {

//  remove svg elements if they exist
d3.selectAll("svg").remove();

// request data including workedHours
d3.queue()
  .defer(d3.request, gdp)
  .defer(d3.request, workedHours)
  .defer(d3.request, totPop)
  .defer(d3.request, compUsaLabour)
  .awaitAll(checkResponse);

 // define unique text for qraph
 graphTitle = "GDP versus average worked hours per worker"
 textY = "Annual hours worked per worker"

 /*
 change the update button to link to a function with different data
 source: https://stackoverflow.com/questions/5303899/change-onclick-action-with-a-javascript-function?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
  */
 document.getElementById( "update" ).setAttribute( "onclick", "javascript: updateData();" );
};

// second function containing different data then the originalData function
function updateData() {

// remove svg elements if they exist
d3.selectAll("svg").remove();

// request data including workedHoursPop
d3.queue()
  .defer(d3.request, gdp)
  .defer(d3.request, workedHoursPop)
  .defer(d3.request, totPop)
  .defer(d3.request, compUsaLabour)
  .awaitAll(checkResponse);

// define unique text for qraph
 graphTitle = "GDP versus average worked hours per capita"
 textY = "Annual hours worked per capita"

// change the update button to link to a function with different data
 document.getElementById( "update" ).setAttribute( "onclick", "javascript: originalData();" );
};

// check the requested data
function checkResponse(error, response) {
  if (error) throw error;

  // retrieve from each response the responsetext as a object
  else{
    var jsonData = [];
    for (var i = 0; i < response.length; i++) {
        jsonData.push(JSON.parse(response[i].responseText))
    };

  // check for the amount of countries and years included
  var countries = jsonData[0].structure.dimensions.observation[0].values;
  var years = jsonData[0].structure.dimensions.observation[3].values;

  // create empty array needed for sorting messy OECD data
  var combinedDatasets = [];

  /*
  loop to sort messy OECD data based on country
  hardcoded USA because of null value returned by OECD when requesting data
  for labour utilisation in comparison with respect to the USA
  */
  for (let i = 0; i < jsonData.length; i++) {
    var dataSet = [];
      for (let j = 0; j < countries.length; j++) {
          for (let k = 0; k < years.length; k++) {
              var data = []
              if (i == (jsonData.length - 1) && j == (countries.length -1)) {
                  data.push("USA")
                  data.push(0)
              }
              else {
                  data.push(jsonData[i].structure.dimensions.observation[0]
                            .values[j].id)
                  data.push(jsonData[i].dataSets[0].observations[j + ":0:0:"
                            + k][0])
              }
              dataSet.push(data)
          }
      }
      // sort array by string name
      var sortedData = dataSet.sort(sortByCountry);
      combinedDatasets.push(sortedData);
  }

  var countryData = [];

  // add the data per country together including country id
  for (let l = 0; l < countries.length; l++) {
      sortedArray = []
      sortedArray.push(combinedDatasets[0][l][0])
      for (let m = 0; m < jsonData.length; m++) {
         sortedArray.push(combinedDatasets[m][l][1])
      }
      countryData.push(sortedArray)
  }

  // establish size and padding scatterplot
  var h = 600;
  var w = 1400;
  var padding = 75;
  var paddingH = 250;
  var paddingY = 150;
  var labelPadding = 25;
  var circelPadding = 30;

  // establish size dots
  var minSize = 10;
  var maxExtra = 5;
  var divedPop = 100000;

  // establish legend size
  var legendX = 300;
  var legendY = 35;
  var legendPadding = 10;
  var rectWidth = 250;
  var rectHeight = 125;
  var rectX = 280;
  var rectTextX = 260

  // color and text for legend
  var color = ["#91cf60", "#ffffbf", "#fc8d59"]
  var legText = ["Higher labour utilisation than the USA", "Labour utilisation "
                  + "equal to the USA", "Lower labour utilisation than the USA",
                  "Size population"]

  // create x and y scale
  var xScale = d3.scaleLinear()
                 .domain([0, d3.max(countryData, function(d) { return d[1]; })])
                 .range([padding, w - padding]);

  var yScale = d3.scaleLinear()
                 .domain([0, d3.max(countryData, function(d) { return d[2]; })])
                 .range([h - padding, paddingY]);  ///////////////////!!!!!!!!//////


  // create svg element
  var svg = d3.select("body")
              .append("svg")
              .attr("width", w)
              .attr("height", h);

        // place circles on locations based of the data per country
        svg.selectAll("circle")
                 .data(countryData)
                 .enter()
                 .append("circle")
                 .attr("cx", function(d) {
                      return xScale(d[1]);
                 })
                 .attr("cy", function(d) {
                      return yScale(d[2]);
                 })
                 /*
                 change size of the circle based on population size
                 minsize is used to ensure every dot is visible
                 */
                 .attr("r", function(d) {
                      return (minSize + ((maxExtra / divedPop) * d[3]));
                  })
                 // change color based on labour utilisation compared to the USA
                 .attr("fill", function(d) {
                          if (d[4] > 0){
                            return color[0]
                          }
                          else if (d[4] == 0){
                            return color[1]
                          }
                          else{
                            return color[2]
                          }
                 })

  // add country ids
  svg.selectAll("text")
     .data(countryData)
     .enter()
     .append("text")
     .text(function(d) {
        return d[0];
     })
     .attr("x", function(d) {
        return xScale(d[1]);
     })
     .attr("y", function(d) {
            return yScale(d[2]);
     })
     .attr("font-family", "sans-serif")
     .attr("font-size", "11px")
     .attr("fill", "black");

  // add scatterpolt title
  svg.append("text")
     .attr("transform", "translate(" + paddingH + " ," +
          (labelPadding) + ")")
     .style("text-anchor", "middle")
     .style("font-size", "24px")
     .style("font-weight", "bold")
     .text(graphTitle);

  // add x labeltext
  svg.append("text")
     .attr("transform", "translate(" + ((w + padding) / 2) + " ," +
          (h - labelPadding) + ")")
     .style("text-anchor", "middle")
     .style("font-size", "22px")
     .style("font-weight", "bold")
     .text("Gross domestic product per capita ($)");

  // add y label text
  svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 0 + (labelPadding - minSize))
     .attr("x", 0 - (h / 2))
     .attr("dy", "1em")
     .style("text-anchor", "middle")
     .style("font-size", "22px")
     .style("font-weight", "bold")
     .text(textY);

  // create x axis
  var xAxis = d3.axisBottom(xScale);

  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(0," + (h - padding) + ")")
     .call(xAxis);

  // create y axis
  var yAxis = d3.axisLeft(yScale);

  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(" + padding + ",0)")
     .call(yAxis);

  // create legend
  var legend = svg.append("g")

  // place legend on the scatterplot
  legend.append('rect')
        .attr("x", w - legendX)
        .attr("y", h - (h - legendPadding))
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .style('fill', "#CAE1FF")
        .style('stroke', "black");

  // loop to add boxes with color and text to the legend
  for (var n = 0; n < legText.length; n++) {
    if (n < 3){
    // add rectangle boxes
    legend.append('rect')
          .attr("x", w - rectX)
          .attr("y", labelPadding + (labelPadding * n))
          .attr('width', legendPadding)
          .attr('height', legendPadding)
          .style('fill', color[n])
          .style('stroke', "black");
    }
    // add a circle to the legend for the population size
    else {
    legend.append("circle")
          .attr("cx", w - rectX + maxExtra)
          .attr("cy", circelPadding + (labelPadding * n))
          .attr("r", minSize)
          .attr("fill", "black")
    }
    // add text
    legend.append("text")
          .attr("x", w - rectTextX)
          .attr("y", legendY + (labelPadding * n))
          .attr("font-family", "sans-serif")
          .attr("font-size", "11px")
          .attr("fill", "black")
          .text(legText[n]);
  }
  }
};

/*
sort array by country name and not by float values
source: https://www.w3schools.com/js/js_array_sort.asp
*/
function sortByCountry(x, y) {
    if (x[0] < y[0]) {return -1};
    if (x[0] > y[0]) {return 1};
    return 0;
 };
