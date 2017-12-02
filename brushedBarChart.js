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
          .call(d3.axisBottom(xScale));

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
        
        //bars.exit().remove();

        g.select(".brush").call(d3.brushX()
          .extent([[0,0], [innerWidth, innerHeight]])
          .on("brush", brushed));

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



    // chart.dimension = function (_) {
    //   if (!arguments.length) return dimension;
    //   dimension = _;
    //   return chart;
    // };

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

    // chart.group = function (_) {
    //   if (!arguments.length) return group;
    //   group = _;
    //   return chart;
    // };

    chart.onBrushed = function (_) {
      if (!arguments.length) return onBrushed;
      onBrushed = _;
      return chart;
    };

    //chart.gBrush = () => gBrush;

    return chart;
  
  }