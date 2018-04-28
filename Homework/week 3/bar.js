/**
 *    Steven Kuhnen (10305882)
 *    Data Processing: week 3
 */

// select div element
const divSelect = d3.select("div");

// use d3 to add the necessary information
divSelect.append("h1").text("Jewish casualties per country during WW2 in percentages")
divSelect.append("h2").text("Steven Kuhnen")
divSelect.append("h3").text("Dataprocessing week 3: Bar chart")
divSelect.append("h4").text("The Holocaust is the term generally used to describe                       the genocide of millions of European Jews during World War II.                              Estimates of Holocaust deaths range between 4.9 and 5.9 million Jews.                            The bar chart below shows the estimated percentage of casualties among                           the jewish population per country during World War 2.")

//set variable sizes necessary to draw the bar chart
var w = 800;
var h = 400;
var barPadding = 1;
var margin = 100;
var maxRgb = 255;
var labelMargin = 175;
var tickSize = 10;
var textPadding = 5;
var yMaxDomain = 100;

/*
load json and sorting the data
source for sorting: https://stackoverflow.com/questions/25168086/
sorting-objects-based-on-property-value-in-d3?utm_medium=organic&
utm_source=google_rich_qa&utm_campaign=google_rich_qa
*/
d3.json("Jewish_Victims_WW2.json", function(data){
var completeData = Object.values(data)[0]
    completeData.sort(function(x, y){
        return d3.descending(x["Average%"], y["Average%"]);
    });

    // retrieve the country names
    var countryNames = completeData.map(function(d){
        return d["Country"];
    });

    // retrieve the average percentages of jewish casualties
    var specificData = completeData.map(function(d) {
        return d["Average%"].replace(/(%)/, "");
    });

    // create scale for x axis
    var xScale = d3.scale.linear()
                         .domain([0, specificData.length])
                         .range([margin, w + margin]);

    // create scale for y axis
    var yScale = d3.scale.linear()
                         .domain([0, yMaxDomain])
                         .range([0, h]);

    // create extra axis scale to fix problem with reversed ticks
    var yAxisScale = d3.scale.linear()
                             .domain([0, yMaxDomain])
                             .range([h, 0]);

    //  add country names to x axis
    var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom")
                      .ticks(specificData.length)
                      .tickFormat(function(d, i){
                            return countryNames[i]
                      });

    // add ticks to y axis
    var yAxis = d3.svg.axis()
                      .scale(yAxisScale)
                      .orient("left")
                      .ticks(tickSize);

    // create SVG element
    var svg = d3.select("body")
                .append("svg")
                .attr("width", w + (2 * margin))
                .attr("height", h + (2 * margin));

    /*
    create the bars with a visual delay effect
    source for delay: http://bl.ocks.org/Kcnarf/9e4813ba03ef34beac6e
    */
    svg.selectAll("rect")
        .data(specificData)
        .enter().append("rect")
        .transition().duration(h)
        .delay(function(d, i){
            return i * margin;
        })
        .attr("class", "bar")
        .attr("x", function(d, i) {
            return (i * (w / specificData.length)) + margin;
        })
        .attr("width", w / specificData.length - barPadding)
        .attr("y", function(d) {
            return h + margin - yScale(d);
        })
        .attr("height", function(d) {
            return yScale(d);
        })
        .attr("fill", function(d) {
            return "rgb(" + (Math.round(maxRgb - d)) + ", 0, 0)"
        });

    /*
    create and call tooltip
    source tooltip interactivity: http://bl.ocks.org/Caged/6476579
    */
    var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-20, 0])
                .html(function(d, i) {
                    return "<strong>" + countryNames[i] + ":</strong>" +
                    "<span style='color:red'>" + specificData[i] + "%</span>";
                });

    svg.call(tip);

    // add mouse and bar interactivity
    svg.selectAll("rect")
       .attr("class", "bar")
       .on("mouseover", tip.show)
       .on("mouseout", tip.hide)

    // add with a delay percentages above the bars
    svg.selectAll("text")
       .data(specificData)
       .enter()
       .append("text")
       .transition().duration(h)
       .delay(function(d, i){
            return i * margin;
       })
       .text(function(d) {
            return d + "%";
       })
       .attr("x", function(d, i) {
            return i * (w / specificData.length) + margin + textPadding;
       })
       .attr("y", function(d) {
            return h + margin - yScale(d) - 1;
       });

    /*
    add X axis with rotated text to the svg element
    source for rotated text: www.d3noob.org/2013/01/how-to-rotate-text-labels-
    for-x-axis-of.html
    */
    svg.append("g")
        .attr("class","axis")
            .attr("transform", "translate(0," + (h + margin) + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.10em")
                .attr("dy", ".70em")
                .attr("transform", "rotate(-65)")

    // add Y axis to the svg element
    svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin + "," +
                   margin + ")")
            .call(yAxis);

    /*
    add x axis label
    source: http://www.d3noob.org/2012/12/adding-axis-labels-to-d3js-graph.html
    */
    svg.append("text")
        .attr("transform", "translate(" + ((w + margin) / 2) + " ," +
             (h + labelMargin) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Country");

    // add y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 + (margin / 2))
        .attr("x", 0 - ((h / 2) + margin))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Casualties Jewish population(%)");
});
