const timeParse = d3.timeParse("%d/%m/%Y");
const timeFormat = d3.timeFormat("%d/%m/%Y");

const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 };
const WIDTH = 750 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 600 - MARGIN.TOP - MARGIN.BOTTOM;

const svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

const mainG = svg
  .append("g")
  .attr("transform", `translate(${MARGIN.LEFT},${MARGIN.TOP})`);

const xScale = d3.scaleTime().range([0, WIDTH]);
const yScale = d3.scaleLinear().range([HEIGHT, 0]);

const xAxisCall = d3.axisBottom(xScale);
const yAxisCall = d3.axisLeft(yScale);

const xAxisG = mainG.append("g").attr("transform", `translate(0,${HEIGHT})`);
const yAxisG = mainG.append("g");

//.y((d) => yScale(d["24h_vol"]));

const path = mainG
  .append("path")
  .attr("stroke", "grey")
  .attr("stroke-width", 3)
  .attr("fill", "none");

let coinFilter = "bitcoin";
let dataFilter = "24h_vol";

let minTime = timeParse("12/5/2013").getTime();
let maxTime = timeParse("30/10/2017").getTime();

const lineDraw = d3
  .line()
  .x((d) => xScale(d["date"]))
  .y((d) => yScale(d[dataFilter]));

let cleanData;
d3.json("../assets/data/coins.json")
  .then((data) => {
    //console.log(data);
    Object.entries(data).forEach(([k, v]) => {
      //console.log(k);
      //console.log(v);
      v.forEach((d) => {
        d["24h_vol"] = Number(d["24h_vol"]);
        d["market_cap"] = Number(d["market_cap"]);
        d["price_usd"] = Number(d["price_usd"]);
        d["date"] = timeParse(d["date"]);
      });
    });
    cleanData = data;
    console.log(data);
    update();
  })
  .catch((error) => {
    console.log(error);
  });

function update() {
  //let minTime = $("#start-date").text();
  //let maxTime = $("#end-time").text();
  let t = d3.transition().duration(1000);
  let filterData = cleanData[coinFilter];
  let timeData = filterData.filter((d) => {
    return d["date"] >= minTime && d["date"] <= maxTime;
  });
  //console.log(minTime);

  xScale.domain([
    d3.min(filterData, (d) => d["date"]),
    d3.max(filterData, (d) => d["date"]),
  ]);
  yScale.domain(d3.extent(filterData, (d) => d[dataFilter]));

  xAxisG.transition(t).call(xAxisCall);
  yAxisG.transition(t).call(yAxisCall);

  path.transition(t).attr("d", lineDraw(timeData));
}

$("#coin-filter").on("change", (event) => {
  let coin = event.currentTarget;
  coinFilter = coin.value;
  update();
});

$("#data-filter").on("change", (event) => {
  let data = event.currentTarget;
  dataFilter = data.value;
  update();
});

$("#year-slider").slider({
  min: timeParse("12/5/2013").getTime(),
  max: timeParse("30/10/2017").getTime(),
  step: 86400000,
  range: true,
  values: [timeParse("12/5/2013").getTime(), timeParse("30/10/2017").getTime()],
  slide: (event, ui) => {
    minTime = ui.values[0];
    maxTime = ui.values[1];
    $("#start-date").text(timeFormat(new Date(minTime)));
    $("#end-time").text(timeFormat(new Date(maxTime)));
    update();
    //console.log(ui.values[0]);
    // console.log(ui.values[1]);
  },
});
