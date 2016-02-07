### What This Shows
Using data from the [US Census](http://www.ssa.gov/oact/babynames/limits.html), this visualization displays popular names that have historically been androgynous.

### Technical
Control points are not intersected by the path for several non-linear interpolations for lines ("basis" in this case). Because of this, point tracking for non-linear lines should be calculated from the svg-path rather than from the d3-scales. Mike Bostock has [two](http://bl.ocks.org/mbostock/8027637) [examples](http://bl.ocks.org/mbostock/8027835) showing how to do this with a single path. This gist shows one approach for point tracking with multiple paths. Other approaches are shown [here](http://bl.ocks.org/hwangmoretime/06af5f439f24bf28aec0) and [here](http://bl.ocks.org/hwangmoretime/da8e72b5e680c827d6dd).

This approach uses on-the-fly closestPoint to select both the line and point to highlight. Each move the mouse requires computing the distance to each point on the chart, thus the noted performance difference for differing number of lines shown. 