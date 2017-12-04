

function Choropleth(json) {
      var margin = {top: 20, right: 20, bottom: 30, left: 40},
      mapWidth = 550,
      mapHeight = 550,

      chart = this;
      chart.json = json;

      chart.svg = d3.select("#pakistanMap").append("svg")
        .attr("width", mapWidth)
        .attr("height", mapHeight)
        .append("g")
        .attr("transform", function(){ return "translate(" + margin.left + "," + margin.top + ")" });

      chart.minimumColor = "#DCFF5B"; 
      chart.maximumColor = "#E85138";

      chart.colorScale = d3.scaleLinear()
        .domain([0,7000])
        .range([chart.minimumColor, chart.maximumColor]);

      chart.projection = d3.geoMercator()
        .scale([45000])
        .center([74.6, 31.5]) // set centre to further North
        .translate([465, 250]) // ensure centred in group

      chart.path = d3.geoPath().projection(chart.projection);

      chart.div = d3.select("#pakistanMap")
        .append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

      chart.map = chart.svg.append("g").selectAll("path")
        .data(chart.json.features)
        .enter()
        .append("path")
        .attr("class", "map")
        .attr("d", chart.path)
        .style("stroke-width", "0.7")
        .style("stroke", "black")
};


Choropleth.prototype.update = function (filteredData) {

    // Interrupt ongoing transitions:  

    var chart = this;
    chart.filteredData = filteredData

    chart.svg.selectAll("*").interrupt();

    // Data merge:
    for (var i = 0; i < chart.filteredData.length; i++) {

      // Grab Neighborhood Name
      var dataNeighborhood = chart.filteredData[i].key;
      // console.log(dataNeighborhood)
      // Grab neighborhood crime value 
      var dataValue = chart.filteredData[i].value;
      //console.log(json)
      // Find the corresponding state inside the GeoJSON
      for (var j = 0; j < chart.json.features.length; j++)  {
        var jsonNeighborhood = chart.json.features[j].properties.Name;
        
        if (dataNeighborhood == jsonNeighborhood) {
          // Copy the data value into the JSON
          chart.json.features[j].properties["visited"] = dataValue; 
          // Stop looking through the JSON
          break;
        };
      };

      };

      chart.map
        .style("fill", function(d) { 
            return chart.colorScale(d.properties.visited);
          })
      // .on("mouseover", mouseover) 
      // .on("mouseout", mouseout)
      // .on("click", clicked)
};        
// d3.json("lahore_towns_geojson2.json", function(err, json) {

// Bind the data to the SVG and create one path per GeoJSON feature

// function mouseover(d) {     
//       div.transition()        
//          .duration(200)      
//          .style("opacity", .9);
//         div.text(d.properties.Name + ": " + d.properties.visited) // remove suffix id from name
//         .style("left", (d3.event.pageX) + "px")     
//          .style("top", (d3.event.pageY - 28) + "px");  

//       }
// function mouseout(d) {     
//   //mapLabel.text("")  // remove out name
//   div.transition()        
//    .duration(500)      
//    .style("opacity", 0); 
// }
  
	    
