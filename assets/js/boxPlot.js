// const boxPlotSelectMenu = document.getElementById('boxPlot_years_options');
// // Generate options from 2000 to 2015
// for (let year = 2000; year <= 2015; year++) {
//     // Create a new option element
//     const option = document.createElement('option');
//     // Set the text and value to the current year
//     option.text = year;
//     option.value = year;

//     if (year === 2015) {
//         option.selected = true;
//     }

//     // Add the option to the select menu
//     boxPlotSelectMenu.appendChild(option);
// }
// function loadBoxPlot() {
//     // Get the selected value
//     const selectedValue = boxPlotSelectMenu.value;
//     // Display the selected value
//     console.log(selectedValue)
//     drawBoxPlot(selectedValue);
//     loadBoxGraphs(selectedValue);
// }


(function() {
    const boxPlotSelectMenu = document.getElementById('boxPlot_years_options');

    // Generate options from 2000 to 2015
    for (let year = 2000; year <= 2015; year++) {
      const option = document.createElement('option');
      option.text = year;
      option.value = year;
      if (year === 2015) {
        option.selected = true;
      }
      boxPlotSelectMenu.appendChild(option);
    }

    var container = d3v7.select("#boxPlot_container");
    var margin = {
        top: 40,
        right: 30,
        bottom: 60,
        left: 70
    },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3v7.scaleBand()
      .range([0, width])
      .domain(["Developed", "Developing"])
      .paddingInner(1)
      .paddingOuter(.5);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x-axis");

    const y = d3v7.scaleLinear()
      .range([height, 0]);
    svg.append("g")
      .attr("class", "y-axis");

    const colorMap = { "Developed": "#9999ff", "Developing": "#ff9999" };
    const tooltip = d3v7.select("#boxtooltip");

    function updateBoxPlot(selectedYear) {
      d3v7.csv("data/DevelopedLE.csv").then(function(data) {
        const filteredData = data.filter(d => d.Year == selectedYear);

        const sumstat = d3v7.rollup(filteredData, function(d) {
          const q1 = d3v7.quantile(d.map(g => g.LifeExpectancy).sort(d3v7.ascending), .25);
          const median = d3v7.quantile(d.map(g => g.LifeExpectancy).sort(d3v7.ascending), .5);
          const q3 = d3v7.quantile(d.map(g => g.LifeExpectancy).sort(d3v7.ascending), .75);
          const interQuantileRange = q3 - q1;
          const min = q1 - 1.5 * interQuantileRange;
          const max = q3 + 1.5 * interQuantileRange;
          const mean = d3v7.mean(d.map(g => g.LifeExpectancy));
          return({q1, median, q3, interQuantileRange, min, max, mean});
        }, d => d.Status);

        y.domain([0, d3v7.max(filteredData, d => +d.LifeExpectancy)]);
        svg.select(".y-axis").transition().duration(800).call(d3v7.axisLeft(y));
        svg.select(".x-axis").call(d3v7.axisBottom(x));

        const boxWidth = 100;

        // Vertical lines
        const vertLines = svg.selectAll(".vertLines")
          .data(sumstat);
        vertLines.enter().append("line")
          .attr("class", "vertLines")
          .merge(vertLines)
          .transition().duration(800)
          .attr("x1", d => x(d[0]))
          .attr("x2", d => x(d[0]))
          .attr("y1", d => y(d[1].min))
          .attr("y2", d => y(d[1].max))
          .attr("stroke", "black");

        // Boxes
        const boxes = svg.selectAll(".boxes")
          .data(sumstat);
        boxes.enter().append("rect")
          .attr("class", "boxes")
          .merge(boxes)
          .transition().duration(800)
          .attr("x", d => x(d[0]) - boxWidth / 2)
          .attr("y", d => y(d[1].q3))
          .attr("height", d => y(d[1].q1) - y(d[1].q3))
          .attr("width", boxWidth)
          .attr("stroke", "black")
          .style("fill", d => colorMap[d[0]]);

        // Median lines
        const medianLines = svg.selectAll(".medianLines")
          .data(sumstat);
        medianLines.enter().append("line")
          .attr("class", "medianLines")
          .merge(medianLines)
          .transition().duration(800)
          .attr("x1", d => x(d[0]) - boxWidth / 2)
          .attr("x2", d => x(d[0]) + boxWidth / 2)
          .attr("y1", d => y(d[1].median))
          .attr("y2", d => y(d[1].median))
          .attr("stroke", "black");

        // // Tooltip
        // svg.selectAll(".boxes")
        //   .on("mouseover", function(event, d) {
        //     tooltip.style("display", "block")
        //       .html("<b>" + d[0] + "</b>" + "<br/>Mean: " + d[1].mean.toFixed(3) + "<br/>Median: " + d[1].median.toFixed(2) + "<br/>Q1: " + d[1].q1.toFixed(2) + "<br/>Q3: " + d[1].q3.toFixed(3))
        //       .style("left", (event.pageX + 10) + "px")
        //       .style("top", (event.pageY + 10) + "px");
        //   })
        //   .on("mousemove", function(event) {
        //     tooltip.style("left", (event.pageX + 10) + "px")
        //       .style("top", (event.pageY + 10) + "px");
        //   })
        //   .on("mouseout", function() {
        //     tooltip.style("display", "none");
        //   });
        
        svg.selectAll(".boxes")
        .on("mouseover", function(event, d) {
          tooltip.style("display", "block")
            .style("opacity", "1")
            .html("<b>" + d[0] + "</b>" +
                  "<br/>Mean: " + d[1].mean.toFixed(3) +
                  "<br/>Median: " + d[1].median.toFixed(2) +
                  "<br/>Q1: " + d[1].q1.toFixed(2) +
                  "<br/>Q3: " + d[1].q3.toFixed(3))
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
          d3v7.select(this).attr("fill", "#d3v7d3v7d3v7");
        })
        .on("mousemove", function(event) {
          tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function() {
          tooltip.style("display", "none")
            .style("opacity", "0");
          d3v7.select(this).attr("fill", d => colorMap[d[0]]);
        });

        vertLines.exit().remove();
        boxes.exit().remove();
        medianLines.exit().remove();
      });
    }

    updateBoxPlot(boxPlotSelectMenu.value);
    boxPlotSelectMenu.addEventListener('change', function() {
      updateBoxPlot(this.value);
    });
  })();
