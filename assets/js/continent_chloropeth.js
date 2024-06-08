const continentSelectMenu = document.getElementById('continent_years_options');
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
  continentSelectMenu.appendChild(option);
}

function loadChrolopethMapContinentWise() {
  // Get the selected value
  const selectedValue = continentSelectMenu.value;
  // Display the selected value
  drawChrolopethMapContinentWise(selectedValue);
}

function drawChrolopethMapContinentWise(year) {
  continents = ['Asia', 'Europe', 'Africa', 'South America', 'North America', 'Oceania' ];
  continents.forEach((continent)=>{
    d3v7.csv('data/cleaned_life_data_continents.csv').then(function(data) {
      var filteredData = data.filter(d => d.Year === year && d.continent === continent);
      makeMap(filteredData, continent.toLowerCase().replace(' ','-'))
    })
    }
  )
}
function makeMap(data, continent)
{
  const width= 100
  const height = 100
  // Create SVG element
  d3v7.select(`#map-${continent}`).select("svg").remove();
  const svg = d3v7.select(`#map-${continent}`)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", "0 0  200 200")
            .attr("data-aos", "fade-up")
            .attr("data-aos-delay", "100")
            .attr("preserveAspectRatio", "xMinYMin");

  // Define a projection
  const continentCenters = {
    'asia': [50, 50],
    'europe': [-10, 70],
    'africa': [-10, 30],
    'north-america': [-150, 80],
    'south-america': [-80, 20],
    'oceania': [100, 10]
};
const continentScales = {
  'north-america': 60,
};

  const center = continentCenters[continent];
  const scale = continentScales[continent] ?? 80;
  const projection = d3v7.geoMercator()
      .center(center)  
      .scale(scale)
      .translate([width / 2, height / 2]);

  const path = d3v7.geoPath().projection(projection);
    const colorScale =  d3v7.scaleThreshold()
    .domain([40, 50, 60, 70, 80])
    .range(["#DCE9FF", "#B0D1FF", "#8EBEFF", "#589BE5", "#0072BC", "#005BB5"])
    .unknown("#E6E6E6");

    d3v7.json("data/"+continent+".geojson").then(geoData => {
        // Merge the data with the GeoJSON
        const countries = geoData.features;
        countries.forEach(country => {
            const dataCountry = data.find(d => d.Country === country.properties.name);
            country.properties.value = dataCountry ? +dataCountry['Life expectancy '] : 0;
        });

        // Draw the map
        svg.selectAll(".country")
            .data(countries)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", d => colorScale(d.properties.value));

        // Tooltip
        const tooltip = d3v7.select(`#tooltip-${continent}`);

        svg.selectAll(".country")
        .append("title")
        .text(function (d) {
          return `${d.properties.name} \nLife Expectancy: ${d.properties.value}`;
        });
        const continentWithContinent = {
          'asia': 'Asia',
          'europe':  'Europe', 
          'africa': 'Africa', 
          'north-america': 'North America', 
          'south-america': 'South America', 
          'oceania': 'Oceania'
      };
        svg.append("text")
            .attr("x", width)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight","bold")
            .text(`${continentWithContinent[continent]}`);
    });

}

loadChrolopethMapContinentWise();