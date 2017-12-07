// var margin =  {top: 20, right: 20, bottom: 30, left: 80};
// var width = 720 - margin.left - margin.right;
// var height = 450 - margin.top - margin.bottom;

//load the data
var parseDate = d3.timeParse("%Y-%m-%d");
var parseTime = d3.timeParse("%H%M%S");
var parseTime2 = d3.timeParse("%H%M");
var parseTime3 = d3.timeParse("%H");
var parseTime4 = d3.timeParse("%S");
var parseDateTime = d3.timeFormat("%Y, %m, %d, %H, %M");


var myDateChart = brushedBarChart()
      .width(300)
      .height(300)
      .x(d3.scaleTime()
        .domain([new Date(2014, 0, 1), new Date(2014,5, 31)]));

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

  //console.log(dataset)

  //Create a Crossfilter instance for the crime dataset
  var crimeData = crossfilter(dataset);

  //Define Dimensions
  crimeData.crimeTypeDim = crimeData.dimension(function(d) { return d["Crime Type"]; });
  crimeData.date = crimeData.dimension(function(d) { return d["Date"] });
  crimeData.hourDim = crimeData.dimension(function(d) {return d["Date"].getHours() + d["Date"].getMinutes() / 60});
  crimeData.neighborhoodDim = crimeData.dimension(function(d) { return d["Neighborhood"]; });
  // crimeData.allDim = crimeData.dimension(function(d) {return d;});

  //Group Data
  crimeData.crimeTypeGroup = crimeData.crimeTypeDim.group();
  crimeData.dateGroup = crimeData.date.group(d3.timeWeek);
  crimeData.hourGroup = crimeData.hourDim.group(Math.floor);
  crimeData.neighborhoodGroup = crimeData.neighborhoodDim.group();
  // crimeData.all = ndx.groupAll();

    //Make charts and activate brushes/mouseovers
    myDateChart.onBrushed(function (select) {
      crimeData.date.filter(select);
      update();
      map.update(crimeData.neighborhoodGroup.all())
    });

    myHourChart.onBrushed(function (selected) {
      crimeData.hourDim.filter(selected);
      update();
      map.update(crimeData.neighborhoodGroup.all())
    });
   
   var myNeighborhoodChart = mouseonBarChart()
          .width(300)
          .x(d3.scaleBand()
            .domain(crimeData.neighborhoodGroup.all().map(function (d) { return d.key; })));

    myNeighborhoodChart.onMouseOver(function (d) {
      neighborhoodDim.filter(d.key);
      //console.log(neighborhoodDim.filter(d.key))
      update();
      map.update(neighborhoodGroup.all())
    }).onMouseOut(function (d) {
      neighborhoodDim.filterAll()
      update();
      map.update(neighborhoodGroup.all())
    });

    
var myCrimeTypeChart = mouseonBarChart()
        .width(350)
        .height(300)
        .x(d3.scaleBand()
          .domain(crimeData.crimeTypeGroup.all().map(function (d) { return d.key; })));
   
    myCrimeTypeChart.onMouseOver(function (d) {
      crimeData.crimeTypeDim.filter(d.key);
      update();
      map.update(crimeData.neighborhoodGroup.all())
    }).onMouseOut(function (d) {
      crimeData.crimeTypeDim.filterAll();
      update();
      map.update(crimeData.neighborhoodGroup.all())
    });


    d3.queue()
      .defer(d3.json, 'lahore_towns_geojson2.json')
      .awaitAll(function (error, results) {
        if (error) { throw error; }

        map = new Choropleth(results[0]);
        map.update(crimeData.neighborhoodGroup.all());
        //console.log(neighborhoodGroup.all())
      });

    //render the charts

    function update() {

      d3.select("#neighborhood-chart")
      .datum(crimeData.neighborhoodGroup.all())
      .call(myNeighborhoodChart)
      .select(".x.axis")
      .selectAll(".tick text")
      .attr("transform", "rotate(-90) translate(-6,-10)");

      d3.select("#crime-type-chart")
      .datum(crimeData.crimeTypeGroup.all())
      .call(myCrimeTypeChart)
      .select(".x.axis")
      .selectAll(".tick text")
      .attr("transform", "rotate(-90) translate(-6,-10)");

      d3.select("#date-chart")
      .datum(crimeData.dateGroup.all())
      .call(myDateChart);

      d3.select("#hour-chart")
      .datum(crimeData.hourGroup.all())
      .call(myHourChart);
    }

    update();
    
  });