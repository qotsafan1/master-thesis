function TimeBarChart(data, elementId, chartWidth, chartHeight, margin, title, xScaleData, meanLine, styles) {
    this.data = data;
    this.elementId = elementId;
    this.chartWidth = chartWidth;
    this.chartHeight = chartHeight;
    this.margin = margin;
    this.title = title;
    this.xScaleData = xScaleData;
    this.styles = styles;
    this.xScaleType = 'linear';
    this.meanLine = meanLine;
}

TimeBarChart.prototype = Object.create(new CustomBarChart());

TimeBarChart.prototype.create = function(xLabel,yLabel, yTicks) {
    this.yLabel = yLabel;
    this.yTicks = yTicks;
    this.createFrame(this.elementId, this.chartWidth, this.chartHeight)    
    this.x = this.xScale(this.width, this.xScaleData);
    this.y = this.yScale();

    this.xAxis = this.xAxisBottom(this.x, this.xScaleData[1]);
    this.yAxis = this.yAxisLeft(this.y, yTicks);
    this.barWidth = (this.width-this.margin.right)/this.xScaleData[1];

    this.createXAxis(xLabel);
    this.createYAxis(yLabel);
    this.createBars();
    this.createTitle();
    this.createMeanLine();
}