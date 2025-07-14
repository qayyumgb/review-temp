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

var dropVirtualScroller = function (e) {
  var enter = null,
    update = null,
    exit = null,
    data = [],
    dataid = null,
    svg = null,
    viewport = null,
    totalRows = 0,
    svgID = e,
    gridID = null,
    position = 0,
    rowHeight = 24,
    totalHeight = 0,
    minHeight = 0,
    viewportHeight = 0,
    visibleRows = 0,
    delta = 0,
    breadData = 0,
    breadDataLength= 0,
    dispatch = d3.dispatch("pageDown", "pageUp").
      tname = 0;

  //rowHeight = svgID == 'Menu' ? 24 : 24;

  function virtualscroller(container) {
    var scrollTop = viewport.node().scrollTop;

    function render(resize) {
    
      breadDataLength = breadData.length;
      if (resize) {
        viewportHeight = parseInt(viewport.select("g").attr("height"));
        visibleRows = Math.ceil(viewportHeight / rowHeight) + 1;
      }



      // var scrollTop =  -(svg.select("rect").attr("y"));
      var svgTrans = svg.attr("transform");
      //var scrollTop = 0;
      if (svgTrans != null) {
        var translate = svgTrans.substring(svgTrans.indexOf("(") + 1, svgTrans.indexOf(")")).split(",");
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


      var position0 = Math.max(0, Math.min(scrollPosition, totalRows - visibleRows + 1)), // calculate positioning (use + 1 to offset 0 position vs totalRow count diff) 
        position1 = position0 + visibleRows;

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
            if (gridID == '#CompMenuGrids' && selcomp != undefined) {
              if (selcomp.group == "ETFName") { return (d.assetId === selcomp.assetId) ? "row highlight" : "row"; }
              else { return (d.id === selcomp.id) ? "row highlight" : "row"; }
            }
            else if (selcomp != undefined) { return (d.group === selcomp.group) ? "row highlight" : "row"; }
            else { return "row"; }
          })

          .call(enter);
        rowSelection.order();
        var rowUpdateSelection = container.selectAll(".row:not(.transitioning)");       // do not position .transitioning elements
        rowUpdateSelection.call(update);


        var getSize = rowUpdateSelection.size();
        var calcTotalGridHgt = getSize * rowHeight;
        //var calcVisHgt = (viewportHeight - (calcTotalGridHgt > viewportHeight ? viewportHeight : calcTotalGridHgt)) / 2;
        //if (breadDataLength > 0) { calcVisHgt = 0; }
        calcVisHgt = 0; 
        var fltr = myFilter(getSize);

        container.attr("transform", "translate(-20," + ((scrollPosition * rowHeight) + 3) + ")");   // position viewport to stay visible
        function myFilter(s) {
          if (breadDataLength == 0) {
            if (s > 10) {
              return 'TotalDataInf';
            }
            else {
              //return 'TotalData' + getSize;
              return 'TotalDataInf';
            }

          }
          else {
            if (s > 10) {
              return 'TotalDataInf';
            }
            else {
              //return 'TotalData' + getSize;
              return 'TotalDataInf';
            }
          }

        }
       

            //'TotalData1': ["16"],

            //'TotalData2': ["16", "16",],

            //'TotalData3': ["20", "10", "20"],

            //'TotalData4': ["20", "10", "10", "20"],

            //'TotalData5': ["25", "15", "5", "15", "25"],

            //'TotalData6': ["30", "20", "8", "8", "20", "30"],

            //'TotalData7': ["30", "20", "12", "6", "12", "20", "30"],

            //'TotalDataInf': ["30", "20", "12", "6", "12", "20", "30", "35"]
        if (breadDataLength == 0) {
          var TotalData = {

            'TotalData1': ["-1"],

            'TotalData2': ["-1", "-1",],

            'TotalData3': ["2", "-1", "2"],

            'TotalData4': ["2", "-1", "-1", "2"],

            'TotalData5': ["8", "2", "-1", "2", "8"],

            'TotalData6': ["8", "2", "-1", "-1", "2", "8"],

            'TotalData7': ["16", "8", "2", "-1", "2", "8", "16"],

            'TotalData8': ["28", "16", "8", "2", "2", "8", "16", "28"],

            'TotalData9': ["28", "16", "8", "2", "-1", "2", "8", "16", "28"],

            'TotalData10': ["28", "16", "8", "2", "-1", "-1", "2", "8", "16", "28"],

            'TotalDataInf': ["28", "16", "8", "2", "-1", "-1", "2", "8", "16", "28", "28"]
          };
        }
        else {
          var TotalData = {

            'TotalData1': ["-1"],

            'TotalData2': ["-1", "-1",],

            'TotalData3': ["2", "-1", "2"],

            'TotalData4': ["2", "-1", "-1", "2"],

            'TotalData5': ["8", "2", "-1", "2", "8"],

            'TotalData6': ["8", "2", "-1", "-1", "2", "8"],

            'TotalData7': ["16", "8", "2", "-1", "2", "8", "16"],

            'TotalData8': ["28", "16", "8", "2", "2", "8", "16", "28"],

            'TotalData9': ["28", "16", "8", "2", "-1", "2", "8", "16", "28"],

            'TotalData10': ["28", "16", "8", "2", "-1", "-1", "2", "8", "16", "28"],

            'TotalDataInf': ["28", "16", "8", "2", "-1", "-1", "2", "8", "16", "28", "28"]

          };
        }


        // console.log(fltr);  'TotalDataInf': ["-2", "4", "10", "14", "16", "16", "14", "10", "4", "-2", "-5","-5"]
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

          }

        });

        rowUpdateSelection.each(function (d, i) {
          if (gridID == '#CompMenuGrids' && selcomp != undefined) {
            if (i == 0) {
              if (d.id != selcomp.id) { this.classList.remove("highlight"); }
              else if (selcomp.group == "ETFName" && d.assetId != selcomp.assetId) { this.classList.remove("highlight"); }
              else { this.classList.add("highlight"); }
            }
          } else if (selcomp != undefined) { if (i == 0) { if (d.group != selcomp.group) { this.classList.remove("highlight"); } else { this.classList.add("highlight"); } } }
          if (gridID == '#CompMenuGrids' && (selcomp != undefined && d.id === selcomp.id)) {
            d3.select(this).select('.C_name').attr('fill', function (d, i) {
              let cl = d3.scaleLinear().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
              return cl(d.med);
            });
          }
          else if (gridID == '#CompMenuGrids' && (selcomp != undefined && d.assetId === selcomp.assetId)) {
            d3.select(this).select('.C_name').attr('fill', function (d, i) {
              let cl = d3.scaleLinear().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
              return cl(d.med);
            });
          }
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
  virtualscroller.selcomp = function (_) {
    if (!arguments.length) return selcomp;
    selcomp = _;
    return virtualscroller;
  };

  virtualscroller.gridID = function (_) {
    if (!arguments.length) return gridID;
    gridID = _;
    return virtualscroller;
  };
  virtualscroller.breadData = function (_) {
    if (!arguments.length) return breadData;
    breadData = _;
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
