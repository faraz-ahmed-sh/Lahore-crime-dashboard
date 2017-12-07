/* global d3, crossfilter, timeSeriesChart, barChart */

//load the data
var parseDate = d3.timeParse("%Y-%m-%d");
var parseTime = d3.timeParse("%H%M%S");
var parseTime2 = d3.timeParse("%H%M");
var parseTime3 = d3.timeParse("%H");
var parseTime4 = d3.timeParse("%S");
var parseDateTime = d3.timeFormat("%Y, %m, %d, %H, %M");


var myNeighborhoodChart = barChart()
  .width(300)
  .height(300)
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});


var myCrimeTypeChart = barChart()
  .width(350)
  .height(300)
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});  


var myDateChart = timeSeriesChart2()
  .width(300)
  .height(300)
  .scalex(d3.scaleTime())
  .domainx([new Date(2014, 0, 1), new Date(2014,5, 31)])
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});
  


var myHourChart = timeSeriesChart2()
  .width(300)
  .height(300)
  .scalex(d3.scaleLinear())
  .domainx([0, 24])
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});


d3.json("data/lahore_crime_14.json", function(error, data) {
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



  var crimeData = crossfilter(data);
  //console.log(crimeData)

  //Define Dimensions
  crimeData.crimeTypeDim = crimeData.dimension(function(d) { return d["Crime Type"]; });
  crimeData.neighborhoodDim = crimeData.dimension(function(d) { return d["Neighborhood"]; });
  crimeData.date = crimeData.dimension(function(d) { return d["Date"] });
  crimeData.hourDim = crimeData.dimension(function(d) {return d["Date"].getHours() + d["Date"].getMinutes() / 60});
  //crimeData.allDim = crimeData.dimension(function(d) {return d;});

  //Group Data
  crimeData.crimeTypeGroup = crimeData.crimeTypeDim.group();
  crimeData.neighborhoodGroup = crimeData.neighborhoodDim.group();
  crimeData.dateGroup = crimeData.date.group(d3.timeWeek);
  crimeData.hourGroup = crimeData.hourDim.group(Math.floor);
  // crimeData.all = ndx.groupAll();

    //Make charts and activate brushes/mouseovers

    d3.queue()
      .defer(d3.json, 'lahore_towns_geojson2.json')
      .awaitAll(function (error, results) {
        if (error) { throw error; }

        map = new Choropleth(results[0]);
        map.update(crimeData.neighborhoodGroup.all());
      });

  myNeighborhoodChart.onMouseOver(function (d) {
    crimeData.neighborhoodDim.filter(d.key);
    update();
    map.update(crimeData.neighborhoodGroup.all())
  }).onMouseOut(function (d) {
    crimeData.neighborhoodDim.filterAll()
    update();
    map.update(crimeData.neighborhoodGroup.all())
  });


  myCrimeTypeChart.onMouseOver(function (d) {
    crimeData.crimeTypeDim.filter(d.key);
    update();
    map.update(crimeData.neighborhoodGroup.all())
  }).onMouseOut(function (d) {
    crimeData.crimeTypeDim.filterAll();
    update();
    map.update(crimeData.neighborhoodGroup.all())
  });

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


  function reset() {
    crimeData.neighborhoodDim.filter(null);
    crimeData.crimeTypeDim.filter(null);
    crimeData.date.filter(null);
    crimeData.hourDim.filter(null);

    update();
  }


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

    d3.select("button").on("click", reset);

  }



  update();
}
);