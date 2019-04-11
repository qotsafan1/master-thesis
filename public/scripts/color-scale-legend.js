function ColorScaleLegend(colorScale, title) {
    this.colorScale = colorScale;

    var sequentialScale = d3.scaleSequential(d3.interpolateYlOrRd).domain(colorScale.domain());
    
    var col = d3.select("#colorScales").append("div").attr("class", "col");
    var svgNew = col
        .append("svg")
        .attr("width", "400px")
        .attr("height", "80px");
    svgNew.append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(20,20)")
        .style("font-size", "12px");
    
    var legendSequential = d3.legendColor()
        .shapeWidth(35)
        .cells(10)
        .orient("horizontal")
        .title(title)
        .labelFormat(d3.format(".1f"))

        .scale(sequentialScale) 
    
    svgNew.select(".legendSequential")
        .call(legendSequential);
}

