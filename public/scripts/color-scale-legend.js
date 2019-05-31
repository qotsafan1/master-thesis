function ColorScaleLegend(colorScale, title) {
    this.colorScale = colorScale;

    var sequentialScale = d3.scaleSequential(d3.interpolateYlOrRd).domain(colorScale.domain());
    
    var col = d3.select("#colorScales").append("div").attr("class", "col");
    var svgNew = col
        .append("svg")
        .attr("width", "450px")
        .attr("height", "80px");
    svgNew.append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(20,20)")
        .style("font-size", "12px")
        .style("font-weight", function() {
            return "bold";
        });
    
    var legendSequential = d3.legendColor()
        .shapeWidth(43)
        .cells(9)
        .orient("horizontal")
        .title(title)
        .labelFormat(d3.format(".1f"))

        .scale(sequentialScale) 
    
    svgNew.select(".legendSequential")
        .call(legendSequential);

    svgNew.selectAll('.label')
        .text(function(d,i) {
            if (i === 0 || i === 8) {
                return parseInt(d);
            }

            if (i===4) {
                return "observations";
            }
            return "";
        });    
}

