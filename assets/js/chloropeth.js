//set svg parameters
const selectMenu = document.getElementById('chrolopeth_years_options');
// Generate options from 2000 to 2015
for (let year = 2000; year <= 2015; year++) {
  // Create a new option element
  const option = document.createElement('option');
  // Set the text and value to the current year
  option.text = year;
  option.value = year;

  if (year === 2015) {
    option.selected = true;
  }

  // Add the option to the select menu
  selectMenu.appendChild(option);
}

function loadChrolopethMap() {
  // Get the selected value
  const selectedValue = selectMenu.value;
  // Display the selected value
  drawChrolopethMap(selectedValue);
}

function drawChrolopethMap(year) {
  const width = 800,
    height = 500;

  d3v7.select("#chrolopeth_container").select("svg").remove();

  const svg = d3v7.select("#chrolopeth_container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0  800 500")
    .attr("data-aos", "fade-up")
    .attr("data-aos-delay", "100")
    .attr("preserveAspectRatio", "xMinYMin");

  // set map scale, location on screen and its projection
  const projection = d3v7.geoRobinson()
    .scale(150)
    .center([0, 0])
    .translate([width / 2.2, height / 2]);

  // path generator
  const path = d3v7.geoPath()
    .projection(projection);

  // set color scale
  const color = d3v7.scaleThreshold()
    //   .domain([50, 60, 70, 80, 90, 100])
    //   .range(["#DCE9FF", "#8EBEFF", "#589BE5", "#0072BC"])
    //   .unknown("#E6E6E6");
    .domain([40, 50, 60, 70, 80])
    .range(["#DCE9FF", "#B0D1FF", "#8EBEFF", "#589BE5", "#0072BC", "#005BB5"])
    .unknown("#E6E6E6");


  //declare polygon and polyline
  const poly = svg.append("g");
  const line = svg.append("g");

  // declare URL
  const dataURL = '../data/cleaned_life_data.csv';
  const polygonsURL = "https://raw.githubusercontent.com/GDS-ODSSS/unhcr-dataviz-platform/master/data/geospatial/world_polygons_simplified.json";
  const polylinesURL = "https://raw.githubusercontent.com/GDS-ODSSS/unhcr-dataviz-platform/master/data/geospatial/world_lines_simplified.json";

  // load data
  const promises = [
    d3v7.json(polygonsURL),
    d3v7.csv(dataURL)
  ];

  Promise.all(promises).then(result => ready(result, year));
  function ready([topology, lifeExpectancyData],year) {

    const filteredData = lifeExpectancyData.filter(d => d.Year === year);
    // prepare pop data to join shapefile
    const data = {};
    filteredData.forEach(function (d) {
      data[d.Country] = +d["Life expectancy "]
    });

    // set mouse events
    const mouseover = function (d) {
      d3v7.selectAll(".countries")
        .transition()
        .duration(100)
        .style("opacity", .3)
      d3v7.select(this)
        .transition()
        .duration(100)
        .style("opacity", 1)
    };
    const mouseleave = function (d) {
      d3v7.selectAll(".countries")
        .transition()
        .duration(100)
        .style("opacity", 1)
      d3v7.select(this)
        .transition()
        .duration(100)
        .style("opacity", 1)
    };


    svg.append("g")
      .selectAll("path")
      .data(topojson.feature(topology, topology.objects.world_polygons_simplified).features)
      .join("path")
      .attr("fill", function (d) {
        return color(data[d.properties.gis_name]);
      })
      .attr("d", path)
      .attr("class", "countries")
      .on("mouseover", mouseover)
      .on("mouseleave", mouseleave)
      .append("title")
      .text(function (d) {
        const value = data[d.properties.gis_name] || "No data";
        return `${d.properties.gis_name} \nLife Expectancy: ${value}`;
      });
  }
  //load and draw lines
  d3v7.json(polylinesURL).then(function (topology) {
    line
      .selectAll("path")
      .data(topojson.feature(topology, topology.objects.world_lines_simplified).features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", "none")
      .attr("class", function (d) { return d.properties.type; })
  });

  //zoom function
  const zoomFunction = d3v7.zoom()
    .scaleExtent([1, 8])
    .on('zoom', function (event) {
      svg.selectAll('path')
        .attr('transform', event.transform);
    });

  svg.call(zoomFunction);

  // set legend
  svg.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(5,255)");

  const legend = d3v7.legendColor()
    .labelFormat(d3v7.format(",.0f"))
    .labels(d3v7.legendHelpers.thresholdLabels)
    .labelOffset(3)
    .shapePadding(0)
    .scale(color);

  svg.select(".legendThreshold")
    .call(legend);

}
loadChrolopethMap();