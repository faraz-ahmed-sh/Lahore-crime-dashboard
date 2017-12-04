function Choropleth(change, json) {
      var margin = {top: 20, right: 20, bottom: 30, left: 40},
      mapWidth = 550,
      mapHeight = 550,

      chart = this;

      chart.svg = d3.select("#pakistanMap").append("svg")
        .attr("width", mapWidth)
        .attr("height", mapHeight)
        .append("g")
        .attr("transform", function(){ return "translate(" + margin.left + "," + margin.top + ")" });
      
        //selectAll("svg").data([data]);

      	 // Data merge:

          for (var i = 0; i < change.length; i++) {

            // Grab Neighborhood Name
            var dataNeighborhood = change[i].key;
            console.log(dataNeighborhood)
            // Grab neighborhood crime value 
            var dataValue = change[i].value;
            //console.log(json)
            // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++)  {
              var jsonNeighborhood = json.features[j].properties.Name;
              
              if (dataNeighborhood == jsonNeighborhood) {

              // Copy the data value into the JSON
              json.features[j].properties["visited"] = dataValue; 
              // Stop looking through the JSON
              break;
              
              };
            
            };
          
          chart.json = json
  };

  Choropleth.prototype.update2 = function () {

      var chart = this;
      // Interrupt ongoing transitions:  
      chart.svg.selectAll("*").interrupt();

      var minimumColor = "#DCFF5B", maximumColor = "#E85138";

      chart.colorScale = d3.scaleLinear()
        .domain([2, 10])
        .range([minimumColor, maximumColor]);

        var projection = d3.geoMercator()
        //.translate([mapWidth/2, mapHeight/2])    // translate to center of screen
        .scale([45000])
       //.
         .center([74.6, 31.5]) // set centre to further North
     //.scale([mapWidth/(2*Math.PI)]) // scale to fit group width
       .translate([465, 250]) // ensure centred in group

        var path = d3.geoPath().projection(projection);

        var div = d3.select("#pakistanMap")
        .append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

        chart.map = chart.svg.append("g").selectAll("path")
          .data(chart.json.features)
          .enter()
          .append("path")
          .attr("class", "map")
          .attr("d", path)
          .style("stroke-width", "0.7")
          .style("stroke", "black")
          .on("mouseover", mouseover) 
          .on("mouseout", mouseout)
          // .on("click", clicked)
          .style("fill", function(d, i) {

          // Get data value
          var value = d.properties.visited;
          //console.log(value)

          if (value) {
          //If value exists…
          //console.log(color(i))
          return chart.colorScale(i);

          } else {
          //If value is undefined…
          return "rgb(213,222,217)";
          }
        });
        // d3.json("lahore_towns_geojson2.json", function(err, json) {

	        // Bind the data to the SVG and create one path per GeoJSON feature

      function mouseover(d) {     
            div.transition()        
               .duration(200)      
               .style("opacity", .9);
              div.text(d.properties.Name + ": " + d.properties.visited) // remove suffix id from name
              .style("left", (d3.event.pageX) + "px")     
               .style("top", (d3.event.pageY - 28) + "px");  

            }
            function mouseout(d) {     
              //mapLabel.text("")  // remove out name
              div.transition()        
               .duration(500)      
               .style("opacity", 0); 
            }
        
	    };
};
