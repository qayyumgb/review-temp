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

var portfolioVirtualScroller = function () {
  var enter = null,
    update = null,
    exit = null,
    data = [],
    dataid = null,
    svg = null,
    viewport = null,
    totalRows = 0,
    position = 0,
    svgID = null,
    rowHeight = 36,
    UserSelectedDates = [],
    totalHeight = 0,
    minHeight = 0,
    viewportHeight = 0,
    visibleRows = 10,
    delta = 0,
    dispatch = d3.dispatch("pageDown", "pageUp").
      tname = 0;

  function virtualscroller(container) {
    var scrollTop = viewport.node().scrollTop;

    function render(resize) {
      if (resize) {
        viewportHeight = parseInt(viewport.select("g").attr("height"));
        //  visibleRows = Math.ceil(viewportHeight / rowHeight) + 1;
        //console.log(viewportHeight);
      }



      // var scrollTop =  -(svg.select("rect").attr("y"));
      var svgTrans = svg.attr("transform");
      //var scrollTop = 0;
      if (svgTrans != null) {
        var translate = svgTrans.substring(svgTrans.indexOf("("), svgTrans.indexOf(")")).split(",");
        //console.log(translate);
        scrollTop = -translate[1];
      }

      totalHeight = Math.max(minHeight, (totalRows * rowHeight));
      svg.select("rect").style("height", totalHeight + "px")                                            // both style and attr height values seem to be respected
        .attr("height", totalHeight);
      var lastPosition = position;
      position = Math.floor(scrollTop / rowHeight);
      delta = position - lastPosition;
      scrollRenderFrame(position, scrollTop);


    }

    function onGridClick(e) {
      var d = d3.select(this).datum();
      //setClock(d.isin,  d.deg * 360 / 100, d.company + " (" + d.ticker + ")" + " [" + d3.format(".1f")(d.score) + "]");
    }

    function scrollRenderFrame(scrollPosition, scrollTop) {

      if (svgID == "TabRtnPort") { visibleRows = 10; } else { visibleRows = 10; }

      var position0 = Math.max(0, Math.min(scrollPosition, totalRows - visibleRows)), // calculate positioning (use + 1 to offset 0 position vs totalRow count diff) 
        position1 = position0 + visibleRows + 1;

      container.each(function () {                                                         // slice out visible rows from data and display
        var rowSelection = container.selectAll(".row")
          .data(data.slice(position0, Math.min(position1, totalRows)), dataid);
     
        rowSelection.exit().call(exit).remove();
      
        rowSelection.enter().append("g")
          .attr("transform", function (d, i) {
            if (i == 0) {
              return "translate(0," + (- rowHeight) + ")";
            }
            else {
              return "translate(0," + ((i * rowHeight) + 30) + ")";
            }
          })
          .attr("class", function (d) {
            if (svgID == "TabRtnPort") { return "row"; }
            else if (selcompany != undefined && d.isin === selcompany.isin) { return "row gridselcomp" }
            else { return "row"; }
          })
          .on("click", onGridClick)
          .on("mouseover", function (d) {
            if (selcompany != undefined && d.isin === selcompany.isin) {
              d3.select("#cSlider").select(".sRect1").style("opacity", "1");
              d3.select("#cSlider").select(".sRect").style("opacity", "1");
              d3.select("#cSlider").select(".sText").style("opacity", "1");

              d3.select("#cSlider").select(".sRectCompare").style("opacity", "1");
              d3.select("#cSlider").select(".sRectCompareOverlay").style("opacity", "1");
              d3.select("#cSlider").select(".sTextReverse").style("opacity", "1");
            }
            else {
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

        var getSize = rowUpdateSelection.size();
        var calcTotalGridHgt = getSize * rowHeight;
      //  var calcVisHgt = 0;
        var calcVisHgt = (viewportHeight - (calcTotalGridHgt > viewportHeight ? viewportHeight : viewportHeight)) / 2;
        var fltr = myFilter(getSize);
        //console.log('calcTotalGridHgt', calcTotalGridHgt, calcVisHgt, viewportHeight);
        container.attr("transform", "translate(0," + ((scrollPosition * rowHeight) - calcVisHgt) + ")");   // position viewport to stay visible

        //console.log((scrollPosition * rowHeight) - calcVisHgt);
        //console.log(scrollPosition, rowHeight, calcVisHgt)

        function myFilter(s) {
          if (s > 10) {
            return 'TotalDataInf';
          }
          else {
            //return 'TotalData' + getSize;
            return 'TotalDataInf';
          }
        }
        // console.log(rowUpdateSelection.size(), calcVisHgt, calcTotalGridHgt, viewportHeight);


        var TotalData = {

          'TotalData1': ["-2"],

          'TotalData2': ["-2", "2",],

          'TotalData3': ["-2", "2", "6"],

          'TotalData4': ["-2", "2", "6", "10"],

          'TotalData5': ["-2", "2", "6", "10", "14"],

          'TotalData6': ["-2", "2", "6", "10", "14", "14"],

          'TotalData7': ["-2", "2", "6", "10", "14", "14", "10"],

          'TotalData8': ["-2", "2", "6", "10", "14", "14", "10", "6"],

          'TotalData9': ["-2", "2", "6", "10", "14", "14", "10", "6", "2"],

          'TotalData10': ["-2", "2", "6", "10", "14", "14", "10", "6", "2", "-2"],

          'TotalDataInf': ["-12", "4", "10", "14", "16", "16", "14", "10", "4", "-2", "-5", "-5"]
        };

        // console.log(fltr);
        var getT_Data = TotalData[fltr];

        if (svgID == "TabRtnPort") { getT_Data = ['14', '14', '14', '14', '14', '14', '14', '14', '14', '14', '14'] }
        else { getT_Data = TotalData[fltr]; }

        rowUpdateSelection.attr("transform", function (d, i) {
          switch (i) {
            case 0:
              return "translate(" + 40 + "," + ((i * rowHeight)) + ")";
            //  break;
            case 1:
              return "translate(" + 40 + "," + ((i * rowHeight)) + ")";
            //  break;
            case 2:
              return "translate(" + 40 + "," + ((i * rowHeight)) + ")";
            // break;
            case 3:
              return "translate(" +40 + "," + ((i * rowHeight)) + ")";
            //  break;
            case 4:
              return "translate(" + 40 + "," + ((i * rowHeight)) + ")";
            // break;
            case 5:
              return "translate(" + 40 + "," + ((i * rowHeight)) + ")";
            // break;
            case 6:
              return "translate(" + 40 + "," + ((i * rowHeight)) + ")";
            //  break;
            case 7:
              return "translate(" + 40 + "," + ((i * rowHeight)) + ")";
            //  break;
            case 8:
              return "translate(" + 40 + "," + ((i * rowHeight) ) + ")";
            //  break;
            case 9:
              return "translate(" + 40 + "," + ((i * rowHeight) ) + ")";
            //  break;
            case 10:
              return "translate(" + 40+ "," + ((i * rowHeight)) + ")";
            //  break;
          

          }

        });

        if (svgID == "TabRtnPort") {
          //rowUpdateSelection.each(function (d, i) {
          //  if (UserSelectedDates.filter(x => x == d.date).length > 0) { d3.select(this).select(".tabRtntxt1").attr("fill", "#f69f52"); }
          //  else { d3.select(this).select(".tabRtntxt1").attr("fill", "#fff");}
          //  if (d.date == selcompany) { d3.select(this).selectAll("rect").attr("fill", "#5380daa6"); }
          //  else { d3.select(this).selectAll("rect").attr("fill", "#224b9e"); }
          //});
        }
        else {
          rowUpdateSelection.each(function (d, i) {
            if (selcompany != undefined) {
              if (i == 0) {
                if (d.companyName != selcompany.companyName) {
                  this.classList.remove("gridselcomp");
                }
                else { this.classList.add("gridselcomp"); }
              }
            }
            //d3.select(this).attr("transform", function(d) {
            //     return "translate(0," + ((i * rowHeight)) + ")";
            // });
          });
        }
      });


      //if (position1 > (data.length - visibleRows)) {                                      // dispatch events 
      //    dispatch.pageDown({
      //        delta: delta
      //    });
      //} else if (position0 < visibleRows) {
      //    dispatch.pageUp({
      //        delta: delta
      //    });
      //}

    }

    virtualscroller.render = render;                                                        // make render function publicly visible 
    viewport.on("wheel", function () {
      render();
      //if (tname === 1) {
      //  var translate = svg.attr("transform").substring(svgTrans.indexOf("(") + 1, svgTrans.indexOf(")")).split(",");
      //  lastclickpos_c = translate[1];
      //}
      //else {
      //  var translate = svg.attr("transform").substring(svgTrans.indexOf("(") + 1, svgTrans.indexOf(")")).split(",");
      //  lastclickpos = translate[1];
      //}
    });  // call render on scrolling event
    //render(true);
    //if (tname === 1) {
    //  var sort_C = 0;
    //  if (selcompany != undefined) { sort_C = selcompany.sort_C } else { sort_C = 0; }
    //  var k = ((sort_C) - 5) * rowHeight;
    //  if (lastclickpos_c !== null) {
    //    if ((lastclickpos_c <= sort_C * rowHeight) && (sort_C * rowHeight <= (parseInt(lastclickpos) + parseInt(rowHeight * 10)))) {
    //      svg.attr('transform', "translate(0," + (lastclickpos) + ")");
    //     svg.select('.chartGroup').attr('transform', "translate(-15," + (lastclickpos) + ")");
    //      scrollTop = lastclickpos;
    //      console.log('1', scrollTop);
    //    }
    //    else {
    //      svg.attr('transform', "translate(0," + (-k) + ")");
    //      svg.select('.chartGroup').attr('transform', "translate(-15," + (-k) + ")");
    //      scrollTop = -k;
    //      console.log('2', scrollTop);
    //    }
    //  }
    //} else {
    //  var k1 = ((selcompany.sort) - 5) * rowHeight;
    //  if (lastclickpos !== null) {
    //    if ((lastclickpos <= selcompany.sort * rowHeight) && (selcompany.sort * rowHeight <= (parseInt(lastclickpos) + parseInt(rowHeight * 10)))) {
    //    svg.attr('transform', "translate(0," + (lastclickpos) + ")");
    //      svg.select('.chartGroup').attr('transform', "translate(-15," + (lastclickpos) + ")");
    //      scrollTop = lastclickpos;
    //      console.log('3', scrollTop);
    //    }
    //    else {
    //    svg.attr('transform', "translate(0," + (k1) + ")");
    //      svg.select('.chartGroup').attr('transform', "translate(-15," + (k1) + ")");
    //      scrollTop = -k1;
    //      console.log('4', scrollTop);
    //    }
    //  }     
    //}
    render(true);
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

  virtualscroller.UserSelectedDates = function (_) {
    if (!arguments.length) return UserSelectedDates;
    UserSelectedDates = _;
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

  virtualscroller.svgID = function (_) {
    if (!arguments.length) return svgID;
    svgID = _;
    return virtualscroller;
  };

  virtualscroller.delta = function () {
    return delta;
  };

  rebind(virtualscroller, dispatch, "on");

  return virtualscroller;
};
