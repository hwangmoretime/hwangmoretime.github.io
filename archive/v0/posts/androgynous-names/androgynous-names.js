
require(['util'], function (util) {
    var years,
        yearFormat = d3.time.format("%Y");

    var margin = {top: 20, right: 30, bottom: 140, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category20();

    var voronoi = d3.geom.voronoi()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); })
        .clipExtent([[-margin.left, -margin.top], [width + margin.right, height]]);

    var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("/posts/androgynous-names/points.json", function(error_json, points) {
      d3.csv("/posts/androgynous-names/steady_andro.csv", csvTransformer, function(error, androgs) {
        renderData(points, error_json, androgs);
      });
    });

    function csvTransformer(d, i) {
      if (!i) years = Object.keys(d).map(yearFormat.parse).filter(Number);
      var androg = {
        year_starting_steady_decade: yearFormat.parse(d.year_starting_steady_decade),
        name: d.name.replace(/ (msa|necta div|met necta|met div)$/i, ""),
        values: null
      };
      androg.values = years.map(function(m) {
        return {
          androg: androg,
          date: m,
          value: d[yearFormat(m)]
        };
      });
      return androg;
    }

    function renderData(points, werePointsPrecomputed, androgs) {
      x.domain(d3.extent(years));
      y.domain([0, d3.max(androgs, function(c) { return d3.max(c.values, function(d) { return d.value; }); })]).nice();

      DECADES_SHOWN = 5;
      svg.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.svg.axis()
            .scale(x)
            .ticks(DECADES_SHOWN)
            .orient("bottom"));

      svg.append("g")
          .attr("class", "axis axis--y")
          .call(d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10, "%"))
        .append("text")
          .attr("x", 4)
          .attr("dy", ".32em")
          .style("font-weight", "bold")
          .text("Percent Female");

      svg.append("g")
          .attr("class", "androgs")
        .selectAll("path")
          .data(androgs, function(d) { return d.name; })
        .enter().append("path")
          .attr("name", function(d) { return d.name; })
          .attr("class", "androg--path")
          .attr("d", function(d) { d.line = this;
                                   return line(d.values);});

      var focus = svg.append("g")
          .attr("transform", "translate(-100,-100)")
          .attr("class", "focus");

      focus.append("circle")
          .attr("r", 3.5);

      focus.append("text")
          .attr("y", -10);

      var keyFunction = null;
      if (werePointsPrecomputed !== null && werePointsPrecomputed.status == 404) {
        voronoi
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.value); });

        keyFunction = function(d) {
          var p = util.closestPoint(d.androg.line, [x(d.date), y(d.value)]);
          console.log(d.androg.name, getUTCStringNoTime(d.date), p);
          d.p = p;
          return p[0] + "," + p[1];
        };
      } else {
        voronoi
            .x(function(d) { return points[d.androg.name][getUTCStringNoTime(d.date)].x; })
            .y(function(d) { return points[d.androg.name][getUTCStringNoTime(d.date)].y;});

        keyFunction = function(d) {
          var x = points[d.androg.name][getUTCStringNoTime(d.date)].x;
          var y = points[d.androg.name][getUTCStringNoTime(d.date)].y;
          d.p = [x, y];
          return x + "," + y;
        };
      }

      var voronoiGroup = svg.append("g")
          .attr("class", "voronoi");

      voronoiGroup.selectAll("path")
          .data(voronoi(d3.nest()
              .key(function(d) { return keyFunction(d); })
              .rollup(function(v) { return v[0]; })
              .entries(d3.merge(androgs.map(function(d) { return d.values; })))
              .map(function(d) { return d.values; })))
        .enter().append("path")
          .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
          .attr("name", function(d) { return d.point.androg.name; })
          .attr("year", function(d) { return d.point.date.getFullYear(); })
          .datum(function(d) { return d.point; })
          .on("mouseover", voronoiMouseover)
          .on("mouseout", voronoiMouseout);

      function voronoiMouseover(d) {
        d3.select(d.androg.line).classed("androg--hover", true);
        d.androg.line.parentNode.appendChild(d.androg.line);
        focus.attr("transform", "translate(" + d.p[0] + "," + d.p[1] + ")");
        focus.select("text").text(d.androg.name + ": " + d.value.slice(0, 4));

        highlightRectName(d.androg.name);
      }

      function voronoiMouseout(d) {
        removeAllHighlights();
      }

      // rectangles
      var tick_years = x.ticks(DECADES_SHOWN);
      var distance_between_ticks = x(tick_years[1]) - x(tick_years[0]);
      var BUFFER_BETWEEN_RECTS = 2;
      var RECT_INNER_BORDER_BUFFER = 3;
      var named_nested_by_decade = d3.nest()
          .key(function(d) { return d.year_starting_steady_decade.getFullYear(); })
          .entries(androgs);

      var interactive_rects_group = svg.append("g")
          .attr("class", "axis axis--rect");
      var interactive_rects = interactive_rects_group.selectAll(".interactive_rects")
          .data(named_nested_by_decade)
        .enter().append("g");

      var rectangles = interactive_rects.append("rect")
          .attr("x", function(d) {
              d.key_datetime = yearFormat.parse(d.key);
              return getRectX(d.key_datetime);
            })
          .attr("y", getRectY())
          .attr("width", getRectWidth())
          .attr("height", function(d) { return getRectHeight(d); })
          .attr("year", function(d) { return d.key; })
          .attr("classed", "axis--rect")
          .on("mouseover", rectMouseover)
          .on("mouseout", rectMouseout);

      var rectangle_text_parents = interactive_rects.append("text")
          .attr("x", function(d) { return getRectX(d.key_datetime); })
          .attr("y", getRectY())
          .attr("transform", "translate(" + (getRectWidth() / 2) + "," + RECT_INNER_BORDER_BUFFER + ")")
          .style("text-anchor", "middle");

      var rectange_text_tspans = rectangle_text_parents.selectAll("tspan")
          .data(function(d) {return d.values; })
        .enter().append("tspan")
          .attr("x", function(d) { return getRectX(d.year_starting_steady_decade); })
          .attr("dy", "11")
          .on("mouseover", rectTextMouseover)
          .on("mouseout", rectTextMouseout)
          .text(function(d) {return d.name;} );

      function getRectX(d_datetime) {
        return Math.floor(x(d_datetime) + BUFFER_BETWEEN_RECTS);
      }

      function getRectY() {
        return height + margin.bottom/5;
      }

      function getRectWidth() {
        return Math.floor(distance_between_ticks - BUFFER_BETWEEN_RECTS);
      }

      function getRectHeight(d) {
        return 11*d.values.length + 3*RECT_INNER_BORDER_BUFFER;
      }

      function getNamesFromListOfNameObjs(list_of_name_objs) {
        return list_of_name_objs.map(function(value) { return value.name; });
      }

      function rectMouseover(d) {
        d3.selectAll(".androg--path")
            .data(d.values, function(d_val) { return d_val.name; })
            .classed("androg--hover", true);
      }

      function rectMouseout(d) {
        removeAllHighlights();
      }

      function rectTextMouseover(d) {
        highlightRectName(d.name);

        // get the corresponding voronoi to current highlighted text
        middle_of_current_decade = d.year_starting_steady_decade.getFullYear() + 5;
        target_voronoi_sel = d3.selectAll(".voronoi path")
            .filter(function(voronoi_d) { return voronoi_d.androg.name == d.name; })
            .filter(function(voronoi_d) { return middle_of_current_decade == voronoi_d.date.getFullYear(); });

        voronoiMouseover(target_voronoi_sel[0][0].__data__);
      }

      function rectTextMouseout(d) {
        removeAllHighlights();
      }

      function removeAllHighlights() {
        d3.selectAll(".androg--path")
            .classed("androg--hover", false);

        d3.selectAll(".axis--rect--text")
            .classed("axis--rect--text", false);

        focus.attr("transform", "translate(-100,-100)");
      }

      function highlightRectName(name) {
        d3.selectAll("tspan")
            .filter(function(tspan_d) { return tspan_d.name === name; })
            .classed("axis--rect--text", true);
      }

      function getUTCStringNoTime(js_date) {
        return js_date.toUTCString().split(' ').slice(0,4).join(' ');
      }
    }
});
