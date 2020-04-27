var w = 800, h = 600;
var t0 = Date.now();

var planets = [
  { R: 300, r:  5, speed: 5, phi0: 90},
  { R: 150, r: 10, speed: 2, phi0: 190}
];

var svg = d3.select("#planetarium").insert("svg")
  .attr("width", w).attr("height", h);

svg.append("circle").attr("r", 20).attr("cx", w/2)
  .attr("cy", h/2).attr("class", "sun")

var container = svg.append("g")
  .attr("transform", "translate(" + w/2 + "," + h/2 + ")")

container.selectAll("g.planet").data(planets).enter().append("g")
  .attr("class", "planet").each(function(d, i) {
    d3.select(this).append("circle").attr("class", "orbit")
      .attr("r", d.R);
    d3.select(this).append("circle").attr("r", d.r).attr("cx",d.R)
      .attr("cy", 0).attr("class", "planet");
  });

d3.timer(function() {
  var delta = (Date.now() - t0);
  svg.selectAll(".planet").attr("transform", function(d) {
    return "rotate(" + d.phi0 + delta * d.speed/200 + ")";
  });
});