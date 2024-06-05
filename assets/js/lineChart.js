function drawLineChart() {
    d3v4.select("#lineChart_container").selectAll("svg").remove();
    var margin = {top: 40, right: 200, bottom: 60, left: 70}, // Increase right margin for legend
        width = 1000 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    console.log("THIS IS WIDTH: ", width);
    const svg = d3v4.select('#lineChart_container')
        .append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3v4.csv("data/data.csv", function(data) {
        data.forEach(d => {
            d.life_expectancy = parseFloat(d.life_expectancy);
            d.year = d.year;
        });

        const nestedData = d3v4.nest()
            .key(d => d.region)
            .key(d => d.year)
            .rollup(function(d) {
                return d3v4.mean(d, v => v.life_expectancy);
            })
            .entries(data);

        const globalAverageData = d3v4.nest()
            .key(d => d.year)
            .rollup(function(d) {
                return d3v4.mean(d, v => v.life_expectancy);
            })
            .entries(data).sort((a, b) => d3v4.ascending(a.key, b.key));

        nestedData.push({
            key: "World",
            values: globalAverageData
        });

        const colorScale = d3v4.scaleOrdinal(d3v4.schemeCategory10)
            .domain(nestedData.map(d => d.key));

        const xScale = d3v4.scaleLinear()
            .domain([d3v4.min(data, d => d.year), d3v4.max(data, d => d.year)])
            .range([0, width])
            .nice();

        const yScale = d3v4.scaleLinear()
            .domain([
                d3v4.min(nestedData, region => d3v4.min(region.values, year => year.value)),
                d3v4.max(nestedData, region => d3v4.max(region.values, year => year.value))
            ])
            .range([height, 0])
            .nice();

        const xAxis = d3v4.axisBottom(xScale);
        const yAxis = d3v4.axisLeft(yScale);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis.tickFormat(d3v4.format('.0f'))).attr("class", "axis");

        svg.append("g")
            .call(yAxis).attr("class", "axis");

        var lineOpacity = "1";
        var lineOpacityHover = "0.85";
        var otherLinesOpacityHover = "0.1";
        var lineStroke = "2px";
        var lineStrokeHover = "3px";

        var circleOpacity = '0.85';
        var circleOpacityOnLineHover = "0";

        function mouseOverLine(d) {
            d3v4.selectAll('.line')
                .style('opacity', otherLinesOpacityHover);

            d3v4.selectAll('.legendLine')
                .style('opacity', otherLinesOpacityHover);

            d3v4.selectAll('.dotMaxLine')
                .style('opacity', circleOpacityOnLineHover);

            d3v4.selectAll("._" + d.replaceAll(" ", ""))
                .style('opacity', lineOpacityHover)
                .style("stroke-width", lineStrokeHover)
                .style("cursor", "pointer");
        }

        function mouseOutLine(d) {
            svg.select(".title-text").remove();

            d3v4.selectAll(".line")
                .style('opacity', lineOpacity);

            d3v4.selectAll(".legendLine")
                .style('opacity', lineOpacity);
            d3v4.selectAll('.dotMaxLine')
                .style('opacity', circleOpacity);

            d3v4.selectAll("._" + d.replaceAll(" ", ""))
                .style("stroke-width", lineStroke)
                .style("cursor", "none");
        }
        
        
        const tooltip = d3v7.select("#linetooltip");

        function mouseover() {
            tooltip.style('z-index', 1);
            tooltip.transition().style('opacity', 0.9);
            d3v4.select(this).transition().attr('r', 6);
        }

        function mouseout() {
            tooltip.style('z-index', -1);
            tooltip.transition().style('opacity', 0);
            d3v4.select(this).transition().attr('r', 4);
        }

        function mousemove(d) {
            tooltip.style('visibility', 'visible');
            tooltip
                .html(
                    `Date: <b> ${d.key}</b><br>` +
                    `Life Expectancy: <b> ${d.value}</b><br>`)
                .style('top', `${event.pageY}px`)
                .style('left', `${event.pageX + 20}px`);
        }

        // Draw lines for each region
        nestedData.forEach(group => {
            const region = group.key;

            const line = d3v4.line()
                .x(d => xScale(d.key))
                .y(d => yScale(d.value));

            svg
                .append("path")
                .datum(group.values)
                .attr("class", function(d) {
                    return "line _" + region.replaceAll(" ", "")
                })
                .attr("fill", "none")
                .attr("stroke", colorScale(region)) // Color based on region
                .attr("stroke-width", 2)
                .attr("d", line)
                .on("mouseover", d => mouseOverLine(region))
                .on("mouseout", d => mouseOutLine(region));

            svg.selectAll('.dots')
                .data(group.values)
                .enter().append('circle')
                .attr('id', function(d) {
                    return "dotForLine";
                })
                .attr('cx', function(d) {
                    return xScale(parseInt(d.key));
                })
                .attr('cy', function(d) {
                    return yScale(d.value);
                })
                .attr("class", "dotMaxLine")
                .attr('r', 3.5)
                .style('fill', function(d) {
                    return colorScale(group.key); // Use group.key instead of region
                })
                .style('stroke', 'white')
                .style('stroke-width', '1px')
                .on('mouseover', mouseover)
                .on('mouseout', mouseout)
                .on('mousemove', mousemove);
        });

        var size = 12;

        var legend = svg.append('g')
            .attr("transform", "translate(" + (width + 30) + "," + 20 + ")"); // Adjust legend position

        const regionKeys = nestedData.map(entry => entry.key);

        legend.selectAll('rect')
            .data(regionKeys)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr("y", function(d, i) { return i * (size + 5) })
            .attr('width', size)
            .attr('height', size)
            .attr('class', function(d) {
                return "tooltip legendLine _" + d.replaceAll(" ", "")
            })
            .attr('fill', function(d, i) {
                return colorScale(d);
            })
            .on("mouseover", d => mouseOverLine(d))
            .on("mouseout", d => mouseOutLine(d));

        legend.selectAll('text')
            .data(regionKeys)
            .enter()
            .append('text')
            .text(function(d) {
                return d;
            })
            .attr("x", size * 1.2)
            .attr("y", function(d, i) { return i * (size + 5) + (size / 2) })
            .attr('class', function(d) {
                return "legendLine _" + d.replaceAll(" ", "")
            })
            .attr('fill', function(d, i) {
                return colorScale(d);
            })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", d => mouseOverLine(d))
            .on("mouseout", d => mouseOutLine(d));

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width / 2)
            .attr("y", height + 50)
            .text("Year")
            .style("fill", "white");

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", -height / 2)
            .attr("y", -50)
            .attr("transform", "rotate(-90)")
            .text("Life Expectancy")
            .style("fill", "white");
    });
}

drawLineChart();
