var chart, hub, lineData, dataPoints, numPoints;

$(function () {
    hub = $.connection.dataHub;
    initiateSignalRConnection();
    setSignalRCallbacks();
});

function setSignalRCallbacks() {
    hub.client.initiateChart = function (points) {
        console.log(points);
        dataPoints = points;
        transformData();
        if (!chart) {
            chart = initChart();
        } else {
            chart.redrawChart();
        }
    };

    hub.client.updateNewDataPointValues = function (points) {
        dataPoints.splice(numPoints - points.length, points.length);
        dataPoints.forEach(function (point) {
            point.x++;
        });

        dataPoints = points.concat(dataPoints);

        console.log(dataPoints);
        transformData();
        console.log(lineData);
        chart.redrawChart();
    };
}

function initiateSignalRConnection() {
    $.connection.hub.start().then(function () {
        hub.server.getInitialDataPoints(100);
        numPoints = 100;
        $('#connectionLabel').text("Connected");
    });
}

function transformData() {
    lineData = [];
    dataPoints.forEach(function (point) {
        lineData.push({ x: xCalculation(point.x, numPoints), y: point.y });
    });
}

function xCalculation(num, numPoints) {
    return (num * 15 / (numPoints - 1));
}

function initChart() {

    var svgElement = d3.select("#svgLineChart"),
        width = 500,
        height = 250,
        padding = 15,
        pathClass = "path";
    var xScale, yScale, xAxisGen, yAxisGen, lineFunc;

    drawLineChart();

    function setChartParameters() {

        xScale = d3.scale.linear()
            .range([padding + 5, width - padding])
            .domain([0, 16]);

        yScale = d3.scale.linear()
            .range([height - padding, 10]).domain([
            d3.min(lineData, function (d) {
                return d.y;
            }),
            d3.max(lineData, function (d) {
                return d.y;
            })
            ]);

        xAxisGen = d3.svg.axis()
            .scale(xScale)
            .ticks(10)
            .orient("bottom");

        yAxisGen = d3.svg.axis()
            .scale(yScale)
            .ticks(5)
            .orient("left");

        lineFunc = d3.svg.line()
            .x(function (d) {
                return xScale(d.x);
            })
            .y(function (d) {
                return yScale(d.y);
            });
    }

    function drawLineChart() {


        setChartParameters();

        console.log("Set Chart Parameters");

        svgElement.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0 " + (height - padding) + ")")
            .call(xAxisGen);

        svgElement.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxisGen);

        svgElement.append("path").attr({
            "d": lineFunc(lineData),
            "stroke": "black",
            "stroke-width": 1,
            "fill": "none",
            "class": pathClass
        });
    }

    function redrawLineChart() {
        setChartParameters();
        svgElement.selectAll("g.y.axis").call(yAxisGen);
        svgElement.selectAll("g.x.axis").call(xAxisGen);
        svgElement.selectAll("." + pathClass).attr({ d: lineFunc(lineData) });
    }

    return {
        redrawChart: redrawLineChart
    }
}