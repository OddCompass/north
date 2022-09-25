const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 };
const WIDTH = 960 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 800 - MARGIN.TOP - MARGIN.BOTTOM;

const canvas = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

const mainG = canvas
  .append("g")
  .attr("transform", `translate(${MARGIN.LEFT},${MARGIN.TOP})`);

const xScale = d3
  .scaleBand()
  .range([0, WIDTH])
  .paddingInner(0.3)
  .paddingOuter(0.2);

const yScale = d3.scaleLinear().range([HEIGHT, 0]);
const colorScale = d3.scaleOrdinal(d3.schemeDark2);

const xAxisCall = d3.axisBottom(xScale);
const yAxisCall = d3.axisLeft(yScale).tickFormat((d) => `${d}%`);

const yAxisGroup = mainG.append("g");
const xAxisGroup = mainG
  .append("g")
  .attr("transform", `translate(${0}, ${HEIGHT})`);

const xAxisLabel = mainG
  .append("text")
  .attr("x", WIDTH / 2)
  .attr("y", HEIGHT + 60)
  .attr("font-size", 25)
  .attr("text-anchor", "middle")
  .text("Months");

const yAxisLabel = mainG
  .append("text")
  .attr("y", -60)
  .attr("x", -HEIGHT / 2)
  .attr("font-size", 25)
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)");

const parseTime = d3.timeParse("%b/%Y");
let cleanData;
let year = 2022;
let cat = "Total";
let keys;
d3.csv("../assets/data/my-cpi.csv").then((data) => {
  data.forEach((d) => {
    d["Year"] = Number(d["Year"]);
    d["Time"] = d["Month"] + "/" + d["Year"];
    d["Time"] = parseTime(d["Time"]);
    d["Total"] = Number(d["Total"]);
    d["HWEGO"] = Number(d["Housing, Water, Electricity, Gas & Other Fuels"]);
    d["FNAB"] = Number(d["Food & Non-Alcoholic Beverages"]);
    d["CF"] = Number(d["Clothing & Footwear"]);
    d["FHR"] = Number(
      d["Furnishings, Household Equipment & Routine Household Maintenance"]
    );
    d["Health"] = Number(d["Health"]);
    d["Transport"] = Number(d["Transport"]);
    d["Communication"] = Number(d["Communication"]);
    d["RSC"] = Number(d["Recreation Services & Culture"]);
    d["Education"] = Number(d["Education"]);
    d["RH"] = Number(d["Restaurants & Hotels"]);
    d["MGS"] = Number(d["Miscellaneous Goods & Services"]);
  });
  keys = [
    "Total",
    "HWEGO",
    "FNAB",
    "CF",
    "FHR",
    "Health",
    "Transport",
    "Communication",
    "RSC",
    "Education",
    "RH",
    "MGS",
  ];
  cleanData = data;
  genUpdateChart();
});

function genUpdateChart() {
  let filterData = cleanData.filter((d) => {
    return d["Year"] == year;
  });
  xScale.domain(filterData.map((d) => d["Month"]));
  yScale.domain(d3.extent(filterData, (d) => d[cat]));
  colorScale.domain(keys);
  xAxisGroup.transition().duration(750).call(xAxisCall);
  yAxisGroup.transition().duration(750).call(yAxisCall);

  const rects = mainG.selectAll("rect").data(filterData, (d) => d["Month"]);

  rects
    .exit()
    .transition()
    .attr("y", (d) => yScale(0))
    .attr("height", 0)
    .duration(750)
    .remove();

  rects
    .transition()
    .duration(750)
    .attr("x", (d) => xScale(d["Month"]))
    .attr("y", (d) => yScale(d[cat]))
    .attr("width", xScale.bandwidth)
    .attr("height", (d) => HEIGHT - yScale(d[cat]))
    .attr("fill", colorScale(cat));

  rects
    .enter()
    .append("rect")
    .attr("y", (d) => yScale(0))
    .attr("height", 0)
    .transition()
    .duration(750)
    .attr("x", (d) => xScale(d["Month"]))
    .attr("y", (d) => yScale(d[cat]))
    .attr("width", xScale.bandwidth)
    .attr("height", (d) => HEIGHT - yScale(d[cat]))
    .attr("fill", colorScale(cat));

  yAxisLabel.text("Inflation Rate");
}

$("#year").on("change", (event) => {
  let yearTarget = event.currentTarget;
  year = yearTarget.value;
  genUpdateChart();
});

$("#category").on("change", (event) => {
  let catTarget = event.currentTarget;
  cat = catTarget.value;
  genUpdateChart();
});
