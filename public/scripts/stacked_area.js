var svgStacked = d3.select("#stackedArea")
        .append("svg")
        .attr("width", 800)
        .attr("height", 300);

function StackedArea() {
  this.margin = {top: 40, right: 80, bottom: 40, left: 50};
  this.width = svgStacked.attr("width") - this.margin.left - this.margin.right;
  this.height = svgStacked.attr("height") - this.margin.top - this.margin.bottom;

  this.parseDate = d3.timeParse('%b');

  this.x = d3.scaleTime()
      .range([0, this.width]);

  this.y = d3.scaleLinear()
      .range([this.height, 0]);

  this.color = d3.scaleOrdinal(d3.schemeCategory20);

  this.xAxis = d3.axisBottom()
      .scale(this.x);

  this.area = d3.area()
      .x(function(d) {
        return stackedArea.x(d.data.date); })
      .y0(function(d) { return stackedArea.y(d[0]); })
      .y1(function(d) { return stackedArea.y(d[1]); });


  this.stack = d3.stack();

  this.g = svgStacked.append("g")
                     .attr("transform", "translate(" + this.margin.left + "," +this.margin.top + ")")
                     .attr("class", "stackedG");
}

var stackedArea = new StackedArea();

function updateStackedArea(data) {
  stackedArea.color.domain(d3.keys(data[0]).filter(function(key) { return key !== 'date'; }));
  var keys = d3.keys(data[0]).filter(function(key) { return key !== 'date'; });

  var maxDateVal = d3.max(data, function(d){
    var vals = d3.keys(d).map(function(key){ return key !== 'date' ? d[key] : 0 });
    return d3.sum(vals);
  });

  // Set domains for axes
  stackedArea.x.domain(d3.extent(data, function(d) { return d.date; }));
  stackedArea.y.domain([0, maxDateVal])

  stackedArea.stack.keys(keys);

  stackedArea.stack.order(d3.stackOrderNone);
  stackedArea.stack.offset(d3.stackOffsetNone);

  var browser = stackedArea.g.selectAll('.browser')
      .data(stackedArea.stack(data))
    .enter().append('g')
      .attr('class', 'stacked-removeable')

  browser.append('path')
      .attr('class', 'area')
      .attr('d', stackedArea.area)
      .attr('class', 'stacked-removeable')
      .style('fill', function(d) { return stackedArea.color(d.key); });

  browser.append('text')
      .datum(function(d) { return d; })
      .attr('x', stackedArea.width)
      .attr('y', function(d, i) {
        return 120 - i*30;
      })
      .attr('dy', '.35em')
      .attr('class', 'stacked-removeable')
      .style("text-anchor", "start")
      .text(function(d) {return d.key;})
      .style('fill', function(d) { return stackedArea.color(d.key); })

  stackedArea.g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + stackedArea.height + ')')
      .attr('class', 'stacked-removeable')
      .call(stackedArea.xAxis);

  stackedArea.g.append('g')
      .attr('class', 'stacked-removeable')
      .call(d3.axisLeft(stackedArea.y));

  stackedArea.g.append("text")
    .attr("x", -185)
    .attr("y", -30)
    .attr('class', 'stacked-removeable')
    .attr("transform", "rotate(-90)")
    .style("font-size", "10px")
    .text("311 homelessness concerns calls")

    stackedArea.g.append("text")
      .attr("y", stackedArea.height+35)
      .attr("x", stackedArea.width/2)
      .attr("fill", "#000")
      .attr('class', 'stacked-removeable')
      .style("font-size", "12px")
      .text("Month");

  svgStacked.append("text")
    .attr("x", 80)
    .attr("y", 30)
    .attr('class', 'stacked-removeable')
    .style("font-size", "18px")
    .text("Comparison between 2013-2015 on 311 calls each month in chosen district")
}
