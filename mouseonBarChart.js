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
        //console.log(data)

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

        xScale.range([0, innerWidth])
        .domain(data.map(function (d) { return d.key; }));
  //    yScale.domain(neighborhoodCrimeCount.map(function(d) { return d.key; })).padding(0.1);

        yScale.range([innerHeight, 0])
        .domain([0, (d3.max(data, function(d) { return d.value; }))]);

        g.select(".x.axis")
          .attr("transform", "translate(0," + (innerHeight) + ")")
          .call(d3.axisBottom(xScale));

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
          //console.log(.on("mouseover", onMouseOver))
        bars.exit().remove();
      });
    }


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
  }