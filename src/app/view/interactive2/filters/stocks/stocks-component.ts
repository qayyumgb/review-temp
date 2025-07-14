import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
declare var $: any;
import * as d3 from 'd3';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[app-filter-stocks]',
  standalone: false,
  templateUrl: './stocks-component.html',
  styleUrl: './stocks-component.scss'
})
export class FilterStocksComponent implements OnInit {
  /** receive/send data **/
  @Input() getComponentsList: any = ''; // Data from the parent component
  stocks_Value: any;
  @Output() receiveFilterClose = new EventEmitter<boolean>();
  /** receive/send data **/
  MyData:any =
  [
      { text: "Equity", asset: '10.0.0.1' },
      { text: "ETF", asset: '10.0.0.2',  },
      { text: "Direct Indexing", asset: '10.0.0.3',  },
      { text: "Prebuilt", asset: '10.0.0.4', },

      

    ]
  MyData2: any =
    [
      { text: "Australia", asset: '10.0.0.1' },
      { text: "Canada", asset: '10.0.0.2', },
      { text: "Europe", asset: '10.0.0.3', },
      { text: "Japan", asset: '10.0.0.4', },
      { text: "South Africa", asset: '10.0.0.5', },
      { text: "USA", asset: '10.0.0.5', },
      { text: "United Kingdom", asset: '10.0.0.1' }
    ]
  diameter:number = 400 //max size of the bubbles

  bubble: any;
  svgRect: any;
  svgTooltip: any;
  constructor(public sharedData: SharedDataService) {

  }
  ngOnInit() {
    this.DrawChart();
    var myData = this.MyData.forEach((item:any) => {
      // Assign a random size within a defined range (e.g., 50 to 500)
      item.size = Math.floor(Math.random() * (400 - 50 + 1)) + 50; // Random size between 50 and 500
    });
    var myData2 = [...this.MyData2].forEach((item: any) => {
      // Assign a random size within a defined range (e.g., 50 to 500)
      item.size = Math.floor(Math.random() * (400 - 50 + 1)) + 50; // Random size between 50 and 500
    });
    //this.MyData2 = myData2;
    this.update(this.MyData)
    //this.createPackedBubbleChart(this.MyData)
  }
  
  close() {
    this.receiveFilterClose.emit(true);
  }
  private DrawChart() {
    d3.select("#chart").select('svg').remove();
    this.bubble = d3.pack()
      .size([this.diameter, this.diameter])
      .padding(10);
    this.svgRect = d3.select("#chart")
      .append("svg")
      .attr("width", this.diameter)
      .attr("height", this.diameter)
      .attr("class", "bubble");

  }

  public update(data: any) {
    var that = this;
    d3.select('#tooltip').selectAll("*").remove();
    d3.select("#tooltip").style("visibility", "hidden");


    const width = 400; // Chart width
    const height = 400; // Chart height
    const padding = 10;
    const defaultGrpTranslate = 200;
    const boundingRadius = Math.min(width, height) / 2; // Limit for bounding box
    const totalArea = Math.PI * Math.pow(boundingRadius, 2);
    const t = d3.transition().duration(750);

    const totalDataSize = data.reduce((sum: number, item: any) => sum + item.size, 0);
    // Assign dynamic sizes to bubbles
    data.forEach((item: any) => {
      const proportion = item.size / totalDataSize; // Proportion of total size
      const bubbleArea = proportion * totalArea; // Allocate area based on proportion
      item.r = Math.sqrt(bubbleArea / Math.PI); // Calculate radius
    });
    console.log(data, 'data')
    //var root = d3
    //  .hierarchy({ children: data })
    //  .sum((d: any) => d.size)
    //  .sort((a: any, b: any) => b.size - a.size);

    const root:any = d3
      .hierarchy({ children: data })
      .sum((d: any) => d.r * d.r) // Use squared radius for size computation
      .sort((a: any, b: any) => b.r - a.r);

    const pack = d3.pack()
      .size([width, height]) // Set the width and height for packing
      .padding(padding);

    pack(root);
    // Bubble layout
    //this.bubble(root);
    console.log('root', root.children);
    // Bind data to groups
    var groups = this.svgRect.selectAll("g").data(root.children);

    // EXIT
    groups.exit().remove();

    // ENTER
    const groupsEnter = groups
      .enter()
      .append("g")
      .attr("class","grp_list")
      .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);

    const groupsEnterInner = groupsEnter.append("g")
      .attr("class", "bubble_Grp")

    // Append circles to the group
    groupsEnterInner
      .append("circle")
      .attr("r", 1e-6)
      .style("fill", "#402a75")
      .transition(t)
      .attr("r", (d: any) => d.r);

    // Append text to the group and wrap
    groupsEnterInner
      .append("text")
      .attr("dy", ".3em") 
      .attr("text-anchor", "middle") 
      .style("fill", "white")
      .style("font-family", "var(--ff-medium)")
      .style("font-size", (d: any) => d.r / 4)
      .each((d: any, i: number, nodes: any) => this.wrapText(d, nodes[i]));

    // UPDATE
    groups
      .transition(t)
      .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);

    // Update circles
    groups
      .select("circle")
      .transition(t)
      .attr("r", (d: any) => d.r)
      .style("fill", (d: any) => "var(--border)");

    // Update text and wrap
    groups
      .select("text")
      .style("font-size", (d: any) => d.r / 5)
      .each((d: any, i: number, nodes: any) => this.wrapText(d, nodes[i]));

    // Tooltip group
    const tooltipBox = d3.select("#tooltip");
    tooltipBox
      .append("rect")
      .attr("rx", "10")
      .attr("ry", "10")
      .attr("stroke", "#8989b2")
      .attr("width", "200")
      .attr("height", "80")
      .attr("fill", "var(--topNavbar)");


      tooltipBox.on("mouseover", (event: any, d: any) => {
        tooltipBox.style("visibility", "visible");
      })
      .on("mouseout", (event: any, d: any) => {
        tooltipBox.style("visibility", "hidden");
      })

    var bubbles = d3.selectAll(".bubble_Grp")
      .on("mouseover", (event: any, d: any) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(300)
          .style('transform', 'scale(1.1)');
        tooltipBox.selectAll('text').remove();
       
        // Show the tooltip inside the bubble
       
        const tempText = tooltipBox
          .append("text")
          .attr("class", "tooltip-text")
          .attr("x", "100")
          .attr("y", "30")
          .text(d.data.text)
          .call(this.sharedData.Crlwrapping, 130, "top");

        const tempTextAdd = tooltipBox
          .append("text")
          .attr("class", "tooltip-text-add")
          .attr("x", "98")
          .attr("y", "60")
          .text('+ADD');

        //const textLength = tempText.node()?.getComputedTextLength() || 160;
        const textLength = 200;
        const heightCalculate = tempText.node()?.getComputedTextLength();
        var rectHgt = 80;
        var tooltipAdd_Y = 60;
        if (heightCalculate != undefined && heightCalculate > textLength) {
          if (heightCalculate > 310) { rectHgt = 110; tooltipAdd_Y = 80; } else { rectHgt = 90; tooltipAdd_Y = 70 }
        }
        tooltipBox.select('rect').attr("width", textLength).attr("height", rectHgt);
        tempTextAdd.attr("y", tooltipAdd_Y);
        tempText.attr('x', (textLength) / 2);
        var trans = 'translate(' + (d.x - defaultGrpTranslate) + ',' + (d.y - d.r - 10) + ')';
        tooltipBox.style("visibility", "visible").attr("transform", trans);
      })
      .on("mouseout", (event: any, d: any) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(300)
          .attr("stroke", "transparent")
          .style('transform', 'scale(1)');
        tooltipBox.style("visibility", "hidden");
      })
      .on("mousemove", (event: any, d: any) => {
        // Update tooltip position dynamically
        var trans = 'translate(' + (d.x - defaultGrpTranslate) + ',' + (d.y - d.r - 10) + ')';
        tooltipBox.attr("transform", trans);
      })
      .on("click", (event: any, d: any) => {
        console.log(d);
      
        if (isNotNullOrUndefined(this.MyData2)) { this.DrawChart(); this.update(this.MyData2); }
        
      });

  }

  public updateNew(data: any) {
    d3.select('#tooltip').selectAll("*").remove();

    const width = 400; // Chart width
    const height = 400; // Chart height
    const padding = 5; // Padding between bubbles
    const t = d3.transition().duration(750);
    const defaultGrpTranslate = 200;

    // Calculate the radius dynamically based on available space
    const totalBubbles = data.length;
    const areaPerBubble = ((width-130) * (height-130)) / totalBubbles; // Total area divided by the number of bubbles
    const radius = Math.sqrt(areaPerBubble / Math.PI) - padding; // Radius for each bubble

    // Create a hierarchy and assign a constant value for equal size
    const root:any = d3
      .hierarchy({ children: data })
      .sum(() => 1); // Equal size for all bubbles

    // Apply the D3 pack layout
    d3.pack()
      .size([width, height])
      .padding(padding)(root);

    // Bind data to groups
    const groups = this.svgRect.selectAll("g").data(root.children);

    // EXIT
    groups.exit().remove();

    // ENTER
    const groupsEnter = groups
      .enter()
      .append("g")
      .attr("class", "grp_list")
      .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);

    const groupsEnterInner = groupsEnter.append("g").attr("class", "bubble_Grp");

    // Append circles with dynamically calculated radius
    groupsEnterInner
      .append("circle")
      .attr("r", 1e-6)
      .style("fill", "#402a75")
      .transition(t)
      .attr("r", radius); // Use dynamically calculated radius

    // Append text to the group
    groupsEnterInner
      .append("text")
      .attr("dy", ".3em")
      .attr("text-anchor", "middle")
      .style("fill", "white")
      .style("font-family", "var(--ff-medium)")
      .style("font-size", 10)
      .text((d: any) => d.data.text);

    // UPDATE
    groups
      .transition(t)
      .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);

    // Tooltip
    const tooltipBox = d3.select("#tooltip");
    tooltipBox
      .append("rect")
      .attr("rx", "10")
      .attr("ry", "10")
      .attr("stroke", "#8989b2")
      .attr("width", "200")
      .attr("height", "80")
      .attr("fill", "var(--topNavbar)");

    // Add interactivity
    const bubbles = d3.selectAll(".bubble_Grp")
      .on("mouseover", (event: any, d: any) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(300)
          .style('transform', 'scale(1.1)');
        tooltipBox.selectAll('text').remove();

        // Show the tooltip inside the bubble

        const tempText = tooltipBox
          .append("text")
          .attr("class", "tooltip-text")
          .attr("x", "100")
          .attr("y", "30")
          .text(d.data.text)
          .call(this.sharedData.Crlwrapping, 150, "top");

        const tempTextAdd = tooltipBox
          .append("text")
          .attr("class", "tooltip-text-add")
          .attr("x", "98")
          .attr("y", "60")
          .text('+ADD');

        //const textLength = tempText.node()?.getComputedTextLength() || 160;
        const textLength = 200;
        const heightCalculate = tempText.node()?.getComputedTextLength();
        var rectHgt = 80;
        var tooltipAdd_Y = 60;
        if (heightCalculate != undefined && heightCalculate > textLength) {
          if (heightCalculate > 310) { rectHgt = 110; tooltipAdd_Y = 80; } else { rectHgt = 90; tooltipAdd_Y = 70 }
        }
        tooltipBox.select('rect').attr("width", textLength).attr("height", rectHgt);
        tempTextAdd.attr("y", tooltipAdd_Y);
        tempText.attr('x', (textLength) / 2);
        var trans = 'translate(' + (d.x - defaultGrpTranslate) + ',' + (d.y - d.r - 10) + ')';
        tooltipBox.style("visibility", "visible").attr("transform", trans);
      })
      .on("mouseout", (event: any, d: any) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(300)
          .attr("stroke", "transparent")
          .style('transform', 'scale(1)');
        tooltipBox.style("visibility", "hidden");
      })
      .on("mousemove", (event: any, d: any) => {
        // Update tooltip position dynamically
        var trans = 'translate(' + (d.x - defaultGrpTranslate) + ',' + (d.y - d.r - 10) + ')';
        tooltipBox.attr("transform", trans);
      })
      .on("click", (event: any, d: any) => {
        if (isNotNullOrUndefined(this.MyData2)) { this.DrawChart(); this.updateNew(this.MyData2); }

      });
  }

  private wrapText(d: any, textElement: SVGTextElement) {
    const text = d.data.text; // Full text to wrap
    const radius = d.r; // Circle radius
    const maxChars = Math.floor(radius / 5); // Approximate characters per line based on radius
    const words = text.split(' '); // Split text into words
    const lines: string[] = [];
    let currentLine = '';

    // Create lines of text that fit within maxChars
    words.forEach((word: any) => {
      if ((currentLine + word).length <= maxChars) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine); // Add remaining text as a line

    // Limit to 3 lines maximum
    const limitedLines = lines.slice(0, 3);
    console.log(limitedLines);
    if (lines.length > 3 && limitedLines[2]) {
      limitedLines[2] += '...'; // Add ellipsis if text is truncated
    }
    
    // Clear existing text
    d3.select(textElement).selectAll('tspan').remove();

    // Calculate vertical offset to center text based on line count
    const verticalOffset = (limitedLines.length - 1) * -0.6; // Adjust to center vertically
    console.log(verticalOffset);
    // Append tspan elements for each line
    limitedLines.forEach((line, i) => {
      d3.select(textElement)
        .append('tspan')
        .attr('x', 0) // Center horizontally
        .attr('y', 0) // Initial vertical position
        .attr('dy', `${i === 0 ? verticalOffset : i === 2 ? 2.4: 0.6}em`) // Offset subsequent lines
        .attr('text-anchor', 'middle') // Center align text
        .text(line);
    });
  }
  public doFilter(f:any) {
    console.log("d")
    if (f == "all") {
      this.update(this.MyData);
    }
    if (f == "high") {
      this.update(this.MyData.filter((x:any) => (x['priority'] == 'high')));
    }
    if (f == "medium") {
      this.update(this.MyData.filter((x: any) => (x['priority'] == 'medium')));
    }
    if (f == "low") {
      this.update(this.MyData.filter((x: any) => (x['priority'] == 'low')));
    }
  }
 
}
