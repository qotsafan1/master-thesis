function xScale(type, width, data) {
  //console.log(type)
  //console.log(width)
  //console.log(data)
  var x;
  switch (type) {
    case 'time':
      x = d3.scaleTime().range([0, width]);
      x.domain(data);//[lowest,highest]
      break;
    case 'linear':
      x = d3.scaleLinear().range([0, width]);
      x.domain(data);
      break;
    default:
      x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
      x.domain(data.map(function(d) { return d.type; }));
      break;
  }
  return x;
}

function yScale(type, height, data) {
  var y;
  y = d3.scaleLinear().rangeRound([height, 0]);
  y.domain([0, d3.max(data, function(d) { return d.sum; })]);
  return y;
}

function xAxisBottom(x, ticks, tickFormat) {
  var xAxis = d3.axisBottom(x);
  if (ticks > -1) {
    xAxis.ticks(ticks);
  }
  if (tickFormat === 'time') {
    xAxis.tickFormat(d3.timeFormat("%m/%Y"));
  }
  return xAxis;
}

function yAxisLeft(y) {
  var yAxis = d3.axisLeft(y);
  return yAxis;
}

function xBarData(x, data, type) {
  var result;
  if (type === 'time') {
    var parseDate = d3.timeParse("%m/%d/%Y");
    result = x(parseDate((data.date.getMonth()+1) +"/"+data.date.getDate()+"/"+data.date.getFullYear()))
  } else {
    result = x(data.type);
  }
  if (type === 'linear') {
    result+=2;
  }
  return result;
}

function barWidth(type,x) {
  var bWidth;
  switch (type) {
    case 'time':
      bWidth = x;
      break;
    case 'linear':
      bWidth = x;
      break;
    default:
      bWidth = x.bandwidth();
      break;
  }
  return bWidth;
}
