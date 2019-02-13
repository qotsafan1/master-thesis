function lineGraph() {
  var svg = d3.select("#lineGraph")
              .append("svg")
              .attr("width", 800)
              .attr("height", 500);

	var margin = {top: 50, right: 80, bottom: 40, left: 50},
		width = svg.attr("width") - margin.left - margin.right,
		height = svg.attr("height") - margin.top - margin.bottom,
		g = svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")");

	var parseYear = d3.timeParse("%Y"),
	    x = d3.scaleTime().range([0, width]),
		  y = d3.scaleLinear().range([height, 0]);

  var title = svg.append("g")
  	.attr("class", "title");
  title.append("text")
  	.attr("x", (width/1.80))
  	.attr("y", 40)
  	.attr("text-anchor", "middle")
  	.style("font", "20px sans-serif")
  	.text("Growth in population and homelessness from 2005 in San Francisco");

	var line = d3.line()
		.curve(d3.curveBasis)
		.x(function(d) { return x(d.year); })
		.y(function(d) { return y(d.percentage); });

	d3.csv("population_vs_homelessness.csv", type, function(error, data) {
		if(error) throw error;

		//parse data
		var parsedData = data.columns.slice(1).map(function(id) {
			return {
				id: id,
				values: data.map(function(d) {
					return {year: d.year, percentage: d[id]};
				})
			};
		});

		x.domain(d3.extent(data, function(d) { return d.year; }));

		y.domain([
			d3.min(parsedData, function(c) { return d3.min(c.values, function (d) { return d.percentage; }); }),
			d3.max(parsedData, function(c) { return d3.max(c.values, function(d) { return d.percentage; }); })
		]);

		g.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x));

		g.append("g")
			.call(d3.axisLeft(y))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", -50)
			.attr("x", -125)
			.attr("dy", "0.9em")
			.attr("fill", "#000")
			.text("Percentage increase");

    g.append("text")
			.attr("y", height+35)
			.attr("x", width/2)
			.attr("fill", "#000")
      .style("font-size", "12px")
			.text("Year");

		var graph = g.selectAll(".graph")
			.data(parsedData)
			.enter()
			.append("g")
			.attr("class", "graph");

		graph.append("path")
			.attr("class", "line")
			.attr("d", function(d) {
         return line(d.values);
       })
      .attr("stroke", "steelblue");

		graph.append("text")
			.datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
			.attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.percentage) + ")"; })
			.attr("x", 3)
			.attr("dy", "0.35em")
			.style("font", "11px sans-serif")
			.text(function(d) { return d.id; });

	});

	//bind with multiseries data
	function type(d, _, columns) {
		d.year = parseYear(d.year);
		//iterate through each column
		for(var i = 1, n = columns.length, c; i < n; ++i)
			//bind column data to year
			d[c = columns[i]] = +d[c];
			return d;
	}
}
