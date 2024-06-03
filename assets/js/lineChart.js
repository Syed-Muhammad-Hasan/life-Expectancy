import * as d3v7 from "https://unpkg.com/d3@4";

function drawLineChart(){
    d3v7.select("#lineChart_container").selectAll("svg").remove();
    var margin = {top: 20, right: 20, bottom: 150, left: 150},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    const svg = d3v7.select('#lineChart_container')
        .append('svg')
        .attr('width',300+width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    d3v7.csv("data/data.csv", function(data){


        data.forEach(d => {
            d.life_expectancy = parseFloat(d.life_expectancy)
            d.year = d.year
        })



        const nestedData = d3v7.nest()
            .key(d => d.region)
            .key(d => d.year)
            .rollup(function (d){
                return d3v7.mean(d, v => v.life_expectancy)
            })
            .entries(data);



        const globalAverageData = d3v7.nest()
            .key(d => d.year)
            .rollup(function (d) {
                return d3v7.mean(d, v => v.life_expectancy);
            })
            .entries(data).sort((a, b) => d3v7.ascending(a.key, b.key));

        nestedData.push({
            key: "World",
            values: globalAverageData
        });

        const colorScale = d3v7.scaleOrdinal(d3v7.schemeCategory10)
            .domain(data.map(d => d.region));

        const xScale = d3v7.scaleLinear()
            .domain([d3v7.min(data, d => d.year), d3v7.max(data, d => d.year)])
            .range([0, width])
            .nice();

        const yScale = d3v7.scaleLinear()
            .domain([
                d3v7.min(nestedData, region => d3v7.min(region.values, year => year.value)),
                d3v7.max(nestedData, region => d3v7.max(region.values, year => year.value))
            ])
            .range([height, 0])
                .nice();


        const xAxis = d3v7.axisBottom(xScale);
        const yAxis = d3v7.axisLeft(yScale);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis.tickFormat(d3v7.format('.0f'))).attr("class", "axis");

        svg.append("g")
            .call(yAxis).attr("class", "axis");


        var lineOpacity = "1";
        var lineOpacityHover = "0.85";
        var otherLinesOpacityHover = "0.1";
        var lineStroke = "2px";
        var lineStrokeHover = "3px";

        var circleOpacity = '0.85';
        var circleOpacityOnLineHover = "0"

        function mouseOverLine(d) {

            d3v7.selectAll('.line')
                .style('opacity', otherLinesOpacityHover);

            d3v7.selectAll('.legendLine')
                .style('opacity', otherLinesOpacityHover);

            d3v7.selectAll('.dotMaxLine')
                .style('opacity', circleOpacityOnLineHover);

            d3v7.selectAll("._"+d.replaceAll(" ", ""))
                .style('opacity', lineOpacityHover)
                .style("stroke-width", lineStrokeHover)
                .style("cursor", "pointer");
        }

        function mouseOutLine(d) {
            svg.select(".title-text").remove();

            d3v7.selectAll(".line")
                .style('opacity', lineOpacity);

            d3v7.selectAll(".legendLine")
                .style('opacity', lineOpacity);
            d3v7.selectAll('.dotMaxLine')
                .style('opacity', circleOpacity);

            d3v7.selectAll("._" + d.replaceAll(" ", ""))
                .style("stroke-width", lineStroke)
                .style("cursor", "none");
        }

        const tooltip =d3v7.select("#linechart")
            .append("div")
            .style('visibility', 'hidden')
            .attr("class", "tooltip")


        function mouseover() {
            tooltip.style('z-index', 1);
            tooltip.transition().style('opacity', 0.9);
            d3v7.select(this).transition().attr('r', 6);

        }

        function mouseout() {
            tooltip.style('z-index', -1);
            tooltip.transition().style('opacity', 0);
            d3v7.select(this).transition().attr('r', 4);
        }

        function mousemove(d) {
            tooltip.style('visibility', 'visible')

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

            const line = d3v7.line()
                .x(d => xScale(d.key))
                .y(d => yScale(d.value));

            svg
                .append("path")
                .datum(group.values)
                .attr("class", function(d){
                    return "line _"+region.replaceAll(" ", "")
                })
                .attr("fill", "none")
                .attr("stroke", colorScale(region)) // Color based on region
                .attr("stroke-width", 2)
                .attr("d", line)
                .on("mouseover", d=>mouseOverLine(region))
                .on("mouseout", d=>mouseOutLine(region));

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
                    .attr("class","dotMaxLine")
                    .attr('r', 3.5)
                    .style('fill', function(d) {
                        return colorScale(group.key); // Use group.key instead of region
                    })
                    .style('stroke', 'white')
                    .style('stroke-width', '1px')
                    .on('mouseover', mouseover)
                    .on('mouseout', mouseout)
                    .on('mousemove', mousemove);
        }
        )
        var size = 12

        var legend = svg.append('g')
            .attr("transform", "translate(" + (width) + "," + (-100) + ")");

        const regionKeys = nestedData.map(entry => entry.key);


        legend.selectAll('rect')

            .data(regionKeys)
            .enter()
            .append('rect')

            .attr('x', 0)
            .attr("y", function(d,i){ return 100 + i*(size+10)})
            .attr('width', size)
            .attr('height', size)
            .attr('class', function (d){
                return "tooltip legendLine _"+d.replaceAll(" ", "")
            })
            .attr('fill', function(d, i){

                return colorScale(d);
            })
            .on("mouseover", d=>mouseOverLine(d))
            .on("mouseout", d=>mouseOutLine(d))


        legend.selectAll('text')

            .data(regionKeys)
            .enter()

            .append('text')

            .attr("padding", "0px")
            .text(function(d){
                return d;
            })
            .attr("x", size*1.8)
            .attr("y", function(d,i){ return 100 + i*(size+10) + (size/2)})
            .attr('width', 12)
            .attr('height', 12)
            .attr('class', function (d){
                return "legendLine _"+d.replaceAll(" ", "")
            })
            .attr('fill', function(d, i){
                return colorScale(d);
            })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", d=>mouseOverLine(d))
            .on("mouseout", d=>mouseOutLine(d))



        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width/2)
            .attr("y", height + 60)
            .text("Year")
            .style("fill","white");

        svg.append("text")
            .attr("x",  -width/2.5)
            .attr("y", -80)
            .text("Life Expectancy")
            .style("fill","white")
            .attr("transform", "rotate(-90)");
    })






}

drawLineChart()