function ComparisonChart(elementId, chartWidth, chartHeight, margin, title, styles) {
    this.elementId = elementId;
    this.chartWidth = chartWidth;
    this.chartHeight = chartHeight;
    this.margin = margin;
    this.title = title;
    this.styles = styles;
}

//ComparisonChart.prototype = Object.create(new CustomBarChart());

ComparisonChart.prototype.compare = function(first, second, firstLabel, secondLabel) {
    this.svg = d3.select("#" + this.elementId)
        .append("svg")
        .attr("width", this.chartWidth)
        .attr("height", this.chartHeight);
    this.width = this.chartWidth - this.margin.left - this.margin.right,
    this.height = this.chartHeight - this.margin.top - this.margin.bottom,
    this.g = this.svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    this.y = d3.scaleLinear().range([this.height, 0]).domain([2,0]);
    this.g.append("g").call(d3.axisLeft(d3.scaleLinear().range([this.height, 0])).ticks(0));

    this.x = d3.scaleLinear().range([0, this.width]).domain([0, (first+second)]);

    var colors = ["#0191C8", "#74C2E1"]
    var thisObj = this;
    this.bars = this.g.selectAll(".bar")
        .data([first,second])
        .enter()
        .append("rect")
            .attr("class", "bar")
            .style("fill", function(d,i) {
                return colors[i];
            })
            .attr("x", 0)
            .attr("y", function(d,i) {
                return thisObj.y(i+0.1);
            })
            .attr("height", 15)
            .attr("width", function(d) { return (thisObj.width - thisObj.x(d)); });
    var labels = [secondLabel, firstLabel];
    var comparableData = [second, first];
    this.bars
        .select(function(d,i) { return this.parentNode; })
        .append("text")
            .style("font-size", "10px")
            .attr("class", "bar-labels")
            .attr("x", thisObj.x(0)+2)
            .attr("y", function(d,i) {
                return thisObj.y(i+0.7);
            })            
            .text(function(d,i) {
                return labels[i] + "  "  + (comparableData[i].toFixed(2));
            });

    
    this.g        
        .append("text")
            .style("font", "sans-serif")
            .style("font-size", this.styles.titleFontSize)
            .attr("dy", -5)
            .attr("class","title")
            .text(this.title);
            
}

ComparisonChart.prototype.update = function(first, second, firstLabel, secondLabel) {
    var labels = [secondLabel, firstLabel];
    var comparableData = [second, first];
    var thisObj = this;
    this.x = d3.scaleLinear().range([0, this.width]).domain([0, (first+second)]);
    this.bars
        .data([first, second])        
        .attr("width", function(d) { return (thisObj.width - thisObj.x(d)); });
    this.g.selectAll(".bar-labels")
        .text(function(d, i) {
            return labels[i] + "  "  + (comparableData[i].toFixed(2));;
        })
}

ComparisonChart.prototype.updateTitle = function(newTitle) {
    this.title = newTitle;
    this.g.selectAll(".title").text(newTitle);
}
