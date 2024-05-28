var margin = { top: 20, right: 70, bottom: 20, left: 50 };

function initializeChart(containerId) {
    var width = 700;
    var height = 400 - margin.top - margin.bottom; // Initial height for Top 10 and Bottom 10
    d3.select("#" + containerId).select("svg").remove();
    var svg = d3.select("#" + containerId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("data-aos","fade-up")
        .attr("data-aos-delay","100")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleBand().range([0, height]).padding(.1);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")");
    svg.append("g")
        .attr("class", "y-axis");
    var parentId = containerId;
    return { svg, x, y, parentId };
}

function loadBarGraphs(year) {
    var topChart = initializeChart("top10_barGraph_container");
    var bottomChart = initializeChart("bottom10_barGraph_container");
    d3.csv(`../data/${year}.csv`).then(function (data) {
        data.forEach(function (d) {
            d['Life expectancy '] = +d['Life expectancy '];
        });

        // Sort data and get top 10 and bottom 10 countries
        var sortedData = data.sort((a, b) => b['Life expectancy '] - a['Life expectancy ']);
        var top10 = sortedData.slice(0, 10);
        var bottom10 = sortedData.slice(-10).reverse();

        updateBarChart(topChart, top10);
        updateBarChart(bottomChart, bottom10);
    }).catch(function (error) {
        console.error('Error loading the CSV file:', error);
    });
}

function updateBarChart(chart, filteredData) {
    var width = 600;

    chart.x.range([0, width]);
    chart.x.domain([0, d3.max(filteredData, d => d['Life expectancy '])]);
    chart.y.domain(filteredData.map(d => d.Country));

    chart.svg.select(".x-axis").call(d3.axisBottom(chart.x));
    chart.svg.select(".y-axis").call(d3.axisLeft(chart.y));

    // Hide Y-axis labels
    chart.svg.selectAll(".y-axis text").style("opacity", 0);

    // Select and update bars
    var bars = chart.svg.selectAll("rect")
        .data(filteredData, d => d.Country);

    // Define color based on the 'Status'
    var colorMap = { "Developed": "#9999ff", "Developing": "#ff9999" };

    // Transition for existing bars
    bars.transition()
        .duration(800)
        .attr("y", d => chart.y(d.Country))
        .attr("width", d => chart.x(d['Life expectancy ']))
        .attr("height", chart.y.bandwidth());

    // Add new bars
    bars.enter().append("rect")
        .attr("x", chart.x(0))
        .attr("y", d => chart.y(d.Country))
        .attr("height", chart.y.bandwidth())
        .attr("fill", d => colorMap[d.Status])
        .transition()
        .duration(800)
        .attr("width", d => chart.x(d['Life expectancy ']));

    // Select and update text for each bar
    var barText = chart.svg.selectAll(".bar-text")
        .data(filteredData, d => d.Country);

    // Transition for existing text
    barText.transition()
        .duration(800)
        .attr("y", d => chart.y(d.Country) + chart.y.bandwidth() / 2)
        .attr("x", 5)
        .text(d => `${d.Country}`);

    // Add new text for new bars
    barText.enter().append("text")
        .attr("class", "bar-text")
        .attr("y", d => chart.y(d.Country) + chart.y.bandwidth() / 2)
        .attr("x", 5)
        .attr("dy", ".35em")
        .text(d => `${d.Country}`)
        .attr("fill", "white")
        .style("font-size", "9px");

    // Remove text that is no longer needed
    barText.exit().remove();

    // Remove bars that are no longer needed
    bars.exit().remove();

    // Mouse events
    chart.svg.selectAll("rect")
        .on("mouseover", function (event, d) {
            d3.select("#tooltip")
                .style("display", "block")
                .style("opacity", "1")
                .html("<b>" + d.Country + "</b>" +
                    "<br/>Life Expectancy: " + d['Life expectancy '] +
                    "<br/>GDP: " + d['GDP'] + " $ USD" 
                    )
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
            d3.select(this).attr("fill", "#D3D3D3");
        })
        .on("mousemove", function (event) {
            d3.select("#tooltip")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function () {
            d3.select("#tooltip")
                .style("display", "none")
                .style("opacity", "0")
            d3.select(this).attr("fill", d => colorMap[d.Status]);
        });
    if(chart.parentId.includes("top")){
        chart.svg.append("text")
        .attr("x", width / 2)
        .attr("y", -6)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight","bold")
        .text("Top 10 Countries by Life Expectency");
    }
    else{
        chart.svg.append("text")
        .attr("x", width / 2)
        .attr("y", -6)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight","bold")
        .text("Bottom 10 Countries by Life Expectency");
    }
    
}