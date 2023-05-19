import { Component, Input, OnChanges, OnInit, ElementRef } from '@angular/core';
import { select as d3_select } from 'd3-selection';
import 'd3-transition';
import * as d3 from 'd3';

import { scaleOrdinal as d3_scaleOrdinal } from 'd3-scale';
import { easeQuadInOut as d3_easeQuadInOut } from 'd3-ease';
import {
  sankey as d3_sankey,
  sankeyLinkHorizontal as d3_sankeyLinkHorizontal,
  sankeyJustify as d3_sankeyJustify,
  sankeyLeft as d3_sankeyLeft,
  sankeyRight as d3_sankeyRight,
  sankeyCenter as d3_sankeyCenter,
} from 'd3-sankey';

const COLORS = [
  '#B70077',
  '#0384D4',
  '#EE6B0B',
  '#A319B1',
  '#11A611',
  '#1BB9FF',
  '#495A9C',
  '#EDB700',
  '#8B98C8',
  '#E6C49C',
  '#CCB8CE',
  '#9B9B9B',
];

@Component({
  selector: 'sankey',
  template: ``,
  // styles: [`h1 { font-family: sans-serif; }`],
})
export class SankeyChartComponent implements OnInit {
  @Input()
  width = 800;

  @Input()
  height = 600;

  @Input()
  data: any;

  private chart;
  private container;
  private margin;
  private svg;
  private sankey;
  private nodes;
  private links;
  private colors;

  constructor(private _element: ElementRef) {}

  ngOnInit() {
    this.margin = { top: 10, right: 20, bottom: 10, left: 30 };
    this.chart = d3_select(this._element.nativeElement).attr(
      'aria-hidden',
      'true'
    );
    this.svg = this.chart
      .append('svg')
      .attr('class', 'img-fluid')
      .attr('preserveAspectRatio', 'xMinYMin meet');

    this.container = this.svg.append('g').attr('class', 'container');
    this.links = this.container.append('g').attr('class', 'links');
    this.nodes = this.container.append('g').attr('class', 'nodes');
    this.drawSankey();
  }

  private drawSankey() {
    this.svg
      .attr('width', this.width)
      .attr('height', this.height)
      .attr(
        'viewBox',
        `-${this.margin.left} -${this.margin.top} ${this.width} ${this.height}`
      );
    var formatNumber = d3.format(',.0f'),
      format = function (d: any) {
        return formatNumber(d) + ' Units';
      };
    this.container.attr('transform', null);
    const labels = new Set();
    this.data.process.data.nodes.map((d) => labels.add(d.id));
    console.log(Array.from(labels));
    const labelsArray: any[] = Array.from(labels);
    this.colors = d3_scaleOrdinal().domain(labelsArray).range(COLORS);
    // this.colors = d3.scaleOrdinal(d3.schemeCategory10);
    // console.log(color);
    this.sankey = d3_sankey()
      .nodeId((d: any) => d.id)
      .nodeWidth(10)
      .nodeAlign(d3_sankeyCenter)
      .nodePadding(0.5)
      .nodeSort(null)
      .size([
        this.width - this.margin.left - this.margin.right,
        this.height - this.margin.top - this.margin.bottom,
      ])
      .iterations(50);

    this.sankey(this.data.process.data);
    console.log('this' + this.data.process.data.nodes);

    this.links
      .attr('fill', 'none')
      .selectAll('path')
      .data(this.data.process.data.links)
      .join(
        (enter) => {
          return enter
            .append('path')
            .attr('d', d3_sankeyLinkHorizontal())
            .attr('stroke-width', (d) => d.width)
            .attr('stroke', (d) => {
              //console.log('STROKE: ', d, this.colors(d.id));
              return '#ccc';
            })
            .style('opacity', 1)
            .style('mix-blend-mode', 'multiply');
        },
        (update) =>
          update
            .transition()
            .duration(1000)
            .ease(d3_easeQuadInOut)
            .attr('d', d3_sankeyLinkHorizontal())
            .attr('stroke-width', (d) => d.width),
        (exit) => {
          return exit.remove();
        }
      )
      .append('title')
      .style('opacity', 0)
      .text(function (d: any) {
        return d.source.name + ' → ' + d.target.name + '\n' + format(d.value);
      });

    this.nodes
      .selectAll('rect')
      .data(this.data.process.data.nodes)
      .join(
        (enter) => {
          return enter
            .append('rect')
            .attr('x', (d) => d.x0)
            .attr('y', (d) => d.y0)
            .attr('height', (d) => d.y1 - d.y0)
            .attr('width', (d) => this.sankey.nodeWidth())
            .attr('fill', (d, i) => {
              // console.log('FILL: ', d, this.colors(d.id));
              return this.colors(d.id);
            });
        },
        (update) => {
          return update
            .transition()
            .duration(1000)
            .ease(d3_easeQuadInOut)
            .attr('x', (d) => d.x0)
            .attr('y', (d) => d.y0)
            .attr('height', (d) => d.y1 - d.y0)
            .attr('width', (d) => this.sankey.nodeWidth());
        },
        (exit) => {
          return exit.remove();
        }
      )
      .append('title')
      .text(function (d: any) {
        return d.name + '\n' + format(d.value);
      });

    this.nodes
      .selectAll('text')
      .data(this.data.process.data.nodes)
      .join(
        (enter) =>
          enter
            .append('text')
            .text((d) => `${d.name}`)
            .style('fill', '#000')
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 14)
            //.attr('font-weight', 'bold')
            .attr('x', (d, i) => {
              return d.x0 + (d.x1 - d.x0) / 2;
            })
            .attr('y', (d, i) => {
              return d.y0 + (d.y1 - d.y0) / 2;
            })
            .attr('dy', '0.35em')
            .attr('dx', '-3.5em')
            .attr('transform', (d, i) => {
              const x = d.x0 + (d.x1 - d.x0) / 2;
              const y = d.y0 + (d.y1 - d.y0) / 2;
              return `rotate(0, ${x}, ${y})`;
            }),
        (update) =>
          update
            .transition()
            .duration(1000)
            .ease(d3_easeQuadInOut)
            .attr('x', (d, i) => {
              return d.x0 + (d.x1 - d.x0) / 2;
            })
            .attr('y', (d, i) => {
              return d.y0 + (d.y1 - d.y0) / 2;
            })
            .attr('transform', (d, i) => {
              const x = d.x0 + (d.x1 - d.x0) / 2;
              const y = d.y0 + (d.y1 - d.y0) / 2;
              return `rotate(270, ${x}, ${y})`;
            })
      );
  }
}
