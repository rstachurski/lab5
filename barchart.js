(function () {
  //iife - this wraps the code in a function so it isn't accidentally exposed
  //to other javascript in other files. It is not required.

  var width = 600,
    height = 400;

  //read in our csv file
  d3.csv("./cars.csv").then((data) => {
    var data = d3.rollup(
      data,
      (v) => Math.round(d3.mean(v, (d) => d.cty)),
      (d) => d.manufacturer
    );
    var data = Array.from(data, ([name, value]) => ({ name, value }));

    var svg = d3.select("#barchart");

    //create an svg g element and add 50px of padding

    const chart = svg.append("g").attr("transform", `translate(50, 50)`);

    //create linear scales to map your data
    //x and y become functions that can be called later (functions are 1st class citizens in JS)

    const distinctValues = [...new Set(data.map((d) => d.name))]; //find the unique options for data.manufacturer

    var x = d3
      .scaleBand()
      .domain(distinctValues) //use manufactuer as input
      .range([0, width])
      .padding(0.1);

    var y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, (d) => {
          return +d.value;
        }),
      ])
      .range([height, 0]);

    //Creating an colorscale for nominal (categorical data)
    var ordinal = d3
      .scaleOrdinal()
      .domain(distinctValues) //use unique values as input domain
      .range(d3.schemeSet3); //use d3 Color Scheme #3 as possible output colors

    // Add marks (points/circles)
    bars = chart
      .append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", function (d) {
        return x(d.name);
      })
      .attr("y", function (d) {
        return y(+d.value);
      })
      .attr("fill", function (d) {
        return ordinal(d.name);
      })
      .attr("width", x.bandwidth())
      .attr("height", function (d) {
        return height - y(+d.value);
      })
      .attr("class", "bars")
      .style("opacity", 0.75);

    // ===========   add axes ============ //
    chart
      .append("g")
      .attr("transform", "translate(0," + height + ")") //put our axis on the bottom
      .call(
        d3
          .axisBottom(x)
          .ticks(10)
          .tickSize(-height - 10) //ticks + tickSize adds grids
      )
      .call((g) => g.select(".domain").remove()); //Optional: remove the axis endpoints
    chart
      .append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(10)
          .tickSize(-width - 10)
      )
      .call((g) => g.select(".domain").remove()); //Optional: remove the axis endpoints

    chart
      .append("text") //x-axis
      .attr("class", "axis-title") //Optional: change font size and font weight
      .attr("y", height + 40) //add it to the bottom of the graph (-25 to add it above the axis)
      .attr("x", width - 150) //add to the end of the X-axis (-60 offsets the width of the text)
      .text("Manufacturer");

    axis = chart
      .append("text") //y-axis
      .attr("class", "axis-title") //Optional: change font size and font weight
      .attr("x", 10) //add some x padding to clear the y axis
      .attr("y", 25) //add some y padding to align the end of the axis with the text
      .text("CTY");

    // ============= ToolTip ============ //
    bars
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).style("stroke", "black");

        d3.select("#tooltip").style("display", "block").html(`
                            <h1 class="tooltip-title">${d.name}</h1>           
                            <div>Highway (HWY) MPG: ${d.value}</div>
                    `);
      })
      .on("mouseleave", (event) => {
        d3.select("#tooltip").style("display", "none");
        d3.select(event.currentTarget).style("stroke", "none");
      });
  });
})();
