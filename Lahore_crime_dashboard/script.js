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


    //     // Dark arts of ugly hackery ahead 
    // function brushmove() { 
    //     // Get brush extent vals
    //     var s = brush.extent(), lower = s[0], upper = s[1];
    //     // Select bar rects and adjust opacity
    //     gEnter.selectAll("rect")
    //         .style("opacity", function(d) {
    //             // Get data value keys and scale them
    //             var k = xScale(d.key) + barPadding * xScale.rangeBand();
    //             // If d.key is within extent adjust opacity
    //             return lower <= k && k <= upper ? "1" : ".2";  
    //          });
        
    //     // Calculate pseudo extent from .range() and .rangeBand()
    //     var leftEdge = xScale.range(), width = xScale.rangeBand(); 
    //     for (var _l=0; lower > (leftEdge[_l] + width); _l++) {};
    //     for (var _u=0; upper > (leftEdge[_u] + width); _u++) {};
    //     // Filter crossfilter by the pseudo extent
    //     filt = byScr.filterRange([ xScale.domain()[_l], xScale.domain()[_u] ])
    //     // Render filtered hospital plots
    //     update();
    //     // .selectAll("g.hospital").remove();
    //     // _mapChart.selectAll("g.hospital").transition(); 
    //     // _mapChart.select("g.hospital").attr("d", plotHospitals(filt))

    // } // End brushmove

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




  function LahoreCloroplethByTown() {

    var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 960,
    height = 600,
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom,
    color = function(d) { return d.value; },
    //id = function(d) { return d.id; },
    pak = null,
    updateDomain = true,
    path = d3.geoPath(),
    colorScale = d3.scaleThreshold()
      .range(d3.schemeBlues[9]);
    // dicValues = d3.map();

    function update(sel, data) {
    // Select the svg element, if it exists.
    var svg = d3.select(sel).selectAll("svg").data([data]);

    // Otherwise, create the skeletal chart.
    var svgEnter = svg.enter().append("svg");
    var gEnter = svgEnter.append("g");
    gEnter.append("g").attr("class", "states");
    gEnter.append("path").attr("class", "state-borders");
    
    // Update the outer dimensions.
    svg.merge(svgEnter).attr("width", width)
      .attr("height", height);

    innerWidth = width - margin.left - margin.right;
    innerHeight = height - margin.top - margin.bottom;

    // Update the inner dimensions.
    var g = svg.merge(svgEnter).select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top +
          "), scale("+ Math.min(innerWidth/960, innerHeight/600) + ")");

    if (updateDomain) {
      // this a threshold scale with 9 steps, so the domain needs to be 9 steps
      //
      var domain = d3.extent(data.map(color));
      colorScale.domain(d3.range(domain[0], domain[1], (domain[1]-domain[0])/9));

      // Draw the shapes
    var states = g.select(".states")
      .selectAll("path")
      .data(topojson.feature(pak, pak.objects.states).features);

    states
      .enter()
        .append("path")
      .merge(states)
        .attr("d", path)
        .style("fill", "white"); //default value

    // var statesValues = g.select(".states")
    //   .selectAll("path")
    //   .data(data, id);

    // statesValues
    //   .style("fill", function (d) {
    //     return colorScale(color(d));
    //   })
    //   .on("mouseenter", function (d) {
    //     console.log(color(d));
    //     console.log(d);
    //   });


    // g.select(".state-borders")
    //   .attr("d", path(topojson.mesh(usShapes, usShapes.objects.states, function(a, b) { return a !== b; })));


  }

  function chart(selection) {
    selection.each(function (data) {
      var sel = this;
      if (usShapes===null) {
        // If we don't have the geo shapes, load them
        d3.json("lahore_towns_topojson.json", function(error, _pak) {
          if (error) throw error;
          usShapes = _pak;

          update(sel, data);
        });
      } else {

        // Do we already have the geo shapes? then just draw
        update(sel, data);
      }
    });

  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.id = function(_) {
    if (!arguments.length) return id;
    id = _;
    return chart;
  };

  chart.color = function(_) {
    if (!arguments.length) return color;
    color = _;
    return chart;
  };

  chart.colorScale = function(_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return chart;
  };

  chart.updateDomain = function(_) {
    if (!arguments.length) return updateDomain;
    updateDomain = _;
    return chart;
  };


  return chart;
}









    }









      var mapWidth = 550;
      var mapHeight = 550;

     //make a map of Lahore's towns
      var svg = d3.select("#pakistanMap")
      .append('svg') 
      .attr('width', mapWidth)
      .attr('height', mapHeight);

      var g = svg.append("g")
      
      var projection = d3.geoMercator();

      var path = d3.geoPath()
        .projection(projection);
      
      d3.json("lahore_towns_topojson.json", function(err, pak) {
        //console.log(pak.objects.lahore_towns_geojson)

        var neighbourhoods = topojson.feature(pak, pak.objects.lahore_towns_geojson); 
        
        // set default projection values 
        projection
            .scale(1)
            .translate([0, 0]);
        
        // creates bounding box and helps with projection and scaling
        var b = path.bounds(neighbourhoods),
            s = .95 / Math.max((b[1][0] - b[0][0]) / mapWidth, (b[1][1] - b[0][1]) / mapHeight),
            t = [(mapWidth - s * (b[1][0] + b[0][0])) / 2, (mapHeight - s * (b[1][1] + b[0][1])) / 2];
        
        // set project with bounding box data
        projection
            .scale(s)
            .translate(t);

        svg.append("g")
        .attr("class", "districts")
      .selectAll("path")
        .data(topojson.feature(pak, pak.objects.lahore_towns_geojson).features)
      .enter().append("path")
        .attr("d", path)
        .style("fill", "white")
        .style("stroke", "black");
      })


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



  var chartmap = LahoreCloroplethByTown()
  .width(660)
  .height(400)

  // What attribute for the color values
  .color(function (d) { return d.value; });

// d3.csv("1_Revenues.csv",
//   preprocess,
//   function (err, data) {
//     d3.select("#maps")      
//       .datum(data)
//       .call(chartmap);

//   }
// );
    
// function preprocess (d) {
//   // Convert the state name to ansi code;
//   var state = stateCodes[d["Name"].slice(0,2)];
//   if (state===undefined || d.Year4!=="2008" ) { //only keep 2008
//     return;
//   }
//   d.id = state;
//   d.value = +d["Total Revenue"];
//   return d;
// }

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


  // function crimeList(div) {
  //   var crimeByDate = nestByDate.entries(date.top(40));
  //   console.log(crimeByDate)
   
  //   div.each(function() {
  //     var date = d3.select(this).selectAll(".date")
  //         .data(crimeByDate, function(d) {return d.key});
  //         //console.log(date)

  //   date.exit().remove();

  //     date.enter().append("div")
  //         .attr("class", "date")
  //       .append("div")
  //         .attr("class", "day")
  //         .text(function(d) {return formatDate(d.values[0].date)})
  //       .merge(date);
  //       console.log(date)

  //     var crime = date.order().selectAll(".crime")
  //         .data(function(d) {return d.values}, function(d) {return d.index});
          
  //         crime.exit().remove();

  //     var crimeEnter = crime.enter().append("div")
  //         .attr("class", "crime");

  //     crimeEnter.append("div")
  //         .attr("class", "time");
  //         //.text(function(d) {return formatTime(d.date)});

  //     crimeEnter.append("div")
  //         .attr("class", "neighborhood")
  //         .text(function(d) {return d["Neighborhood"]});

  //     crimeEnter.append("div")
  //         .attr("class", "crimeType")
  //         .text(function(d) {return d["Crime Type"]});

  //     crimeEnter.merge(crime);

  //     crime.order();
  //   });
  // }

  // a bar chart function that uses the same properties for each of the chart
  // on which a cross filter is applied
  // source: https://github.com/square/crossfilter/blob/gh-pages/index.html
//  function barChart() {
//     if (!barChart.id) barChart.id = 0;

//     let margin = { top: 10, right: 13, bottom: 20, left: 10 };
//     let x;
//     let y = d3.scaleLinear().range([200, 0]);
//     const id = barChart.id++;
//     const xaxis = d3.axisBottom();
//     const yaxis = d3.axisLeft();
//     const brush = d3.brushX();
//     let brushDirty;
//     let dimension;
//     let group;
//     let round;
//     let gBrush;
//     var xTickRot;
    

//     function chart(div) {

//       const width = x.range()[1];
//       const height = y.range()[0];

//       brush.extent([[0, 0], [width, height]]);
//       //set y domain to be the topmost value of a particular dataset
//       y.domain([0, group.top(1)[0].value]);

//       div.each(function () {
//         const div = d3.select(this);
//         let g = div.select('g');

//         // Create the skeletal chart.
//         if (g.empty()) {
//           div.select('.title').append('a')
//             .attr('href', `javascript:reset(${id})`)
//             .attr('class', 'reset')
//             .text(' reset')
//             .style('display', 'none');

//           g = div.append('svg')
//             .attr('width', width + margin.left + margin.right)
//             .attr('height', height*1.5 + margin.top + margin.bottom)
//             .append('g')
//               .attr('transform', `translate(${margin.left},${margin.top})`);

//           g.append('clipPath')
//             .attr('id', `clip-${id}`)
//             .append('rect')
//               .attr('width', width)
//               .attr('height', height);

//           g.selectAll('.bar')
//             .data(['background', 'foreground'])
//             .enter().append('path')
//               .attr('class', d => `${d} bar`)
//               .datum(group.all());

//           g.selectAll('.foreground.bar')
//             .attr('clip-path', `url(#clip-${id})`);

//           g.append('g')
//             .attr('class', 'xaxis')
//             .attr('transform', `translate(0,${height})`)
//             .call(xaxis)
//             .selectAll("text")
//              .attr("dx", "-45")
//              .attr("dy", "-10")
//              .attr("transform", "rotate(-90)");
//              //.attr("transform", "rotate(-90)" );

//           // Initialize the brush component with pretty resize handles.
//           gBrush = g.append('g')
//             .attr('class', 'brush')
//             .call(brush);

//           gBrush.selectAll('.handle--custom')
//             .data([{ type: 'w' }, { type: 'e' }])
//             .enter().append('path')
//               .attr('class', 'brush-handle')
//               .attr('cursor', 'ew-resize')
//               .attr('d', resizePath)
//               .style('display', 'none');
//         }

//         // Only redraw the brush if set externally.
//         if (brushDirty !== false) {
//           const filterVal = brushDirty;
//           brushDirty = false;

//           div.select('.title a').style('display', d3.brushSelection(div) ? null : 'none');

//           if (!filterVal) {
//             g.call(brush);

//             g.selectAll(`#clip-${id} rect`)
//               .attr('x', 0)
//               .attr('width', width);

//             g.selectAll('.brush-handle').style('display', 'none');
//             renderAll();
//           } else {
//             const range = filterVal.map(x);
//             brush.move(gBrush, range);
//           }
//         }

//         g.selectAll('.bar').attr('d', barPath);
//       });

//       function barPath(groups) {
//         const path = [];
//         let i = -1;
//         const n = groups.length;
//         let d;
//         while (++i < n) {
//           d = groups[i];
//           path.push('M', x(d.key), ',', height, 'V', y(d.value), 'h9V', height);
//         }
//         return path.join('');
//       }

//       function resizePath(d) {
//         const e = +(d.type === 'e');
//         const x = e ? 1 : -1;
//         const y = height / 3;
//         return `M${0.5 * x},${y}A6,6 0 0 ${e} ${6.5 * x},${y + 6}V${2 * y - 6}A6,6 0 0 ${e} ${0.5 * x},${2 * y}ZM${2.5 * x},${y + 8}V${2 * y - 8}M${4.5 * x},${y + 8}V${2 * y - 8}`;
//       }
//     }

//     brush.on('start.chart', function () {
//       const div = d3.select(this.parentNode.parentNode.parentNode);
//       div.select('.title a').style('display', null);
//     });

//     brush.on('brush.chart', function () {
//       const g = d3.select(this.parentNode);
//       const brushRange = d3.event.selection || d3.brushSelection(this); // attempt to read brush range
//       const xRange = x && x.range(); // attempt to read range from x scale
//       let activeRange = brushRange || xRange; // default to x range if no brush range available

//       const hasRange = activeRange &&
//         activeRange.length === 2 &&
//         !isNaN(activeRange[0]) &&
//         !isNaN(activeRange[1]);

//       if (!hasRange) return; // quit early if we don't have a valid range

//       // calculate current brush extents using x scale
//       let extents = activeRange.map(x.invert);

//       // if rounding fn supplied, then snap to rounded extents
//       // and move brush rect to reflect rounded range bounds if it was set by user interaction
//       if (round) {
//         extents = extents.map(round);
//         activeRange = extents.map(x);

//         if (
//           d3.event.sourceEvent &&
//           d3.event.sourceEvent.type === 'mousemove'
//         ) {
//           d3.select(this).call(brush.move, activeRange);
//         }
//       }

//       // move brush handles to start and end of range
//       g.selectAll('.brush-handle')
//         .style('display', null)
//         .attr('transform', (d, i) => `translate(${activeRange[i]}, 0)`);

//       // resize sliding window to reflect updated range
//       g.select(`#clip-${id} rect`)
//         .attr('x', activeRange[0])
//         .attr('width', activeRange[1] - activeRange[0]);

//       // filter the active dimension to the range extents
//       dimension.filterRange(extents);

//       // re-render the other charts accordingly
//       renderAll();
//     });

//     brush.on('end.chart', function () {
//       // reset corresponding filter if the brush selection was cleared
//       // (e.g. user "clicked off" the active range)
//       if (!d3.brushSelection(this)) {
//         reset(id);
//       }
//     });

//     chart.margin = function (_) {
//       if (!arguments.length) return margin;
//       margin = _;
//       return chart;
//     };

//     chart.x = function (_) {
//       if (!arguments.length) return x;
//       x = _;
//       xaxis.scale(x);
//       //axis.attr("transform", "rotate(-20)" );
//       return chart;
//     };

//     chart.y = function (_) {
//       if (!arguments.length) return y;
//       y = _;
//       return chart;
//     };

//     chart.dimension = function (_) {
//       if (!arguments.length) return dimension;
//       dimension = _;
//       return chart;
//     };

//     chart.filter = _ => {
//       if (!_) dimension.filterAll();
//       brushDirty = _;
//       return chart;
//     };

//     chart.group = function (_) {
//       if (!arguments.length) return group;
//       group = _;
//       return chart;
//     };
    
//     chart.xTickRot = function (_) {
//       if (!arguments.length) return xTickRot;
//       xTickRot = _;
//       return chart;
//     };

//     chart.round = function (_) {
//       if (!arguments.length) return round;
//       round = _;
//       return chart;
//     };

//     chart.gBrush = () => gBrush;

//     return chart;
//   }
// });
