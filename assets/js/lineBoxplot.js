function createBoxPlot() {
    // Define the dimensions and margins of the graph
    const marginBoxPlot = {top: 10, right: 30, bottom: 30, left: 60},
    widthBoxPlot = 800 - marginBoxPlot.left - marginBoxPlot.right,
    heightBoxPlot = 400 - marginBoxPlot.top - marginBoxPlot.bottom;


    const svgBoxPlotDeveloped = d3v7.select("#lineBoxDeveloped_container")
                                .append("svg")
                                .attr("width", widthBoxPlot + marginBoxPlot.left + marginBoxPlot.right)
                                .attr("height", heightBoxPlot + marginBoxPlot.top + marginBoxPlot.bottom)
                                .append("g")
                                .attr("transform", `translate(${marginBoxPlot.left},${marginBoxPlot.top})`);

    const svgBoxPlotDeveloping = d3v7.select("#lineBoxDeveloping_container")
                                .append("svg")
                                .attr("width", widthBoxPlot + marginBoxPlot.left + marginBoxPlot.right)
                                .attr("height", heightBoxPlot + marginBoxPlot.top + marginBoxPlot.bottom)
                                .append("g")
                                .attr("transform", `translate(${marginBoxPlot.left},${marginBoxPlot.top})`);

    // Now read the life expectancy data
    d3v7.csv('data/cleaned_life_data_continents.csv').then(function (data) {
        data.forEach(d => {
            d.Status = d.Status;
            d.Continent = d.continent;
            d.Schooling = +d.Schooling;
        });
        // Separate data by country status
        data = data.filter(d => d.Schooling!=0);
        const developedData = data.filter(d => d['Status'] === 'Developed');
        const developingData = data.filter(d => d['Status'] === 'Developing');
        console.log(developedData)
        // Function to create box plot for a specific data set
        function createBoxPlotForData(svgBoxPlot, data, type) {
            // Group by continent and calculate statistics for box plot
            const dataByContinent = d3v7.rollups(data, v => {
                console.log(d => d.Continent)
                const q1 = d3v7.quantile(v.map(d => d.Schooling).sort(d3v7.ascending), .25);
                const median = d3v7.quantile(v.map(d => d.Schooling), .5);
                const q3 = d3v7.quantile(v.map(d => d.Schooling), .75);
                const interQuantileRange = q3 - q1;
                const min = q1 - 1.5 * interQuantileRange;
                const max = q3 + 1.5 * interQuantileRange;
                return { q1, median, q3, min, max };
            }, d => d.Continent);
            console.log(dataByContinent)
            // Transform dataByContinent into a suitable format for D3
            const transformedData = dataByContinent.map(d => ({
                continent: d[0],
                stats: d[1]
            }));

            // Create scales
            const x = d3v7.scaleBand()
                .range([0, widthBoxPlot])
                .domain(dataByContinent.map(d => d[0]))
                .paddingInner(1)
                .paddingOuter(.5);
            svgBoxPlot.append("g")
                .attr("transform", `translate(0, ${heightBoxPlot})`)
                .call(d3v7.axisBottom(x))
                .selectAll("text")
                .style("font-size", "14px")

            const y = d3v7.scaleLinear()
                .domain([0, d3v7.max(data, d => d.Schooling)])
                .range([heightBoxPlot, 0]);
            svgBoxPlot.append("g")
                .call(d3v7.axisLeft(y))
                .selectAll("text")
                .style("font-size", "14px");

            const boxWidth = 20;
            const colorMap = { "Developed": "#9999ff", "Developing": "#ff9999" };
            svgBoxPlot.selectAll("rect")
                .data(transformedData)
                .enter()
                .append("rect")
                .attr("x", d => x(d.continent) - boxWidth / 2)
                .attr("y", d => y(d.stats.q3))
                .attr("height", d => y(d.stats.q1) - y(d.stats.q3))
                .attr("width", boxWidth)
                .attr("stroke", "black")
                .style("fill", colorMap[type]);

            // Create lines from the box to the max value
            svgBoxPlot.selectAll("maxLines")
                .data(transformedData)
                .enter()
                .append("line")
                .attr("x1", d => x(d.continent))
                .attr("x2", d => x(d.continent))
                .attr("y1", d => y(d.stats.q3))
                .attr("y2", d => y(d.stats.max))
                .attr("stroke", "black");

            // Create lines from the box to the min value
            svgBoxPlot.selectAll("minLines")
                .data(transformedData)
                .enter()
                .append("line")
                .attr("x1", d => x(d.continent))
                .attr("x2", d => x(d.continent))
                .attr("y1", d => y(d.stats.q1))
                .attr("y2", d => y(d.stats.min))
                .attr("stroke", "black");

            svgBoxPlot.selectAll("medianLines")
                .data(dataByContinent)
                .enter()
                .append("line")
                .attr("x1", d => x(d[0]) - boxWidth / 2)
                .attr("x2", d => x(d[0]) + boxWidth / 2)
                .attr("y1", d => y(d[1].median))
                .attr("y2", d => y(d[1].median))
                .attr("stroke", "black")
                .style("width", 80);

            // Calculate average life expectancy for each continent
            const lifeExpectancyByContinent = d3v7.rollups(data, v => d3v7.mean(v, d => d['Life expectancy ']), d => d.Continent);

            // Create a secondary y-axis for life expectancy
            const yRight = d3v7.scaleLinear()
                .domain([0, d3v7.max(lifeExpectancyByContinent, d => d[1])])
                .range([heightBoxPlot, 0]);

            svgBoxPlot.append("g")
                .attr("transform", `translate(${widthBoxPlot}, 0)`)
                .call(d3v7.axisRight(yRight));

            // Create a line for average life expectancy
            const line = d3v7.line()
                .x(d => x(d[0]) + x.bandwidth() / 2) // Center the line in the band
                .y(d => yRight(d[1]));

            svgBoxPlot.append("path")
                .datum(lifeExpectancyByContinent)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", line);
        }

        // Create box plots for developed and developing countries
        createBoxPlotForData(svgBoxPlotDeveloped, developedData,"Developed" );
        createBoxPlotForData(svgBoxPlotDeveloping, developingData, "Developing");
    });
}

createBoxPlot();
