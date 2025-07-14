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

var PortfolioGridVirtualScroller = function () {
  var enter = null,
    update = null,
    exit = null,
    data = [],
    dataid = null,
    svg = null,
    viewport = null,
    totalRows = 0,
    position = 0,
    rowHeight = 50,
    totalHeight = 0,
    minHeight = 0,
    viewportHeight = 0,
    visibleRows = 5,
    delta = 0,
    dispatch = d3.dispatch("pageDown", "pageUp").
      tname = 0;

  function virtualscroller(container) {
    var scrollTop = viewport.node().scrollTop;

    function render(resize) {
      if (resize) {
        viewportHeight = parseInt(viewport.select("g").attr("height"));
       //  visibleRows = Math.ceil(viewportHeight / rowHeight) + 1;
      }



      // var scrollTop =  -(svg.select("rect").attr("y"));
      var svgTrans = svg.attr("transform");
      //var scrollTop = 0;
      if (svgTrans != null) {
        var translate = svgTrans.substring(svgTrans.indexOf("(") , svgTrans.indexOf(")")).split(",");
        scrollTop = -translate[1];
      }

      totalHeight = Math.max(minHeight, (totalRows * rowHeight));
      svg.select("rect").style("height", totalHeight + "px")                                            // both style and attr height values seem to be respected
        .attr("height", totalHeight);
      var lastPosition = position;
      //console.log(totalHeight +" / "+ position);
      position = Math.floor(scrollTop / rowHeight);
      delta = position - lastPosition;
      scrollRenderFrame(position, scrollTop);


    }

    function onGridClick(e) {
      var d = d3.select(this).datum();
      //setClock(d.isin,  d.deg * 360 / 100, d.company + " (" + d.ticker + ")" + " [" + d3.format(".1f")(d.score) + "]");
    }

    function scrollRenderFrame(scrollPosition, scrollTop) {


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
          .attr("class", "row")
          .on("click", onGridClick)
          .on("mouseover", function (d) { })
          .on("mouseout", function (d) {})

          .call(enter);
        rowSelection.order();
        var rowUpdateSelection = container.selectAll(".row:not(.transitioning)");       // do not position .transitioning elements
        rowUpdateSelection.call(update);

        var getSize = rowUpdateSelection.size();
        var calcTotalGridHgt = getSize * rowHeight;
        var calcVisHgt = (viewportHeight - (calcTotalGridHgt > viewportHeight ? viewportHeight : calcTotalGridHgt)) / 2;
        var fltr = myFilter(getSize);
        container.attr("transform", "translate(-12," + ((scrollPosition * rowHeight) - calcVisHgt) + ")");   // position viewport to stay visible

        function myFilter(s) {
          if (s > 5) {
            return 'TotalDataInfV2';
          }
          else {
            return 'TotalDataInfV2';
          }
        }

        var TotalData = {

          'TotalData1': ["-2"],

          'TotalData2': ["-5", "5",],

          'TotalData3': ["-5", "5", "15"],

          'TotalData4': ["-5", "5", "15", "8"],

          'TotalData5': ["-5", "5", "15", "8", "0"],

          'TotalData6': ["-5", "5", "15", "8", "0", "-5"],

          'TotalData7': ["-5", "5", "15", "8", "0", "-5", "-10"],

          'TotalData8': ["-5", "5", "15", "8", "0", "-5", "-10", "0"],

          'TotalData9': ["-5", "5", "15", "8", "0", "-5", "-10", "0", "2"],

          'TotalData10': ["-5", "5", "15", "8", "0", "-5", "-10", "0", "2", "-2"],

          'TotalDataInf': ["-5", "5", "15", "8", "0", "-5", "-10", "0", "4", "-2", "-5", "-5"],

          'TotalDataInfV2': ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"]
        };

        // console.log(fltr);
        var getT_Data = TotalData[fltr];

        rowUpdateSelection.attr("transform", function (d, i) {
          switch (i) {
            case 0:
              return "translate(" + getT_Data[0] + "," + ((i * rowHeight) + calcVisHgt) + ")";
            //  break;
            case 1:
              return "translate(" + getT_Data[1] + "," + ((i * rowHeight) + calcVisHgt) + ")";
            //  break;
            case 2:
              return "translate(" + getT_Data[2] + "," + ((i * rowHeight) + calcVisHgt) + ")";
            // break;
            case 3:
              return "translate(" + getT_Data[3] + "," + ((i * rowHeight) + calcVisHgt) + ")";
            //  break;
            case 4:
              return "translate(" + getT_Data[4] + "," + ((i * rowHeight) + calcVisHgt) + ")";
            // break;
            case 5:
              return "translate(" + getT_Data[5] + "," + ((i * rowHeight) + calcVisHgt) + ")";
            // break;
            case 6:
              return "translate(" + getT_Data[6] + "," + ((i * rowHeight) + calcVisHgt) + ")";
            //  break;
            case 7:
              return "translate(" + getT_Data[7] + "," + ((i * rowHeight) + calcVisHgt) + ")";
            //  break;
            case 8:
              return "translate(" + getT_Data[8] + "," + ((i * rowHeight) + calcVisHgt) + ")";
            //  break;
            case 9:
              return "translate(" + getT_Data[9] + "," + ((i * rowHeight) + calcVisHgt) + ")";
            //  break;
            case 10:
              return "translate(" + getT_Data[10] + "," + ((i * rowHeight) + calcVisHgt) + ")";
            //  break;
            case 11:
              return "translate(" + getT_Data[11] + "," + ((i * rowHeight) + calcVisHgt) + ")";
            //  break;

          }

        });

        rowUpdateSelection.each(function (d, i) {
          if (selcompany != undefined) {
            if (d.isin == selcompany.isin) { d3.select(this).select('.rect_BG').attr('stroke', "#f69f52"); }
            else { d3.select(this).select('.rect_BG').attr('stroke', "transparent"); }
          }
          else { d3.select(this).select('.rect_BG').attr('stroke', "transparent");}
        });

      });


    }

    virtualscroller.render = render;                                                        // make render function publicly visible 
    viewport.on("wheel", function () {
      render();
    }); 
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
