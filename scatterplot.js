(function () {
  var width = 800,
    height = 600;
  d3.json("./coins.json").then((data) => {
    data = data.bitcoin.filter((d) => {
      return d.price_usd;
    });
    var parseTime = d3.timeParse("%d/%m/%Y");

    data.forEach(function (d) {
      d.date = parseTime(d.date);
      d.price_usd = +d.price_usd;
    });
    function sortByDateAscending(a, b) {
      return a.date - b.date;
    }
    data = data.sort(sortByDateAscending);

    const x = d3
      .scaleTime() //a scale to convert time to x-position
      .domain(
        d3.extent(data, function (d) {
          return d.date;
        })
      ) //min to max date
      .range([0, width]); //from 0px to full width of page

    const y = d3
      .scaleLinear() //a scale to convert count to y-position
      .domain(
        d3.extent(data, function (d) {
          return d.price_usd;
        })
      )
      .range([height, 0]); //from the bottom of the page to the top of the page

    const lineGenerator = d3
      .line()
      .x(function (d, i) {
        return x(d.date); //use our x scale on the index
      })
      .y(function (d) {
        return y(d.price_usd); //use our y scale on the y value from data
      });
    var svg = d3
      .select("#scatterplot")
      .append("g")
      .attr("transform", "translate(50, 50)");
    const line = lineGenerator(data);
    svg //add the linegraph
      .selectAll("path")
      .data(data)
      .join("path")
      .attr("d", line)
      .attr("fill", "white")
      .attr("stroke-width", "3px")
      .attr("stroke", "red");

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));
  });
})();
