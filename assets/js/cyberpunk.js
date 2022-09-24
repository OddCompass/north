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
let formatTime = d3.timeFormat("%m/%d/%Y %H:%M");
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

const legend = mainG
  .append("g")
  .attr("transform", `translate(${WIDTH - 100},${HEIGHT - 100})`);

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

  //------------------------------tool tip ----------------------

  const focus = mainG
    .append("g")
    .attr("class", "focus")
    .style("display", "none");

  let focusCirc = focus.append("circle").attr("r", 5);
  let focusText = focus
    .append("text")
    .attr("x", -15)
    .attr("y", -8)
    .attr("text-anchor", "end");

  mainG
    .append("rect")
    .attr("width", WIDTH)
    .attr("height", HEIGHT)
    .attr("class", "overlay")
    .on("mouseover", () => focus.style("display", null))
    .on("mouseout", () => focus.style("display", "none"))
    .on("mousemove", popup);

  function popup(event) {
    let point = d3.pointer(event);
    const x0 = xScale.invert(point[0]);
    const y0 = yScale.invert(point[1]);

    const exactData = cleanData.filter((d) => {
      return d["time"].getTime() >= x0.getTime();
    });
    if (exactData.length > 0) {
      let exactPoint = exactData[0];

      focus.attr(
        "transform",
        `translate(${xScale(exactPoint["time"])},${yScale(
          exactPoint[currencyType]
        )})`
      );
      focusText.text(exactPoint[currencyType]);
    }
  }

  //------------------------toot tip ------------------------

  keys.forEach((d, i) => {
    let legendG = legend
      .append("g")
      .attr("transform", `translate(0,${i * 20})`);

    legendG
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("fill", colorScale(d))
      .attr("width", 10)
      .attr("height", 10);

    legendG
      .append("text")
      .attr("x", 25)
      .attr("y", 8)
      .style("text-transform", "uppercase")
      .text(d);
  });

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
