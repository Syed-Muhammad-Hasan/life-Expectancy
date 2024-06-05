document.addEventListener('DOMContentLoaded', function() {
    const bubbleChartSelectMenu = document.getElementById('bubbleChart_years_options');
    const selectFactor = document.getElementById('selectFactor');
    const tooltip = d3v7.select("#tooltip");

    // Generate options from 2000 to 2015
    for (let year = 2000; year <= 2015; year++) {
        const option = document.createElement('option');
        option.text = year;
        option.value = year;
        if (year === 2015) {
            option.selected = true;
        }
        bubbleChartSelectMenu.appendChild(option);
    }

    var container = d3v7.select("#bubbleChart_container");
    var margin = {top: 40, right: 30, bottom: 60, left: 70},
        width = 1000 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3v7.scaleLinear().range([0, width]);
    var y = d3v7.scaleLinear().range([height, 0]);
    var z = d3v7.scaleSqrt().range([2, 20]);

    var colorMap = {
        "Developed": "#9999ff",
        "Developing": "#ff9999"
    };

    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x-axis");

    var yAxis = svg.append("g")
        .attr("class", "y-axis");

    var yAxisLabel = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Life Expectancy")
        .style("font-family", "Merriweather")
        .style("font-size", "12px");

    var xAxisLabel = svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 10) + ")")
        .style("text-anchor", "middle")
        .attr("class", "x-axis-label")
        .style("font-family", "Merriweather")
        .style("font-size", "12px");

    var factorLabelMap = {
        "GDP": "Gross Domestic Product per capita (in USD $)",
        "ICR": "Human Development Index in terms of income composition of resources",
        "AdultMortality": "Probability of dying between 15 and 60 years per 1000 population",
        "InfantDeaths": "Number of Infant Deaths per 1000 population",
        "Alcohol": "Consumption in litres of pure alcohol per capita (15+)",
        "HepB": "Immunization coverage among 1-year-olds (%)",
        "Polio": "Immunization coverage among 1-year-olds (%)",
        "HIV": "Deaths per 1 000 live births HIV/AIDS (0-4 years)",
        "PercExpend": "Expenditure on health as a percentage of GDP per capita (%)",
        "TotalExpend": "Expenditure on health of total government expenditure (%)"
    };

    function updateBubblePlot(selectedYear, selectedFactor) {
        d3v7.csv("data/Factors.csv").then(function(data) {
            var filteredData = data.filter(d => d.Year == selectedYear && !isNaN(d[selectedFactor]) && d[selectedFactor] > 0);

            var numTicks = width < 500 ? 5 : 10;
            x.domain([0, d3v7.max(filteredData, d => +d[selectedFactor])]).range([0, width]);
            y.domain([35, 90]);
            z.domain(d3v7.extent(filteredData, d => +d.Population));

            xAxis.transition().duration(800).call(d3v7.axisBottom(x).ticks(numTicks));
            yAxis.call(d3v7.axisLeft(y));

            var bubbles = svg.selectAll(".bubble")
                .data(filteredData, d => d.Country);

            var bubblesEnter = bubbles.enter().append("circle")
                .attr("class", "bubble");

            bubblesEnter.merge(bubbles)
                .transition().duration(800)
                .attr("cx", d => x(d[selectedFactor]))
                .attr("cy", d => y(d.LifeExpectancy))
                .attr("r", d => z(d.Population))
                .style("fill", d => colorMap[d.Status] || "#ccc")
                .style("opacity", 0.7)
                .style("stroke", "black")
                .style("stroke-width", 1);

            bubblesEnter.on("mouseover", function(event, d) {
                tooltip.style("display", "block")
                    .style("opacity", "1")
                    .html("<b>" + d.Country + "</b>" + "<br/>" + parseFloat(d[selectedFactor]).toFixed(2))
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
                d3v7.select(this).attr("fill", "#d3d3d3");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("display", "none")
                    .style("opacity", "0");
                d3v7.select(this).style("fill", d => colorMap[d.Status]);
            });

            bubbles.exit().remove();

            xAxisLabel.text(factorLabelMap[selectedFactor] || selectedFactor);
        }).catch(function(error) {
            console.error("Error loading data: ", error);
        });
    }

    bubbleChartSelectMenu.addEventListener('change', function() {
        updateBubblePlot(this.value, selectFactor.value);
    });

    selectFactor.addEventListener('change', function() {
        updateBubblePlot(bubbleChartSelectMenu.value, this.value);
    });

    window.addEventListener('resize', function() {
        width = container.node().getBoundingClientRect().width - margin.left - margin.right;
        svg.attr("width", width + margin.left + margin.right);
        x.range([0, width]);
        updateBubblePlot(bubbleChartSelectMenu.value, selectFactor.value);
    });

    updateBubblePlot(bubbleChartSelectMenu.value, selectFactor.value);
});
