var margin =  {top: 20, right: 20, bottom: 30, left: 80};
var width = 720 - margin.left - margin.right;
var height = 450 - margin.top - margin.bottom;

//load the data
var parseDate = d3.timeParse("%Y-%m-%d");
var parseTime = d3.timeParse("%H%M%S");
var parseTime2 = d3.timeParse("%H%M");
var parseTime3 = d3.timeParse("%H");
var parseTime4 = d3.timeParse("%S");
//var format = d3.format("00,00,00");
var parseDateTime = d3.timeFormat("%Y, %m, %d, %H, %M");

d3.json("Data/lahore_crime_14.json", function(error, data) {

  if (error) throw error;
  
  var data = data.filter(filterCriteria);

  // filter the data for null values in d["Time"]
  function filterCriteria(d) {
      return (d.Date != "2014-05-15" && d.Date != "2014-11-12" && d.Date != "2014-04-23" && d.Date != "2014-02-25" && d.Date != "2014-01-01" && d.Date != "2014-08-18");
    }
  
  data.forEach( function(d, i) {
    d.index = i

    if(parseTime(d["Time"]) == null && (d["Time"] != 0))
      d["Time"] = parseTime2(d["Time"])
    else if(parseTime(d["Time"]) == null && (d["Time"] == 0))
      d["Time"] = parseTime3(d["Time"])
    else if(parseTime(d["Time"]) == null)
      d["Time"] = parseTime4(d["Time"])
    else
      d["Time"] = parseTime(d["Time"])

    d["year"] = +d["year"] || 0
    d["Date"] = parseDate(d["Date"]) || 0
    d["hour"] = +d["hour"] || 0
    d["Date"] = new Date(d["Date"].getFullYear(), d["Date"].getMonth(), d["Date"].getDate(), 
                d["Time"].getHours(), d["Time"].getMinutes())
  });

  dataset = data;

  // A nest operator, for grouping the crime list.
    // var nestByDate = d3.nest()
   //    .key(function(d) {return d3.timeDay(d.Date)})
  
  //Create a Crossfilter instance for the crime dataset
  var ndx = crossfilter(dataset);

  //Define Dimensions
  var crimeTypeDim = ndx.dimension(function(d) { return d["Crime Type"]; });
  var date = ndx.dimension(function(d) { return d["Date"] });
  var hourDim = ndx.dimension(function(d) {return d["Date"].getHours() + d["Date"].getMinutes() / 60});
  var neighborhoodDim = ndx.dimension(function(d) { return d["Neighborhood"]; });
  var allDim = ndx.dimension(function(d) {return d;});

  //Group Data
  var crimeTypeGroup = crimeTypeDim.group();
  var dateGroup = date.group(d3.timeWeek);
  var hourGroup = hourDim.group(Math.floor);
  var neighborhoodGroup = neighborhoodDim.group();
  var all = ndx.groupAll();


  //make a bar chart for the decision variables (date, hour, and crime type) with brushes
  function brushedBarChart() {
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 300,
    height = 300,
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom,

    xScale;
    yScale = d3.scaleLinear(),
    onBrushed = function () {};

    function chart(selection) {
      selection.each(function (data) {

        // select the svg element if it exists
        var svg = d3.select(this).selectAll("svg").data([data]);

        // otherwise, create the skeletal chart
        var svgEnter = svg.enter().append("svg");
        
        var gEnter = svgEnter.append("g");
        gEnter.append("g").attr("class", "x axis");
        gEnter.append("g").attr("class", "y axis");
        gEnter.append("g").attr("class", "brush");
        
        //gBrush.selectAll("rect").attr("height", height);

        innerWidth = width - margin.left - margin.right,
        innerHeight = height - margin.top - margin.bottom,

        //console.log(innerWidth, innerHeight)

        // update the outer dimensions
        svg.merge(svgEnter).attr("width", width)
        .attr("height", height);

        // update the inner dimensions
        var g = svg.merge(svgEnter).select("g")
          .attr("transform", "translate(" + margin.left + "," +  margin.top + ")");


        // var brush = d3.brush()
        //   .extent([xScale(.95), xScale(1.05)])
        //   .on("brush", brushmove);
          
        // var brushg = gEnter.append("g")
        //     .attr("class", "brush")
        //     .call(brush)

        // brushg.selectAll("rect")
        //     .attr("height", height/2);

        // brushg.selectAll(".resize")
        //     .append("path")
        //     .attr("d", resizePath);

        xScale.range([0, innerWidth]);

        yScale.rangeRound([innerHeight, 0])
        .domain([0, (d3.max(data, function(d) { return d.value; }))]);

        g.select(".x.axis")
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(d3.axisBottom(xScale).tickSize(6, 0));

       g.select(".y.axis")
           //.attr("transform", "translate(0," + (margin.left-margin.right*2) + ")")
           .call(d3.axisLeft(yScale).ticks(7));

        var bars = g.selectAll(".bar")
        .data(function (d) { return d; });

        bars.enter().append("rect")
          .attr("class", "bar")
          .merge(bars)
          .attr("x", function(d) { return xScale(d.key); })
          .attr("y", function(d) { return yScale(d.value); })
          .attr("width", (width-(width/data.length)) / (data.length+8))
          .attr("height", function (d) { return innerHeight - yScale(d.value); });
        
        bars.exit().remove();

        g.select(".brush").call(d3.brushX()
          .extent([[0,0], [width, innerHeight]])
          .on("brush", brushed))

      });

    }

    function brushed() {
      if (!d3.event.sourceEvent) return; // Only transition after input.
      if (!d3.event.selection) return; // Ignore empty selections.

      var selection = d3.event.selection.map(xScale.invert);

      //console.log(selected)
      //console.log("fa")

      onBrushed(selection);
      //update();
    }

    chart.margin = function (_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.x = function (_) {
      if (!arguments.length) return xScale;
      xScale = _;
      return chart;
    };

    chart.y = function (_) {
      if (!arguments.length) return yScale;
      yScale = _;
      return chart;
    };

    chart.dimension = function (_) {
      if (!arguments.length) return dimension;
      dimension = _;
      return chart;
    };

    chart.width = function (_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };

    chart.height = function (_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };

    chart.group = function (_) {
      if (!arguments.length) return group;
      group = _;
      return chart;
    };

    chart.onBrushed = function (_) {
      if (!arguments.length) return onBrushed;
      onBrushed = _;
      return chart;
    };

    //chart.gBrush = () => gBrush;

    return chart;
  };




  //make a bar chart for the Neighborhood with mouseover and mouseout
  function mouseonBarChart() {
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 300,
    height = 300,
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom,
    //xValue = function(d) { return d[0]; },
    //yValue = function(d) { return d[1]; },
    xScale;
    yScale = d3.scaleLinear(),
    onMouseOver = function () { },
    onMouseOut = function () { };

    function chart(selection) {
      selection.each(function (data) {

        // select the svg element if it exists
        var svg = d3.select(this).selectAll("svg").data([data]);

        // otherwise, create the skeletal chart

        var svgEnter = svg.enter().append("svg");
        var gEnter = svgEnter.append("g");
        gEnter.append("g").attr("class", "x axis");
        gEnter.append("g").attr("class", "y axis");

        innerWidth = width - margin.left - margin.right,
        innerHeight = height - margin.top - margin.bottom,
        //console.log(innerWidth, innerHeight)

        // Update the outer dimensions.
        svg.merge(svgEnter).attr("width", width)
        .attr("height", height);

        // update the inner dimensions
        var g = svg.merge(svgEnter).select("g")
          .attr("transform", "translate(" + margin.left + "," +  margin.top + ")");

        //yScale = d3.scaleLinear();

        xScale.range([0, innerWidth]);
        //.domain(data.map(xValue));
  //    yScale.domain(neighborhoodCrimeCount.map(function(d) { return d.key; })).padding(0.1);

        yScale.range([innerHeight, 0])
        .domain([0, (d3.max(data, function(d) { return d.value; }))]);

        // g.select(".x.axis")
        //   .attr("transform", "translate(0," + (innerHeight) + ")")
        //   .call(d3.axisBottom(xScale));

       g.select(".y.axis")
           //.attr("transform", "translate(0," + (margin.left-margin.right*2) + ")")
           .call(d3.axisLeft(yScale).ticks(7));

           //console.log(yScale)

        var bars = g.selectAll(".bar")
        .data(function (d) { return d; });

        bars.enter().append("rect")
          .attr("class", "bar")
          .merge(bars)
          .style("margin-top", "10px")
          .attr("x", function(d) { return xScale(d.key); })
          .attr("y", function(d) { return yScale(d.value); })
          //create space between bars
          .attr("width", (width-(width/data.length)) / (data.length+2))
          .attr("height", function (d) { return innerHeight - yScale(d.value); })
          .on("mouseover", onMouseOver)
          .on("mouseout", onMouseOut);

        bars.exit().remove();
      });
    }


    // function X(d) {
    //   return xScale(xValue(d));
    // }

    // function Y(d) {
    //   return yScale(yValue(d));
    // }

    chart.margin = function (_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.x = function (_) {
      if (!arguments.length) return xScale;
      //x = _;
      xScale = _;
      return chart;
    };

    chart.y = function (_) {
      if (!arguments.length) return yScale;
      yScale = _;
      return chart;
    };

    chart.dimension = function (_) {
      if (!arguments.length) return dimension;
      dimension = _;
      return chart;
    };

    chart.width = function (_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };

    chart.height = function (_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };

    chart.group = function (_) {
      if (!arguments.length) return group;
      group = _;
      return chart;
    };

    chart.onMouseOver = function (_) {
      if (!arguments.length) return onMouseOver;
      onMouseOver = _;
      return chart;
    };

    chart.onMouseOut = function (_) {
      if (!arguments.length) return onMouseOut;
      onMouseOut = _;
      return chart;
    };

    return chart;
  };



      var mapWidth = 550;
      var mapHeight = 550;

     //make a map of Lahore's towns
      var svg = d3.select("#pakistanMap")
      .append('svg') 
      .attr('width', mapWidth)
      .attr('height', mapHeight);

      var g = svg.append("g")

      // D3 Projection
      var projection = d3.geoMercator()
           .translate([mapWidth/2, mapHeight/2])    // translate to center of screen
           .scale([1000]); 
      
      //var projection = d3.geoMercator();

      var path = d3.geoPath()
        .projection(projection);

        var color = d3.scaleLinear()
        .range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);
      
      d3.json("lahore_towns_geojson.json", function(err, json) {
        //console.log(topojson.feature(json, json.objects.lahore_towns_geojson))
        //neighborhoods = json.features

         //var neighbourhoods = geojson.feature(pak, pak.objects.lahore_towns_geojson); 
        
        //creates bounding box and helps with projection and scaling
        // var b = path.bounds(json.features),
        //     s = .95 / Math.max((b[1][0] - b[0][0]) / mapWidth, (b[1][1] - b[0][1]) / mapHeight),
        //     t = [(mapWidth - s * (b[1][0] + b[0][0])) / 2, (mapHeight - s * (b[1][1] + b[0][1])) / 2];
        
        // // set project with bounding box data
        // projection
        //     .scale(s)
        //     .translate(t);

      //   svg.append("g")
      //   .attr("class", "districts")
      // .selectAll("path")
      //   .data(topojson.feature(pak, pak.objects.lahore_towns_geojson).features)
      // .enter().append("path")
      //   .attr("d", path)
      //   .style("fill", "white")
      //   .style("stroke", "black");

                // Loop through each state data value in the .csv file
          neighborhood_data = neighborhoodGroup.all()
        for (var i = 0; i < neighborhood_data.length; i++) {

          // Grab Neighborhood Name
          var dataNeighborhood = neighborhood_data[i].key;
          //console.log(dataNeighborhood)
          // Grab neighborhood crime value 
          var dataValue = neighborhood_data[i].value;
          //console.log(json.features)

          // Find the corresponding state inside the GeoJSON
          for (var j = 0; j < json.features.length; j++)  {
            var jsonNeighborhood = json.features[j].properties.Name;
            //console.log(json.features[j].properties)
            if (dataNeighborhood == jsonNeighborhood) {

            // Copy the data value into the JSON
            //console.log(json.features[j].properties.visited)
            json.features[j].properties["visited"] = dataValue; 


            // Stop looking through the JSON
            break;
            }
          }
        }
            
        // Bind the data to the SVG and create one path per GeoJSON feature
        //console.log(json.features)
        svg.selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
          .style("stroke", "#fff")
          .style("stroke-width", "1")
          .style("fill", function(d) {

          // Get data value
          var value = d.properties.visited;
          console.log(value)

          if (value) {
          //If value exists…
          return color(value);

          } else {
          //If value is undefined…
          return "rgb(213,222,217)";
          }
        });
      });


  // Make charts
  var myNeighborhoodChart = mouseonBarChart()
        .width(300)
        .dimension(neighborhoodDim)
        .group(neighborhoodGroup)
        .x(d3.scaleBand()
          .domain(neighborhoodGroup.all().map(function (d) { return d.key; })));

  //console.log(neighborhoodGroup.top(10))
  myNeighborhoodChart.onMouseOver(function (d) {
    neighborhoodDim.filter(d.key);
    update();
  }).onMouseOut(function (d) {
    neighborhoodDim.filterAll();
    update();
  });


  var myCrimeTypeChart = mouseonBarChart()
        .width(400)
        .height(300)
        .dimension(crimeTypeDim)
        .group(crimeTypeGroup)
        .x(d3.scaleBand()
          .domain(crimeTypeGroup.all().map(function (d) { return d.key; })));
        //.y(function (d) { return d.value; });

  myCrimeTypeChart.onMouseOver(function (d) {
    crimeTypeDim.filter(d.key);
    update();
  }).onMouseOut(function (d) {
    crimeTypeDim.filterAll();
    update();
  });

 var myDateChart = brushedBarChart()
        .width(500)
        .height(300)
        .dimension(date)
        .group(dateGroup)
        .x(d3.scaleTime()
          .domain([new Date(2014, 0, 1), new Date(2014,11, 31)]));
  
  myDateChart.onBrushed(function (selected) {
    date.filter(selected);
    update();
  });

 var myHourChart = brushedBarChart()
        .width(300)
        .height(300)
        .dimension(hourDim)
        .group(hourGroup)
        .x(d3.scaleLinear()
          .domain([0, 24]));

  myHourChart.onBrushed(function (selection) {
    hourDim.filter(selection);
    update();
  });

  //render the charts

  function update() {

    d3.select("#neighborhood-chart")
    .datum(neighborhoodGroup.all())
    .call(myNeighborhoodChart)
    .select(".x.axis")
    .selectAll(".tick text")
    .attr("transform", "rotate(-90)");

    d3.select("#crime-type-chart")
    .datum(crimeTypeGroup.all())
    .call(myCrimeTypeChart)
    .select(".x.axis")
    .selectAll(".tick text")
    .attr("transform", "rotate(-90)");

    d3.select("#date-chart")
    .datum(dateGroup.all())
    .call(myDateChart);

    d3.select("#hour-chart")
    .datum(hourGroup.all())
    .call(myHourChart);
    
  }

  update();

  // Render the initial list.
  //var list = d3.selectAll(".list")
  //    .data([crimeList]);


  // // Render the total.
  // d3.selectAll("#total")
  //     .text(ndx.size());


  //  renderAll();

  // // Renders the specified chart or list.
  // function render(method) {
  //   d3.select(this).call(method);
  //   //update();
  // }

  // //Whenever the brush moves, re-rendering everything.
  // function renderAll() {
  //   //chart.each(update);
  //   //update.each(render);
  //   //list.each(render);
  //   update();
  //   //d3.select("#active").text(all.value());
  // }

  // window.filter = function(filters) {
  //   filters.forEach(function(d, i) {charts[i].filter(d)});
  //   renderAll();

  // };

  // window.reset = function(i) {
  //   charts[i].filter(null);
  //   renderAll();
  // };
});
