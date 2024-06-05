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

d3v4.csv("data/grouped_data.csv", function(d) {
    d.LifeExpectancy = +d.LifeExpectancy;
    return d;
}, function(error, data) {
    if (error) throw error;

    // Group data by country and year
    var groupedData = d3v4.nest()
        .key(function(d) { return d.Country; })
        .entries(data);

    x.domain(groupedData.map(function(d) { return d.key; }));
    y.domain([0, d3v4.max(groupedData, function(d) { return d3v4.max(d.values, function(v) { return v.LifeExpectancy; }); })]);
    z.domain(data.columns.slice(4)); // Adjust according to the columns relevant to the visualization

    g.append("g")
        .selectAll("g")
        .data(d3v4.stack().keys(data.columns.slice(4))(data))
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
        .data(groupedData)
        .enter().append("g")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) { return "rotate(" + ((x(d.key) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)"; });

    label.append("line")
        .attr("x2", -5)
        .attr("stroke", "#000");

    label.append("text")
        .attr("transform", function(d) { return (x(d.key) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
        .text(function(d) { return d.key; });

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
        .text("Life Expectancy");

    var legend = g.append("g")
        .selectAll("g")
        .data(data.columns.slice(4).reverse())
        .enter().append("g")
            .attr("transform", function(d, i) { return "translate(-40," + (i - (data.columns.length - 5) / 2) * 20 + ")"; });

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
