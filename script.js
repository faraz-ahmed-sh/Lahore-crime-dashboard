// var margin =  {top: 20, right: 20, bottom: 30, left: 80};
// var width = 720 - margin.left - margin.right;
// var height = 450 - margin.top - margin.bottom;

//load the data
var parseDate = d3.timeParse("%Y-%m-%d");
var parseTime = d3.timeParse("%H%M%S");
var parseTime2 = d3.timeParse("%H%M");
var parseTime3 = d3.timeParse("%H");
var parseTime4 = d3.timeParse("%S");
//var format = d3.format("00,00,00");
var parseDateTime = d3.timeFormat("%Y, %m, %d, %H, %M");


var myDateChart = brushedBarChart()
      .width(500)
      .height(300)
      .x(d3.scaleTime()
        .domain([new Date(2014, 0, 1), new Date(2014,11, 31)]));

var myHourChart = brushedBarChart()
      .width(300)
      .height(300)
      .x(d3.scaleLinear()
        .domain([0, 24]));

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


      var mapWidth = 550;
      var mapHeight = 550;

     //make a map of Lahore's towns
      var svg = d3.select("#pakistanMap")
      .append('svg') 
      .attr('width', mapWidth)
      .attr('height', mapHeight);

      var g = svg.append("g")

      // // D3 Projection
      var projection = d3.geoMercator()
            //.translate([mapWidth/2, mapHeight/2])    // translate to center of screen
            .scale([40000])
           //.
             .center([74.6, 31.5]) // set centre to further North
         //.scale([mapWidth/(2*Math.PI)]) // scale to fit group width
           .translate([465, 250]) // ensure centred in group
      
      // //var projection = d3.geoMercator();

      // var path = d3.geoPath()
      //   .projection(projection);

        var minimumColor = "#BFD3E6", maximumColor = "#88419D";

        var color = d3.scaleLinear()
        .domain([2, 10])
        .range([minimumColor, maximumColor]);

        // var color = d3.scaleThreshold()
        // .domain(d3.range(2, 10))
        // .range(d3.schemeBlues[9])

        // var projection = d3.geoMercator().fitSize([mapWidth, mapHeight], json);
        // //console.log(projection)
        var path = d3.geoPath().projection(projection);

        var mapLabel = svg.append("text")
            .attr("y", mapHeight/3)
            .attr("x", 20)
            .attr("class", "map_neighbourhood_name")
      
      d3.json("lahore_towns_geojson2.json", function(err, json) {

        
        //console.log(topojson.feature(json, json.objects.lahore_towns_geojson))
        //neighborhoods = json.features
        //console.log(neighborhoods)

        // var b = path.bounds(neighborhoods[0]),
        // s = 0.9 / Math.max(
        //                (b[1][0] - b[0][0]) / mapWidth, 
        //                (b[1][1] - b[0][1]) / mapHeight
        //            );
        // projection.scale(s); 
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


          // svg.selectAll('path')
          // .data(json.features)
          // .enter()
          // .append('path')
          // .attr('d', path)
          // .style("stroke-width", "1")
          // .style("stroke", "black");
          console.log(json)
        // Loop through each state data value in the .csv file
          neighborhood_data = neighborhoodGroup.all()
        for (var i = 0; i < neighborhood_data.length; i++) {

          // Grab Neighborhood Name
          var dataNeighborhood = neighborhood_data[i].key;
          console.log(dataNeighborhood)
          // Grab neighborhood crime value 
          var dataValue = neighborhood_data[i].value;
          //console.log(dataValue)

          // Find the corresponding state inside the GeoJSON
          for (var j = 0; j < json.features.length; j++)  {
            var jsonNeighborhood = json.features[j].properties.Name;
            
            if (dataNeighborhood == jsonNeighborhood) {

            // Copy the data value into the JSON
            //console.log(json.features[j].properties.visited)
            json.features[j].properties["visited"] = dataValue; 
            console.log("---", dataValue)
            // Stop looking through the JSON
            break;
            }
          }
        };
            
        // Bind the data to the SVG and create one path per GeoJSON feature
        //console.log(json.features)
        svg.selectAll("path")
          .data(json.features)
          .enter()
          .append("path")

          .attr("d", path)
          .style("stroke-width", "0.7")
          .style("stroke", "black")
          .on("mouseover", mouseover) 
          .on("mouseout", mouseout)
          .on("click", clicked)
          .style("fill", function(d, i) {

          // Get data value
          var value = d.properties.visited;
          //console.log(value)

          if (value) {
          //If value exists…
          console.log(color(i))
          return color(i);

          } else {
          //If value is undefined…
          return "rgb(213,222,217)";
          }
        }
        
        );

});
      function mouseover(d) {     
          mapLabel.text(d.properties.Name + ": " + d.properties.visited) // remove suffix id from name
        }
        function mouseout(d) {     
          mapLabel.text("")  // remove out name
        }
        function clicked(d) {
          console.log(d.properties.visited, d.properties.name) // verify everything looks good
          // Add code here
        }

    myHourChart.onBrushed(function (selected) {
      hourDim.filter(selected);
      update();
    });
  
    myDateChart.onBrushed(function (selected) {
      date.filter(selected);
      update();
    });

    //Make charts
   
    

   // var myNeighborhoodChart = mouseonBarChart()
   //        .width(300)
   //        .x(d3.scaleBand()
   //          .domain(neighborhoodGroup.all().map(function (d) { return d.key; })));
   //  //update();
   //  //console.log(neighborhoodGroup.top(10))
   //  myNeighborhoodChart.onMouseOver(function (d) {
   //    neighborhoodDim.filter(d.key);
   //    //console.log(neighborhoodDim.filter(d.key))
   //    update();
   //  }).onMouseOut(function (d) {
   //    neighborhoodDim.filterAll()
   //    update();
   //  });


// var myCrimeTypeChart = mouseonBarChart()
//         .width(400)
//         .height(300)
//         .x(d3.scaleBand()
//           .domain(crimeTypeGroup.all().map(function (d) { return d.key; })));


   
   //      //.y(function (d) { return d.value; });
   //    //update();
   //  myCrimeTypeChart.onMouseOver(function (d) {
   //    crimeTypeDim.filter(d.key);
   //    update();
   //  }).onMouseOut(function (d) {
   //    crimeTypeDim.filterAll();
   //    update();
   //  });

    //render the charts

    function update() {

      // d3.select("#neighborhood-chart")
      // .datum(neighborhoodGroup.all())
      // .call(myNeighborhoodChart)
      // .select(".x.axis")
      // .selectAll(".tick text")
      // .attr("transform", "rotate(-90)");

      // d3.select("#crime-type-chart")
      // .datum(crimeTypeGroup.all())
      // .call(myCrimeTypeChart)
      // .select(".x.axis")
      // .selectAll(".tick text")
      // .attr("transform", "rotate(-90)");

      d3.select("#date-chart")
      .datum(dateGroup.all())
      .call(myDateChart);

      d3.select("#hour-chart")
      .datum(hourGroup.all())
      .call(myHourChart);
      
    }

    update();

  });