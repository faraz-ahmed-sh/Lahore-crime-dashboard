/* global d3 */

function timeSeriesChart2() {

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 400,
    height = 400,
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom,
    xValue = function(d) { return d.key; },
    yValue = function(d) { return d.value; },
    domainx,
    xScale,
    yScale = d3.scaleLinear(),
    onBrushed = function () {};

  function chart(selection) {
    selection.each(function (data) {

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var svgEnter = svg.enter().append("svg");
      var gEnter = svgEnter.append("g");
      gEnter.append("g").attr("class", "x axis");
      gEnter.append("g").attr("class", "y axis");

      var brush = d3.brushX()
        .extent([[0, 0], [width-30, height-40]])
        .on("start brush end", brushed);

      innerWidth = width - margin.left - margin.right
      innerHeight = height - margin.top - margin.bottom

      // Update the outer dimensions.
      svg.merge(svgEnter).attr("width", width)
        .attr("height", height);

      // Update the inner dimensions.
      var g = svg.merge(svgEnter).select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      xScale.rangeRound([0, innerWidth])
        .domain(domainx);

      yScale.rangeRound([innerHeight, 0])
        .domain([0, d3.max(data, yValue)]);

      g.select(".x.axis")
          .attr("transform", "translate(0," + innerHeight + ")")
          .call(d3.axisBottom(xScale));

      g.select(".y.axis")
          .call(d3.axisLeft(yScale).ticks(10))
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .text("Frequency");

      var bars = g.selectAll(".bar")
        .data(function (d) { return d; });

      bars.enter().append("rect")
          .attr("class", "bar")
        .merge(bars)
          .attr("x", X)
          .attr("y", Y)
          .attr("width", (width-(width/data.length)) / (data.length+8))
          .attr("height", function(d) { return innerHeight - Y(d); });

      bars.exit().remove();


      var gBrush = gEnter.append("g")
          .attr("class", "brush")
          .call(brush);

        // style brush resize handle
        // https://github.com/crossfilter/crossfilter/blob/gh-pages/index.html#L466
        var brushResizePath = function(d) {
            var e = +(d.type == "e"),
                x = e ? 1 : -1,
                y = height / 2;
            return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
        }

        var handle = gBrush.selectAll(".handle--custom")
          .data([{type: "w"}, {type: "e"}])
          .enter().append("path")
            .attr("class", "handle--custom")
            .attr("stroke", "#000")
            .attr("cursor", "ew-resize")
            .attr("d", brushResizePath);

        gBrush.call(brush.move, [0, 0].map(xScale));

        function brushed() {

          var s = d3.event.selection;
              if (s == null) {
                handle.attr("display", "none");
                bars.classed("active", false);
                //onBrushed(s);
              } else {
                //onBrushed(s);
                var sx = s.map(xScale.invert);
                bars.classed("active", function(d) { return sx[0] <= d && d <= sx[1]; });
                handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + [ s[i], - height / 4] + ")"; });
                onBrushed(sx);
              }
              //onBrushed(s);
            }
    });

  }

// The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(xValue(d));
  }

  // The y-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(yValue(d));
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

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

    chart.scalex = function(_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return chart;
  };

    chart.domainx = function(_) {
    if (!arguments.length) return domainx;
    domainx = _;
    return chart;
  };



  chart.onBrushed = function(_) {
    if (!arguments.length) return onBrushed;
    onBrushed = _;
    return chart;
  };


  return chart;
}



