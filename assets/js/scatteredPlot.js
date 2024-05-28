const scatterPlotSelectMenu = document.getElementById('scatterPlot_years_options');
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
    scatterPlotSelectMenu.appendChild(option);
}
function loadScatterPlot() {
    // Get the selected value
    const selectedValue = scatterPlotSelectMenu.value;
    // Display the selected value
    drawScatterPlot(selectedValue);
    loadBarGraphs(selectedValue);
}

function drawScatterPlot(year) {
    var margin = {
        top: 40,
        right: 30,
        bottom: 60,
        left: 70
    },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    d3.select("#scatterPlot_container").select("svg").remove();

    d3.csv(`../data/${year}.csv`).then(function (data) {
        data.forEach(d => {
            d.LifeExpectancy = +d["Life expectancy "];
            d.GDP = +d.GDP;
        });

        var svg = d3.select("#scatterPlot_container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("data-aos","fade-up")
            .attr("data-aos-delay","100")
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        var x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.GDP)]).nice()
            .range([0, width]);

        var y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.LifeExpectancy)]).nice()
            .range([height, 0]);

        var color = d3.scaleOrdinal()
            .domain(["Developing", "Developed"])
            .range(["#ff9999", "#9999ff"]);

        // Add X axis
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .append("text")
            .attr("x", width)
            .attr("y", -10)
            .attr("fill", "black")
            .attr("text-anchor", "end")
            .text("GDP");

        // Add Y axis
        svg.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("x", 6)
            .attr("y", 6)
            .attr("dy", "-1.5em")
            .attr("fill", "black")
            .attr("text-anchor", "end")
            .text("Life Expectancy");
       

        // Add dots
        svg.append("g")
            .selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("class", d => `dot ${d.Status.toLowerCase()}`)
            .attr("cx", d => x(d.GDP))
            .attr("cy", d => y(d.LifeExpectancy))
            .attr("r", 5)
            .style("fill", d => color(d.Status))
            .on("mouseover", mouseoverScatter)
            .on("mousemove", mousemoveScatter)
            .on("mouseleave", mouseleaveScatter);

        // Add titles
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight","bold")
            .text("Life Expectancy vs GDP by Country Status");

        // Add legend
        var legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(0,${i * 20})`);

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(d => d);
    });
    function mouseoverScatter(event, d) {
        d3.select("#scatterPlottooltip")
            .style("opacity", 1)
            .html(`<strong>Country:</strong> ${d.Country}<br><strong>GDP:</strong> ${d.GDP} USD <br><strong>Life Expectancy:</strong> ${d.LifeExpectancy}`);
    }

    function mousemoveScatter(event, d) {
        d3.select("#scatterPlottooltip")
            .style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    function mouseleaveScatter(d) {
        d3.select("#scatterPlottooltip")
            .style("opacity", 0);
    }
}
loadScatterPlot();