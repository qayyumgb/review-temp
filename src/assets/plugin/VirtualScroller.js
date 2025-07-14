function rebind(target, source) {
  var i = 1,
    n = arguments.length,
    method;
  while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
  return target;
};

function d3_rebind(target, source, method) {
  return function () {
    var value = method.apply(source, arguments);
    return value === source ? target : value;
  };
}


var lastclickpos = null;
var lastclickpos_c = null;
var gdelta = null;

d3VirtualScroller = function () {

  var enter = null,
    update = null,
    exit = null,
    data = [],
    dataid = null,
    svg = null,
    viewport = null,
    totalRows = 0,
    position = 0,
    rowHeight = 33,
    totalHeight = 0,
    minHeight = 0,
    viewportHeight = 0,
    visibleRows = 0,
    delta = 0,
    dispatch = d3.dispatch("pageDown", "pageUp"),
    tname = 0;

  function virtualscroller(container) {


    function render(resize) {
      if (resize) {                                                                      // re-calculate height of viewport and # of visible row
        viewportHeight = parseInt(viewport.style("height"));
        visibleRows = Math.ceil(viewportHeight / rowHeight) + 1;                       // add 1 more row for extra overlap; avoids visible add/remove at top/bottom 
      }
      var scrollTop = viewport.node().scrollTop;

      totalHeight = Math.max(minHeight, (totalRows * rowHeight));
      svg.style("height", totalHeight + "px")                                            // both style and attr height values seem to be respected
        .attr("height", totalHeight);
      var lastPosition = position;
      position = Math.floor(scrollTop / rowHeight);
      delta = position - lastPosition;

      scrollRenderFrame(position);
    }

    function onGridClick(e) {


      d = d3.select(this).datum();

      //setClock(d.isin,  d.deg * 360 / 100, d.company + " (" + d.ticker + ")" + " [" + d3.format(".1f")(d.score) + "]");


    }

    function scrollRenderFrame(scrollPosition) {
      container.attr("transform", "translate(-20," + (scrollPosition * rowHeight) + ")");   // position viewport to stay visible
      var position0 = Math.max(0, Math.min(scrollPosition, totalRows - visibleRows + 1)), // calculate positioning (use + 1 to offset 0 position vs totalRow count diff)
        position1 = position0 + visibleRows;

      container.each(function () {
        // slice out visible rows from data and display
        var space = 0;
        var rowSelection = container.selectAll(".row")
          .data(data.slice(position0, Math.min(position1, totalRows)), dataid);
        rowSelection.exit().call(exit).remove();
        rowSelection.enter().append("g")
          .attr("class", function (d) { return (selcompany!= undefined && d.isin === selcompany.isin) ? "row gridselcomp" : "row" })
          .on("click", onGridClick)
          .on("mouseover", function (d) {

            if (selcompany != undefined && d.isin === selcompany.isin) {
              //  console.log(d.isin + " -- " + selcompany.isin);
              d3.select("#cSlider").select(".sRect1").style("opacity", "1");
              d3.select("#cSlider").select(".sRect").style("opacity", "1");
              d3.select("#cSlider").select(".sText").style("opacity", "1");

              d3.select("#cSlider").select(".sRectCompare").style("opacity", "1");
              d3.select("#cSlider").select(".sRectCompareOverlay").style("opacity", "1");
              d3.select("#cSlider").select(".sTextReverse").style("opacity", "1");
            }
            else {
              // console.log(d.isin + " -|- " + selcompany.isin);
              //d3.select("#cSlider").select(".sRect1").style("opacity", "0.02");
              //d3.select("#cSlider").select(".sRect").style("opacity", "0.02");
              //d3.select("#cSlider").select(".sText").style("opacity", "0.02");
              //d3.select("#cSlider").select(".sRectCompare").style("opacity", "0.02");
              //d3.select("#cSlider").select(".sRectCompareOverlay").style("opacity", "0.02");
              //d3.select("#cSlider").select(".sTextReverse").style("opacity", "0.02");
            }
          })
          .on("mouseout", function (d) {

            d3.select("#cSlider").select(".sRect1").style("opacity", "1");
            d3.select("#cSlider").select(".sRect").style("opacity", "1");
            d3.select("#cSlider").select(".sText").style("opacity", "1");
            d3.select("#cSlider").select(".sRectCompare").style("opacity", "1");
            d3.select("#cSlider").select(".sRectCompareOverlay").style("opacity", "1");
            d3.select("#cSlider").select(".sTextReverse").style("opacity", "1");

          })
          .call(enter);
        rowSelection.order();
        var rowUpdateSelection = container.selectAll(".row:not(.transitioning)");       // do not position .transitioning elements
        rowUpdateSelection.call(update);

        rowUpdateSelection.each(function (d, i) {
          d3.select(this).attr("transform", function (d) {
            return "translate(0," + ((i * rowHeight)) + ")";
          });
        });

      });
      /*
      if (position1 > (data.length - visibleRows)) {                                      // dispatch events
          dispatch.pageDown({
              delta: delta
          });
      } else if (position0 < visibleRows) {
          dispatch.pageUp({
              delta: delta
          });
      }
      */
    }



    virtualscroller.render = render;                                                        // make render function publicly visible
    viewport.on("scroll.virtualscroller", function () {
      render();
      if (tname=== "1") {
        lastclickpos_c = viewport.node().scrollTop;
      }
      else {
        lastclickpos = viewport.node().scrollTop;
      }
    });                                          // call render on scrolling event
    render(true);

    if (tname === 1) {
      var sort_C = 0;
      if (selcompany != undefined) { sort_C = selcompany.sort_C } else { sort_C = 0;}
      var k = ((sort_C) - 5) * rowHeight;
      if (lastclickpos_c !== null) {
        if ((lastclickpos_c <= sort_C * rowHeight) && (sort_C * rowHeight <= (parseInt(lastclickpos) + parseInt(rowHeight * 10)))) {
          viewport.node().scrollTop = lastclickpos;
        }
        else {
          viewport.node().scrollTop = k;
        }
      }
      lastclickpos_c = viewport.node().scrollTop; 
    } else { 
      var k1 = ((selcompany.sort) - 5) * rowHeight; 
      if (lastclickpos !== null) {
        if ((lastclickpos <= selcompany.sort * rowHeight) && (selcompany.sort * rowHeight <= (parseInt(lastclickpos) + parseInt(rowHeight * 10)))) {
          viewport.node().scrollTop = lastclickpos;
        }
        else {
          viewport.node().scrollTop = k1;
        }
      }
      lastclickpos = viewport.node().scrollTop; 
    }
    // render();  

  }

  virtualscroller.render = function (resize) {                                                 // placeholder function that is overridden at runtime
  };

  virtualscroller.data = function (_, __) {
    if (!arguments.length) return data;
    data = _;
    dataid = __;
    return virtualscroller;
  };

  virtualscroller.dataid = function (_) {
    if (!arguments.length) return dataid;
    dataid = _;
    return virtualscroller;
  };

  virtualscroller.enter = function (_) {
    if (!arguments.length) return enter;
    enter = _;
    return virtualscroller;
  };

  virtualscroller.update = function (_) {
    if (!arguments.length) return update;
    update = _;
    return virtualscroller;
  };
  virtualscroller.selcompany = function (_) {
    if (!arguments.length) return selcompany;
    selcompany = _;
    return virtualscroller;
  };


  virtualscroller.exit = function (_) {
    if (!arguments.length) return exit;
    exit = _;
    return virtualscroller;
  };

  virtualscroller.totalRows = function (_) {
    if (!arguments.length) return totalRows;
    totalRows = _;
    return virtualscroller;
  };

  virtualscroller.rowHeight = function (_) {
    if (!arguments.length) return rowHeight;
    rowHeight = +_;
    return virtualscroller;
  };

  virtualscroller.totalHeight = function (_) {
    if (!arguments.length) return totalHeight;
    totalHeight = +_;
    return virtualscroller;
  };

  virtualscroller.minHeight = function (_) {
    if (!arguments.length) return minHeight;
    minHeight = +_;
    return virtualscroller;
  };

  virtualscroller.position = function (_) {
    if (!arguments.length) return position;
    position = +_;
    if (viewport) {
      viewport.node().scrollTop = position;
    }
    return virtualscroller;
  };

  virtualscroller.svg = function (_) {
    if (!arguments.length) return svg;
    svg = _;
    return virtualscroller;
  };

  virtualscroller.viewport = function (_) {
    if (!arguments.length) return viewport;
    viewport = _;
    return virtualscroller;
  };

  virtualscroller.tname = function (_) {
    if (!arguments.length) return tname;
    tname = _;
    return virtualscroller;
  };

  virtualscroller.delta = function () {
    return delta;
  };

  rebind(virtualscroller, dispatch, "on");

  return virtualscroller;
};
