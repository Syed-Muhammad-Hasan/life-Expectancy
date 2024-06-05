// JavaScript to draw radial chart
const radialChartSelectMenu = document.getElementById('radialChart_years_options');

// Generate options from 2000 to 2015
for (let year = 2000; year <= 2015; year++) {
    const option = document.createElement('option');
    option.text = year;
    option.value = year;
    if (year === 2015) {
        option.selected = true;
    }
    radialChartSelectMenu.appendChild(option);
}

function loadRadialPlot() {
    // Get the selected value
    const selectedValue = radialChartSelectMenu.value;

    d3v4.selectAll("#radialChart_container svg > *").remove();
    d3v4.selectAll("#radialDeveloping .chart-container svg > *").remove();
    
    // Display the selected value
    radialDeveloped(selectedValue);
    radialDeveloping(selectedValue);
}

function radialDeveloped(year){
    var svg = d3v4.select("#radialChart_container svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    innerRadius = 180,
    outerRadius = Math.min(width, height) / 2,
    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var x = d3v4.scaleBand()
        .range([0, 2 * Math.PI])
        .align(0);

    var y = d3v4.scaleRadial()
        .range([innerRadius, outerRadius]);

    var z = d3v4.scaleOrdinal()
        .range(d3v4.schemeCategory10);

    d3v4.csv("data/"+year+".csv", function(d, i, columns) {
    // Modify the parsing function to select desired columns
    
    if (d.Status === "Developed") {
    
        d.Country = d.Country;
        d.LifeExpectancy = +d["Life expectancy "];
        d.HepatitisB = +d["Hepatitis B"];
        d.Diphtheria = +d["Diphtheria "];
        d.AdultMortality = +d["Adult Mortality"];
        d.UnderFiveDeaths = +d["under-five deaths "];
        d.Thinness59Years = +d[" thinness 5-9 years"];
        d.Alcohol = +d["Alcohol"];
        
        // console.log(d.Country, d.LifeExpectancy, d.HepatitisB, d.Diphtheria, d.AdultMortality, d.UnderFiveDeaths, d.Thinness59Years, d.Alcohol)
        d.total = d3v4.sum([d.LifeExpectancy, d.HepatitisB, d.Diphtheria, d.AdultMortality, d.UnderFiveDeaths, d.Thinness59Years, d.Alcohol]);

        return d;
        
    } else {
        return null; // Skip this data point if it's not "Developed"
    }
    }, function(error, data) {
    if (error) throw error;

    data = data.filter(function(d) {
        return d !== null;
    });

    data.sort(function(a, b) {
        return b.total - a.total; // Sort descending by total
    });
    data = data.slice(0, 15);

    // console.log(data)

    x.domain(data.map(function(d) { return d.Country; }));
    y.domain([0, d3v4.max(data, function(d) { return d.total; })]);
    z.domain(["LifeExpectancy", "HepatitisB", "Diphtheria", "AdultMortality", "UnderFiveDeaths", "Thinness59Years", "Alcohol"]);

    g.append("g")
        .selectAll("g")
        .data(d3v4.stack().keys(z.domain())(data))
        .enter().append("g")
        .attr("fill", function(d) { return z(d.key); })
        .selectAll("path")
        .data(function(d) { return d; })
        .enter().append("path")
        .attr("d", d3v4.arc()
            .innerRadius(function(d) { return y(d[0]); })
            .outerRadius(function(d) { return y(d[1]); })
            .startAngle(function(d) { return x(d.data.Country); })
            .endAngle(function(d) { return x(d.data.Country) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius));

    var label = g.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) { return "rotate(" + ((x(d.Country) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)"; });

    label.append("line")
        .attr("x2", -5)
        .attr("stroke", "#000");

    label.append("text")
        .attr("transform", function(d) { return (x(d.Country) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
        .text(function(d) { return d.Country; });

    var yAxis = g.append("g")
        .attr("text-anchor", "middle");

    var yTick = yAxis
        .selectAll("g")
        .data(y.ticks(5).slice(1))
        .enter().append("g");

    yTick.append("circle")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("r", y);

    yTick.append("text")
        .attr("y", function(d) { return -y(d); })
        .attr("dy", "0.35em")
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-width", 5)
        .text(y.tickFormat(5, "s"));

    yTick.append("text")
        .attr("y", function(d) { return -y(d); })
        .attr("dy", "0.35em")
        .text(y.tickFormat(5, "s"));

    yAxis.append("text")
        .attr("y", function(d) { return -y(y.ticks(5).pop()); })
        .attr("dy", "-1em")
        .text("Population");

    var legend = g.append("g")
        .selectAll("g")
        .data(z.domain().reverse())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(-40," + (i - (z.domain().length - 1) / 2) * 20 + ")"; });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", z);

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(function(d) { return d; });
    });
}


//FOR DEVELOPING
function radialDeveloping(year){
    
    // JavaScript to draw radial chart for developing countries
    var svgDeveloping = d3v4.select("#radialDeveloping .chart-container svg"),
    widthDeveloping = +svgDeveloping.attr("width"),
    heightDeveloping = +svgDeveloping.attr("height"),
    innerRadiusDeveloping = 180,
    outerRadiusDeveloping = Math.min(widthDeveloping, heightDeveloping) / 2,
    gDeveloping = svgDeveloping.append("g").attr("transform", "translate(" + widthDeveloping / 2 + "," + heightDeveloping / 2 + ")");

    var xDeveloping = d3v4.scaleBand()
    .range([0, 2 * Math.PI])
    .align(0);

    var yDeveloping = d3v4.scaleRadial()
    .range([innerRadiusDeveloping, outerRadiusDeveloping]);

    var zDeveloping = d3v4.scaleOrdinal()
    .range(d3v4.schemeCategory10);

    d3v4.csv("data/"+year+".csv", function(d, i, columns) {
    // Modify the parsing function to select desired columns

    if (d.Status === "Developing") {
    // Parse the data for developing countries
    d.Country = d.Country;
    d.LifeExpectancy = +d["Life expectancy "];
    d.HepatitisB = +d["Hepatitis B"];
    d.Diphtheria = +d["Diphtheria "];
    d.AdultMortality = +d["Adult Mortality"];
    d.UnderFiveDeaths = +d["under-five deaths "];
    d.Thinness59Years = +d[" thinness 5-9 years"];
    d.Alcohol = +d["Alcohol"];

    // Calculate total
    d.total = d3v4.sum([d.LifeExpectancy, d.HepatitisB, d.Diphtheria, d.AdultMortality, d.UnderFiveDeaths, d.Thinness59Years, d.Alcohol]);

    return d;

    } else {
    return null; // Skip this data point if it's not "Developing"
    }
    }, function(error, data) {
    if (error) throw error;

    // Filter out null data points
    data = data.filter(function(d) {
    return d !== null;
    });

    // Log the filtered data for debugging
    // console.log(data);

    data.sort(function(a, b) {
    return b.total - a.total; // Sort descending by total
    });
    data = data.slice(0, 15);

    // Define the domains for scales
    xDeveloping.domain(data.map(function(d) { return d.Country; }));
    yDeveloping.domain([0, d3v4.max(data, function(d) { return d.total; })]);
    zDeveloping.domain(["LifeExpectancy", "HepatitisB", "Diphtheria", "AdultMortality", "UnderFiveDeaths", "Thinness59Years", "Alcohol"]);

    // Append elements to the chart
    gDeveloping.append("g")
    .selectAll("g")
    .data(d3v4.stack().keys(zDeveloping.domain())(data))
    .enter().append("g")
    .attr("fill", function(d) { return zDeveloping(d.key); })
    .selectAll("path")
    .data(function(d) { return d; })
    .enter().append("path")
    .attr("d", d3v4.arc()
        .innerRadius(function(d) { return yDeveloping(d[0]); })
        .outerRadius(function(d) { return yDeveloping(d[1]); })
        .startAngle(function(d) { return xDeveloping(d.data.Country); })
        .endAngle(function(d) { return xDeveloping(d.data.Country) + xDeveloping.bandwidth(); })
        .padAngle(0.01)
        .padRadius(innerRadiusDeveloping));

    // Add labels
    var labelDeveloping = gDeveloping.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("text-anchor", "middle")
    .attr("transform", function(d) { return "rotate(" + ((xDeveloping(d.Country) + xDeveloping.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + innerRadiusDeveloping + ",0)"; });

    labelDeveloping.append("line")
    .attr("x2", -5)
    .attr("stroke", "#000");

    labelDeveloping.append("text")
    .attr("transform", function(d) { return (xDeveloping(d.Country) + xDeveloping.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
    .text(function(d) { return d.Country; });

    // Add y-axis
    var yAxisDeveloping = gDeveloping.append("g")
    .attr("text-anchor", "middle");

    var yTickDeveloping = yAxisDeveloping
    .selectAll("g")
    .data(yDeveloping.ticks(5).slice(1))
    .enter().append("g");

    yTickDeveloping.append("circle")
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("r", yDeveloping);

    yTickDeveloping.append("text")
    .attr("y", function(d) { return -yDeveloping(d); })
    .attr("dy", "0.35em")
    .attr("fill", "none")
    .attr("stroke", "#fff")
    .attr("stroke-width", 5)
    .text(yDeveloping.tickFormat(5, "s"));

    yTickDeveloping.append("text")
    .attr("y", function(d) { return -yDeveloping(d); })
    .attr("dy", "0.35em")
    .text(yDeveloping.tickFormat(5, "s"));

    // Add y-axis label
    yAxisDeveloping.append("text")
    .attr("y", function(d) { return -yDeveloping(yDeveloping.ticks(5).pop()); })
    .attr("dy", "-1em")
    .text("Population");

    // Add legend
    var legendDeveloping = gDeveloping.append("g")
    .selectAll("g")
    .data(zDeveloping.domain().reverse())
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(-40," + (i - (zDeveloping.domain().length - 1) / 2) * 20 + ")"; });

    legendDeveloping.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", zDeveloping);

    legendDeveloping.append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", "0.35em")
    .text(function(d) { return d; });
    });

}

loadRadialPlot()

radialChartSelectMenu.addEventListener('change', function() {
    loadRadialPlot(radialChartSelectMenu.value);
    console.log(radialChartSelectMenu.value)
});

