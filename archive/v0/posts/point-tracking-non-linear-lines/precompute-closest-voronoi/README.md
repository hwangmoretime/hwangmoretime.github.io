### What This Shows
Using data from the [US Census](http://www.ssa.gov/oact/babynames/limits.html), this visualization displays popular names that have historically been androgynous.

### Technical
Control points are not intersected by the path for several non-linear interpolations for lines ("basis" in this case). Because of this, point tracking for non-linear lines should be calculated from the svg-path rather than from the d3-scales. Mike Bostock has [two](http://bl.ocks.org/mbostock/8027637) [examples](http://bl.ocks.org/mbostock/8027835) showing how to do this with a single path. This gist shows one approach for point tracking with multiple paths. Other approaches are shown [here](http://bl.ocks.org/hwangmoretime/06af5f439f24bf28aec0) and [here](http://bl.ocks.org/hwangmoretime/06aa7e108b77745f1f24).

This approach saves precomputed closestPoints of each data point's linear coordinates respective to their parent path. The precomputation took 63.85 seconds (~0.16 seconds per point). What still remains for this gist is to automatically generate a precomputation file; it was manually constructed for this dataset. 