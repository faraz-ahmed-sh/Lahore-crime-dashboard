function lahoreMap() {
      var mapWidth = 550;
      var mapHeight = 550;
      // var margin = {top: 20, right: 20, bottom: 30, left: 40};
	    // innerWidth = mapWidth - margin.left - margin.right,
	    // innerHeight = mapHeight - margin.top - margin.bottom,

      function chart (selection) {

        selection.each(function (data) {
        	//console.log(data)

        	var svg = d3.select(this).selectAll("svg").data([data]);

        	// var svgEnter = svg.enter().append("svg");
	        // var gEnter = svgEnter.append("g");
	        // gEnter.append("g").attr("class", "x axis");
	        // gEnter.append("g").attr("class", "y axis");

	        // innerWidth = mapWidth - margin.left - margin.right,
	        // innerHeight = mapHeight - margin.top - margin.bottom,


	        // Update the outer dimensions.
	        svg.attr("width", mapWidth)
	        .attr("height", mapHeight);

	        // update the inner dimensions
	        // var g = svg.merge(svgEnter).select("g")
	        //   .attr("transform", "translate(" + margin.left + "," +  margin.top + ")");

        	var projection = d3.geoMercator()
            //.translate([mapWidth/2, mapHeight/2])    // translate to center of screen
            .scale([40000])
           //.
             .center([74.6, 31.5]) // set centre to further North
         //.scale([mapWidth/(2*Math.PI)]) // scale to fit group width
           .translate([465, 250]) // ensure centred in group

	        var minimumColor = "#BFD3E6", maximumColor = "#88419D";

	        var color = d3.scaleLinear()
	        .domain([2, 10])
	        .range([minimumColor, maximumColor]);

	        // var projection = d3.geoMercator().fitSize([mapWidth, mapHeight], json);
	        // //console.log(projection)
	        var path = d3.geoPath().projection(projection);
	        
	        var div = d3.select("#pakistanMap")
	        .append("div")   
	        .attr("class", "tooltip")               
	        .style("opacity", 0);

	        d3.json("lahore_towns_geojson2.json", function(err, json) {


	        	neighborhood_data = data
		        for (var i = 0; i < neighborhood_data.length; i++) {

		          // Grab Neighborhood Name
		          var dataNeighborhood = neighborhood_data[i].key;
		          console.log(dataNeighborhood)
		          // Grab neighborhood crime value 
		          var dataValue = neighborhood_data[i].value;

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
	        svg.selectAll("path")
	          .data(json.features)
	          .enter()
	          .append("path")
	          .attr("class", "map_neighborhood")
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
	          //console.log(color(i))
	          return color(i);

	          } else {
	          //If value is undefined…
	          return "rgb(213,222,217)";
	          }
	        });
	        

	        });

        });

      };
    };