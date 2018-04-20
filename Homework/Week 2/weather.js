/**
 *    Steven Kuhnen (10305882)
 *    Data Processing: week 2
 */

// file to be used
var file = "KNMI_20171231.txt"

// load data from external file
var txtFile = new XMLHttpRequest();
txtFile.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

        // store and edit the responsetext
        var rawData = (this.responseText).split("\n").slice(12, -1);

        // create two empty arrays
        var averageTemp= [];
        var calenderDate = [];

        // loop to store the data into the arrays
        for(let i = 0; i < rawData.length; i++){

            // split the comma seperated string
            dailyData = rawData[i].split(",");

            // get the calender date
            fullDate = dailyData[1].trim();
            year = fullDate.slice(0, 4);
            month = fullDate.slice(4, 6);
            day = fullDate.slice(6, 8);
            dateString = new Date((year + "-" + month + "-" + day));

            // push data to the arrays
            averageTemp.push(parseInt(dailyData[2].trim()));
            calenderDate.push(dateString);
        }

        // determine the x and y axis
        const graphDomain = [100, 900];
        const graphRange = [50, 450];
        const lengthDomain = graphDomain[1] - graphDomain[0];
        const lengthRange = graphRange[1] - graphRange[0];
        const graphMiddle = (graphDomain[0] + graphDomain[1]) / 2;

        // create canvas element and render 2d object
        var canvas = document.getElementById("myCanvas");
        var graph = canvas.getContext("2d");

        // constant padding
        const padding = 25;

        graph.beginPath();
        graph.rect(graphDomain[0], graphRange[0], lengthDomain, lengthRange);
        graph.fillStyle = "#7F152E";
        graph.fill();

        // draw header
        graph.font = "24px Arial";
        graph.fillStyle = "black"
        graph.textAlign = "center"
        graph.fillText("Average temperature in De Bilt(NL)(2017)", graphMiddle,
                        padding);

        // draw x axis
        graph.beginPath();
        graph.moveTo(graphDomain[0], graphRange[1]);
        graph.lineTo(graphDomain[1], graphRange[1]);
        graph.stroke();

        // draw y axis
        graph.beginPath();
        graph.moveTo(graphDomain[0], graphRange[0]);
        graph.lineTo(graphDomain[0], graphRange[1]);
        graph.stroke();

        // array with months
        const months = ["January", "February", "March", "April", "May",
                        "June", "July", "August", "September", "October",
                        "November", "December"]

        // determine font
        graph.font = "12px Arial";

        // loop to draw months on the x axis
        for (i = 0; i < months.length; i++){
           graph.strokeText(months[i], (graphDomain[0] + padding) +
                           (((lengthDomain - (padding * 2)) /
                           (months.length - 1)) * i), (graphRange[1] + padding),
                           [(lengthDomain - padding) / months.length])
        }

        // draw months label
        graph.strokeText("Months", graphMiddle, 499);


        // determine extremes temperatures
        const maxTemp = Math.max(...averageTemp);
        const minTemp = Math.min(...averageTemp);

        // deteremine extremes to be visualized
        const roundTemp = 50;
        const maxVisual = Math.round(maxTemp / roundTemp) * roundTemp;
        const minVisual = Math.round(minTemp / roundTemp) * roundTemp;
        const lengthVisual =  (maxVisual - minVisual) / roundTemp;

        // draw temperatures on canvas element
        for (let k = 0; k <= lengthVisual; k++) {
            graph.strokeText((minVisual + (roundTemp * k)) / 10 + "°C",
                              graphRange[0] + padding, (graphRange[1] -
                              ((lengthRange / lengthVisual) * k)))
        }

        // draw temperature label
        graph.rotate(270 * Math.PI / 180);
        graph.strokeFont = "bold 16px Arial";
        graph.strokeText("Temperature(°C)", -250, 25);
        graph.setTransform(1, 0, 0, 1, 0, 0);

        // determine the min and max bounds for y
        let dataY = [minVisual, maxVisual];
        let screenY = [graphRange[1], graphRange[0]];

        // function to locate y coordinates
        locateY = createTransform(dataY, screenY);

        // loop to determine coordinates and to draw lines
        for (let l = 0; l < averageTemp.length; l++) {
            let xCor =  graphDomain[0] + ((lengthDomain / calenderDate.length)
                        * (0 + l));
            let yCor = locateY(averageTemp[l]);
            let yCor2 = locateY(averageTemp[l - 1]);
            graph.beginPath();
            graph.moveTo((xCor - 1), yCor2);
            graph.lineTo(xCor, yCor)
            graph.strokeStyle= "#FEF2E4";
            graph.stroke();
        }
    }
};
txtFile.open("GET", file, true);
txtFile.send();

function createTransform(domain, range){
    // domain is a two-element array of the data bounds [domain_min, domain_max]
    // range is a two-element array of the screen bounds [range_min, range_max]
    // this gives you two equations to solve:
    // range_min = alpha * domain_min + beta
    // range_max = alpha * domain_max + beta
        // a solution would be:
    var domain_min = domain[0]
    var domain_max = domain[1]
    var range_min = range[0]
    var range_max = range[1]
    // formulas to calculate the alpha and the beta
    var alpha = (range_max - range_min) / (domain_max - domain_min)
    var beta = range_max - alpha * domain_max
    // returns the function for the linear transformation (y= a * x + b)
    return function(x){
    return alpha * x + beta;
    }
}
