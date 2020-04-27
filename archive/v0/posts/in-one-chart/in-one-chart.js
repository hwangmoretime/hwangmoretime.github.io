var margin = {top: 40, right: 20, bottom: 100, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], 0.1);

var y = d3.scale.ordinal()
    .rangeRoundBands([height, 0], 0.1);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var embed_tweets = d3.select("body").append("g")
    .attr("id", 'embed_container');


d3.json("/posts/in-one-chart/inonechart2.json", function(error, data) {
  // cleaning data. d3.json() does not have any accessor methods (e.g. type(d))
  var data_keys = Object.keys(data),
      dates = [],
      date_strs = [];
  for (var i = data_keys.length - 1; i >= 0; i--) {
    dates[i] = convertDateToUTC(new Date(data_keys[i]));
  }
  dates.sort(function(a,b) { return a.getTime() - b.getTime(); });
  date_strs = dates.map(function(d) { return jsdateToKey(d); } );
  x.domain(date_strs);

  var y_domain = [],
      sizes = data_keys.map(function(d) { return data[d].length; });
      max_size = d3.max(sizes);
  while(max_size--) y_domain[max_size] = max_size;
  y.domain(y_domain);

  // flatten out data
  var temp_data = [];
  for (var i = data_keys.length - 1; i >= 0; i--) {
    for (var j = data[data_keys[i]].length - 1; j >= 0; j--) {
      var doc = data[data_keys[i]][j];
      doc['data_key'] = data_keys[i];
      doc['created_at'] = convertDateToUTC(new Date(Date.parse(doc['created_at'])));
      temp_data.push(doc);
     }
  }
  data = temp_data;
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
        .selectAll("text")
        .text(function(d) { return d.substring(5,d.length).replace('-', '/'); });

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Charts that day");

  svg.selectAll("image")
      .data(data)
    .enter().append("svg:image")
      .attr("class", "twitter-pic")
      .attr("xlink:href", function(d) { return d.media[0].media_url_https; })
      .attr("x", function(d) { return x(d.data_key); })
      .attr("y", function(d) { return height - (sizes[data_keys.indexOf(d.data_key)]-- * y.rangeBand()); })
      .attr("width", x.rangeBand())
      .attr("height", y.rangeBand());
      //.on('mouseover', function(d) { mouseOver(d); })
});

function mouseOver(d) {
  var iframe =  d3.selectAll('iframe')
      .data(d);
    
  iframe.exit().remove();

  twttr.ready(function() {
    twttr.widgets.createTweet(d.id_str, document.getElementById('embed_container'), {'align': 'right', 'width': '300' });
  });
}

function convertDateToUTC(date) {
  // call this only once per date. successive calls will result in (n_calls - 1) too many offsets
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
}

function jsdateToKey(date) {
  // note that this does not call UTC versions of the getters. do any conversinos before calling this
  return date.getFullYear().toString() + '-' +  pad(date.getMonth()+1, 2) + '-' + pad(date.getDate(), 2);
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
