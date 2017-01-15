<script>
  var width = 960,
      height = 500,
      trianglesAcross = 25; // # of triangles on the top row
  var color = d3.scale.linear()
    .domain([0, 1])
    // .range(["#1c9099", "#ece2f0"])
    .range(["#1c9099", "#1c9090"])
    .interpolate(d3.interpolateLab);
  var svg = d3.select("#tesselation").append("svg")
    .attr("width", width)
    .attr("height", height);
  svg.call(draw, function(d) { return proximity(d, width/2, height/2)});
  var inverse = false;
  svg
    .on("mousemove", mousemove)
    .on("click", click);
  function mousemove() {
    var mouse = d3.mouse(this)
    svg.call(draw, function(d) {
      return inverse ?
        inverseProximity(d, mouse[0], mouse[1]) :
        proximity(d, mouse[0], mouse[1]);
    });
  }
  function click() {
    var mouse = d3.mouse(this)
    inverse = !inverse;
    svg
      .on("mousemove", null)
      .call(draw, function(d) {
        return inverse ?
          inverseProximity(d, mouse[0], mouse[1]) :
          proximity(d, mouse[0], mouse[1]);
      }, 1000);
    // Hacky way of preventing "mousemove" from interrupting animation
    setTimeout(function() {
      svg.on("mousemove", mousemove);
    }, 1000);
  }
  function proximity(d, x, y) {
    var dist = 1 - Math.sqrt(Math.pow(d.cx - x, 2) + Math.pow(d.cy - y, 2))/width;
    return Math.pow(dist, 6);
  }
  function inverseProximity(d, x, y) {
    var dist = Math.sqrt(Math.pow(d.cx - x, 2) + Math.pow(d.cy - y, 2))/width;
    return Math.pow(dist, 2);
  }
  function draw(selection, area, duration) {
    if (duration === undefined) duration = 0;
    var data = createTriangleData(width, height, trianglesAcross, area);
    var triangles = selection.selectAll("path").data(data);
    triangles.enter().append("path");
    triangles
      .transition().duration(duration)
      .attr("d", trianglePath)
      .style("fill", function(d) { return color(d.p); });
    triangles.exit().remove();
  }
  function trianglePath(d) {
    var alpha = Math.sqrt(d.p * Math.pow(d.alpha, 2)),
        ri = alpha * Math.sqrt(3) / 6,
        rc = alpha / Math.sqrt(3);
    var points = null;
    if (d.pointing == "up") {
      points = [
        [d.cx - alpha/2, d.cy - ri],
        [d.cx, d.cy + rc],
        [d.cx + alpha/2, d.cy - ri]
      ];
    }
    else if (d.pointing == "down") {
      points = [
        [d.cx - alpha/2, d.cy + ri],
        [d.cx + alpha/2, d.cy + ri],
        [d.cx, d.cy - rc]
      ];
    }
    return d3.svg.line()(points);
  }
  function createTriangleData(width, height, trianglesAcross, area) {
    // Source of geometric definitions:
    // https://en.wikipedia.org/wiki/Equilateral_triangle
    var alpha = width/trianglesAcross,  // maximum side length
        ri = alpha * Math.sqrt(3) / 6,  // maximum radius of inscribing circle
        rc = alpha / Math.sqrt(3);      // maximum radius of circumscribing circle
    var data = [];
    // Upward pointing triangles
    for (var x = alpha/2; x <= (width + alpha); x += alpha) {
      for (var y = ri, i = 0; y <= (height + alpha); y += (ri+rc), i++) {
        data.push({
          cx: x - (i % 2 == 0 ? 0 : alpha/2),
          cy: y,
          pointing: "up",
          alpha: alpha
        });
      }
    }
    // Downward pointing triangles
    for (var x = 0; x <= (width + alpha); x += alpha) {
      for (var y = rc, i = 0; y <= (height + alpha); y += (ri+rc), i++) {
        data.push({
          cx: x - (i % 2 == 0 ? 0 : alpha/2),
          cy: y,
          pointing: "down",
          alpha: alpha
        });
      }
    }
    // p in [0, 1] maps the triangle's area from 0 to its maximum area
    data = data.map(function(d) { d.p = area(d); return d; });
    return data;
  }
</script>
