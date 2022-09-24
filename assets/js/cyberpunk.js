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

let parseTime = d3.timeParse("%m/%d/%Y %H:%M");
let currencyType = "us";

const xScale = d3.scaleTime().range([0, WIDTH]);
const yScale = d3.scaleLinear().range([HEIGHT, 0]);
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const xAxisCall = d3.axisBottom(xScale).ticks(12);
const yAxisCall = d3.axisLeft(yScale).tickFormat(d3.format("$"));

const xAxisG = mainG.append("g").attr("transform", `translate(0, ${HEIGHT})`);
const yAxisG = mainG.append("g");

const xAxisLabel = mainG
  .append("text")
  .attr("x", WIDTH / 2)
  .attr("y", HEIGHT + 80)
  .attr("text-anchor", "middle")
  .attr("font-size", 25)
  .text("Months");

const yAxisLabel = mainG
  .append("text")
  .attr("x", -HEIGHT / 2)
  .attr("y", -50)
  .attr("font-size", 25)
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .style("text-transform", "capitalize");

let lineDraw = d3
  .line()
  .x((d) => xScale(d["time"]))
  .y((d) => yScale(d[currencyType]));

let linePath = mainG
  .append("path")
  .attr("fill", "none")
  .attr("stroke-width", 3);

let cleanData;
let keys;
d3.csv("../assets/data/cyberpunk-2077.csv").then((data) => {
  data.forEach((d) => {
    d["time"] = parseTime(d["DateTime"]);
    d["rm"] = Number(d["Final price(RM)"]);
    d["us"] = Number(d["Final price(USD)"]);
    d["uk"] = Number(d["Final price(UK)"]);
    d["rs"] = Number(d["Final price(RS)"]);
    d["eu"] = Number(d["Final price(EU)"]);
  });
  cleanData = data;
  keys = ["us", "uk", "eu", "rs", "rm"];
  updateChart();
});

function updateChart() {
  const t = d3.transition().duration(1000);

  xScale.domain(d3.extent(cleanData, (d) => d["time"]));
  let currencyMin = d3.min(cleanData, (d) => d[currencyType]);
  let currencyMax = d3.max(cleanData, (d) => d[currencyType]);
  yScale.domain([
    currencyMin - 0.4 * currencyMin,
    currencyMax + 0.2 * currencyMax,
  ]);
  colorScale.domain(keys);

  xAxisG
    .call(xAxisCall)
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .attr("x", -10)
    .attr("y", 5)
    .attr("text-anchor", "end");
  yAxisG.transition(t).call(yAxisCall);
  yAxisLabel.text(`Price (${currencyType})`);
  linePath
    .transition(t)
    .attr("d", lineDraw(cleanData))
    .attr("stroke", colorScale(currencyType));
}

$("#currency").on("change", (event) => {
  let currency = event.currentTarget;
  currencyType = currency.value;
  updateChart();
});
