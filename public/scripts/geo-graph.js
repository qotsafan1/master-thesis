function geoGraph() {
  var svg = d3.select("#geoGraph")
              .append("svg")
              .attr("width", 580)
              .attr("height", 450);
  var margin = {top: 40, right: 80, bottom: 40, left: 50},
  	width = svg.attr("width") - margin.left - margin.right,
  	height = svg.attr("height") - margin.top - margin.bottom,
  	g = svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")"),
    x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

    svg.on('click', handleClick);

  //Define map projection
  var projection = d3.geoMercator()
               .translate([width, height/2])
               .scale(170000)
               .center([-122.381, 37.770]);

  var path = d3.geoPath().projection(projection);

  var xScale = d3.scaleBand()
            .domain(d3.range(24))
            .rangeRound([0, width/2])
            .padding(0.1);
  var yScale;

  d3.csv("income.csv", function(incomeData) {
    for (var i in incomeData) {
      if (!("year" in incomeData[i])) {
        continue;
      }

      var year = incomeData[i]["year"];
      if (!(year in income)) {
        income[year] = [];
      }

      var geo = incomeData[i]["geo"].substring('14000US'.length);
      income[year][geo] = incomeData[i]["income"];
    }
  });
  //Load in GeoJSON data
  d3.json("geo_data.json", function(json) {
    //Bind data and create one path per GeoJSON feature
    geoJson = json;
    geo = svg.selectAll("path")
       .data(json.features)
       .enter()
       .append("path")
       .attr("class", "geo")
       .attr("data-geo", function(d) {
         return d.properties.GEOID;
       })
       .style("stroke", "black")
       .style("stroke-width", "0.5px")
       .attr("d", path);

    circles = svg.selectAll("circle")
     .data(circleData)
     .enter()
     .append("circle")
     .attr("cx", function(d) {
       return projection([d.Longitude, d.Latitude])[0];
     })
     .attr("cy", function(d) {
       return projection([d.Longitude, d.Latitude])[1];
     })
     .attr("r", 2.5)
     .attr("class", "brushed")
     .attr("data-time", function(d) {
       return d.Opened;
     });

     svg.append ("text")
       .attr("x", 80)
       .attr("y", height+margin.top+25)
       .style("font-size", "14px")
       .text("Click on a district to get more specific comparison between years below")

     svg.append ("text")
       .attr("x", 140)
       .attr("y", height+margin.top+margin.bottom-5)
       .style("font-size", "8px")
       .text("(It's recommended to have a small sample chosen above for better perfomance)")

     chosenDistrict = d3.select('path[data-geo="' + "06075010100" +'"]')
                        .style("stroke", "green")
                        .style("stroke-width", "5px");

     gBrush.call(brush.move, [0, 200]);
  });
}

function handleClick() {
  var pos = d3.mouse(this);
  var projection = d3.geoMercator()
               .translate([450, 370/2])
               .scale(170000)
               .center([-122.381, 37.770]);
  geoJson.features.forEach(function(d) {
    if (d3.geoContains(d, projection.invert(pos))) {
      if (d.properties.GEOID.toString() in districtData) {
        chosenDistrict.style("stroke", "black")
                      .style("stroke-width", "0px");
        chosenDistrict = d3.select('path[data-geo="' + d.properties.GEOID.toString() +'"]')
          .style("stroke", "green")
          .style("stroke-width", "5px");
        svgStacked.selectAll('.stacked-removeable').remove();
        updateStackedArea(districtData[d.properties.GEOID.toString()]);
      }
    }
  })
}
