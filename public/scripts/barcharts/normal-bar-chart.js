function NormalBarChart(data, elementId, chartWidth, chartHeight, margin, title, xScaleData, meanLine, styles) {
    this.data = data;
    this.elementId = elementId;
    this.chartWidth = chartWidth;
    this.chartHeight = chartHeight;
    this.margin = margin;
    this.title = title;
    this.xScaleData = xScaleData;
    this.styles = styles;
    this.xScaleType = 'default';
    this.meanLine = meanLine;
}

NormalBarChart.prototype = Object.create(new CustomBarChart());

NormalBarChart.prototype.create = function(xLabel,yLabel, yTicks) {
    this.yLabel = yLabel;
    this.yTicks = yTicks;
    this.createFrame(this.elementId, this.chartWidth, this.chartHeight)    
    this.x = this.xScale(this.width, this.xScaleData);
    this.y = this.yScale();

    this.xAxis = this.xAxisBottom(this.x, this.xScaleData[1]);
    this.yAxis = this.yAxisLeft(this.y, yTicks);
    this.barWidth  = this.x;

    this.createXAxis(xLabel);
    this.createYAxis(yLabel);
    this.createBars();
    this.createTitle();
    this.createMeanLine();
}

NormalBarChart.prototype.addClickEventToUpdateDateChart = function(dateChart, type) {
    var xAxis = this.svg.select('.x-axis');
    xAxis
        .selectAll('.tick')        
        .on('click', function(d,i) {
            dateChart.updateToSpecificTime(type, d);
        })
        .style("cursor", "pointer");

}

NormalBarChart.prototype.createCustomBrush = function() {
    var thisObj = this;    
    var brush = d3.brushX()
        .extent([[0, 0], [this.width, this.height]])
        .on("brush", brushed) //Make sure don't pass surrounding brushes
		.on("end", brushend);

        var newG = this.g.append("g")
            .attr("class", "brush")
        newG.call(brush);        

    function brushend() {
        if (!d3.event.selection) return; // Ignore empty selections.
        if (!thisObj.leftBrushG) return;
        if (!thisObj.rightBrushG) return;
        var leftPos = d3.brushSelection(thisObj.leftBrushG.node());
        var rightPos = d3.brushSelection(thisObj.rightBrushG.node());

        var leftWeeks = [];
        var rightWeeks = [];
        var rects = thisObj.g.selectAll(".bar");
        rects.each(function(rect, i) {
            var element = d3.select(this);
            if (leftPos[0] <= parseInt(element.attr("x"))
                && leftPos[1] >= (parseInt(element.attr("x"))+parseInt(element.attr("width")))) {
                    leftWeeks.push(rect.type);
            }

            if (rightPos[0] <= parseInt(element.attr("x"))
                && rightPos[1] >= (parseInt(element.attr("x"))+parseInt(element.attr("width")))) {
                    rightWeeks.push(rect.type);
            }
        
            if (element.size()-1 === i) {
                /*
                console.log("INN")
                thisObj.rightBrushG.call(thisObj.rightBrush.move,[parseInt(element.attr("x")),
                (parseInt(element.attr("x"))+thisObj.getBarWidth())]);
                */
               //d3.select(this).transition().call(d3.event.target.move, [10, 50]);
            }
        });
        
        createWeekComparison(leftWeeks, rightWeeks);
    }

    function brushed() {        
        if (!d3.event.selection) return; // Ignore empty selections.
        if (!thisObj.leftBrushG) return;
        if (!thisObj.rightBrushG) return;

        var leftPos = d3.brushSelection(thisObj.leftBrushG.node());
        var rightPos = d3.brushSelection(thisObj.rightBrushG.node());
        thisObj.leftBrushG.call(thisObj.leftBrush.extent([[0,0],[rightPos[0],0]]));
        thisObj.rightBrushG.call(thisObj.rightBrush.extent([[leftPos[1],0],[thisObj.width,0]]));

        if (leftPos[1] - leftPos[0] < thisObj.getBarWidth()) {
            d3.event.sourceEvent.stopPropagation();
            thisObj.leftBrushG.selectAll("rect.selection") 
                        .attr("width", thisObj.getBarWidth())
        }

        if (rightPos[1] - rightPos[0] < thisObj.getBarWidth()) {
            //d3.event.sourceEvent.stopPropagation();
            thisObj.rightBrushG.selectAll("rect.selection") 
                        .attr("width", thisObj.getBarWidth())
        }
    }

    return [newG, brush];
}

NormalBarChart.prototype.setBrushPosition = function(currentG, chosenBrush, pos) {
    thisObj = this;
    currentG.selectAll('.overlay').remove();
    var rects = thisObj.g.selectAll(".bar");
    rects.each(function(rect, i) {
        if (rects.size() > 3) {
            if (rects.size()-pos === i) {
                var element = d3.select(this);
                currentG.call(chosenBrush.move,
                    [parseInt(element.attr("x")),
                    (parseInt(element.attr("x"))+thisObj.getBarWidth())]
                );
            }
        }
    });
}
