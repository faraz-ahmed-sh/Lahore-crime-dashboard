/* global d3 */
function timeSeriesChart() {
  var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 760,
    height = 320,
    xValue = function(d) { return d[0]; },
    yValue = function(d) { return d[1]; },
    xScale,
    yScale = d3.scaleLinear(),
    domainx,
    // area = d3.area().x(X).y1(Y),
    // line = d3.line().x(X).y(Y),
    onBrushed = function () {};

  function chart(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      // data = data.map(function(d, i) {
      //   return [xValue.call(data, d, i), yValue.call(data, d, i)];
      // });

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var svgEnter = svg.enter().append("svg");
      var gEnter = svgEnter.append("g");
      gEnter.append("g").attr("class", "x axis");
      gEnter.append("g").attr("class", "y axis");
      gEnter.append("g").attr("class", "brush")

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


      g.select(".brush").call(d3.brushX()
        .extent([
          [0,0],
          [width, height]
        ])
        .on("brush", brushed)
      );
    });
  }

  function brushed() {
    if (!d3.event.sourceEvent) return; // Only transition after input.
    if (!d3.event.selection) return; // Ignore empty selections.
    var selection = d3.event.selection.map(xScale.invert);

    onBrushed(selection);
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

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.onBrushed = function(_) {
    if (!arguments.length) return onBrushed;
    onBrushed = _;
    return chart;
  };

  return chart;
}