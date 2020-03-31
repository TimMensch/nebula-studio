import { Button } from 'antd';
import * as d3 from 'd3';
import * as React from 'react';
import intl from 'react-intl-universal';

import './index.less';
import Links from './Links';
import Labels from './NodeTexts';
import SelectIds from './SelectIds';

interface INode extends d3.SimulationNodeDatum {
  name: string;
  group: number;
}

interface IProps {
  width: number;
  height: number;
  data: {
    vertexes: INode[];
    edges: any[];
    selectIdsMap: Map<string, boolean>;
  };
  showFields: string[];
  onSelectVertexes: (vertexes: INode[]) => void;
  onMouseInNode: (node: INode) => void;
  onMouseOut: () => void;
  onMouseInLink: (link: any) => void;
}

interface IRefs {
  mountPoint?: SVGSVGElement | null;
}

const colors = [
  '#1e78b4',
  '#b2df8a',
  '#fb9a99',
  '#e3181d',
  '#fdbf6f',
  '#ff7e01',
  '#cab2d6',
  '#6a3e9a',
  '#ffff99',
  '#b15828',
  '#7fc97f',
  '#beadd4',
  '#fdc086',
  '#ffff99',
  '#a6cee3',
  '#386cb0',
  '#f0007f',
  '#bf5a18',
];
const colorTotal = colors.length;

class NebulaD3 extends React.Component<IProps, {}> {
  ctrls: IRefs = {};
  nodeRef: SVGCircleElement;
  circleRef: SVGCircleElement;
  force: any;
  svg: any;
  node: any;
  link: any;
  linksText: any;
  nodeText: any;
  selectNode: INode[];
  state = {
    isZoom: false,
    translateX: 0,
    translateY: 0,
    scale: 1,
  };

  componentDidMount() {
    if (!this.ctrls.mountPoint) {
      return;
    }
    this.svg = d3.select(this.ctrls.mountPoint);

    this.svg
      .append('defs')
      .append('marker')
      .attr('id', 'marker')
      .attr('viewBox', '1 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('path')
      .attr('d', 'M 0,-5 L 12 ,0 L 0,5')
      .attr('fill', '#999')
      .attr('stroke', '#999');
  }

  dragged = d => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  };

  dragstart = (d: any) => {
    if (!d3.event.active) {
      this.force.alphaTarget(0.6).restart();
    }
    d.fx = d.x;
    d.fy = d.y;

    return d;
  };

  dragEnded = d => {
    if (!d3.event.active) {
      this.force.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  };

  tick = () => {
    this.link.attr('d', (d: any) => {
      if (d.target.name === d.source.name) {
        const dr = 30 / d.linknum;
        return (
          'M' +
          d.source.x +
          ',' +
          d.source.y +
          'A' +
          dr +
          ',' +
          dr +
          ' 0 1,1 ' +
          d.target.x +
          ',' +
          (d.target.y + 1)
        );
      } else if (d.size % 2 !== 0 && d.linknum === 1) {
        return (
          'M ' +
          d.source.x +
          ' ' +
          d.source.y +
          ' L ' +
          d.target.x +
          ' ' +
          d.target.y
        );
      }
      const curve = 1.5;
      const homogeneous = 1.2;
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dr =
        (Math.sqrt(dx * dx + dy * dy) * (d.linknum + homogeneous)) /
        (curve * homogeneous);

      if (d.linknum < 0) {
        const dr =
          (Math.sqrt(dx * dx + dy * dy) * (-1 * d.linknum + homogeneous)) /
          (curve * homogeneous);
        return (
          'M' +
          d.source.x +
          ',' +
          d.source.y +
          'A' +
          dr +
          ',' +
          dr +
          ' 0 0,0 ' +
          d.target.x +
          ',' +
          d.target.y
        );
      }
      return (
        'M' +
        d.source.x +
        ',' +
        d.source.y +
        'A' +
        dr +
        ',' +
        dr +
        ' 0 0,1 ' +
        d.target.x +
        ',' +
        d.target.y
      );
    });

    this.node.attr('cx', d => d.x).attr('cy', d => d.y);

    this.nodeText
      .attr('x', (d: any) => {
        return d.x;
      })
      .attr('y', (d: any) => {
        return d.y + 35;
      });

    this.linksText
      .attr('x', (d: any) => {
        return (d.source.x + d.target.x) / 2;
      })
      .attr('y', (d: any) => {
        return (d.source.y + d.target.y) / 2;
      });
    this.nodeRenderText();
  };

  handleUpdataNodes(nodes: INode[], selectIdsMap) {
    if (nodes.length === 0) {
      d3.selectAll('.node').remove();
      return;
    }
    d3.select(this.nodeRef)
      .selectAll('circle')
      .data(nodes)
      .attr('class', (d: INode) => {
        if (selectIdsMap[d.name]) {
          return 'node active';
        }
        return 'node';
      })
      .enter()
      .append<SVGCircleElement>('circle')
      .on('mouseover', (d: INode) => {
        if (this.props.onMouseInNode) {
          this.props.onMouseInNode(d);
        }
      })

      .on('mouseout', () => {
        if (this.props.onMouseOut) {
          this.props.onMouseOut();
        }
      })
      .attr('class', 'node')
      .attr('id', (d: INode) => `node-${d.name}`)
      .style('fill', (d: INode) => colors[d.group % colorTotal]);

    d3.select(this.nodeRef)
      .selectAll('circle')
      .data(nodes)
      .exit()
      .remove();

    this.node = d3
      .selectAll('.node')
      .on('click', (d: any) => {
        this.props.onSelectVertexes([d]);
      })
      .call(
        d3
          .drag()
          .on('start', d => this.dragstart(d))
          .on('drag', d => this.dragged(d))
          .on('end', d => this.dragEnded(d)) as any,
      );
    this.force.on('tick', () => this.tick());
  }

  handleUpdataNodeTexts = () => {
    if (this.force) {
      this.nodeText = d3
        .selectAll('.label')
        .on('click', (d: any) => {
          this.props.onSelectVertexes([d]);
        })
        .on('mouseover', () => {
          if (this.props.onMouseOut) {
            this.props.onMouseOut();
          }
        })
        .call(
          d3
            .drag()
            .on('start', d => this.dragstart(d))
            .on('drag', d => this.dragged(d))
            .on('end', d => this.dragEnded(d)) as any,
        );
    }
  };

  handleUpdataLinks = () => {
    if (this.force) {
      this.link = d3.selectAll('.link').attr('marker-end', 'url(#marker)');
      this.linksText = d3
        .selectAll('.text')
        .selectAll('.textPath')
        .attr('xlink:href', (d: any) => '#text-path-' + d.id)
        .attr('startOffset', '50%')
        .text((d: any) => {
          return d.type;
        });
    }
  };

  handleZoom = () => {
    const { isZoom } = this.state;
    if (isZoom) {
      this.svg.on('.zoom', null);
      this.setState({
        isZoom: false,
      });
    } else {
      this.svg.call(
        d3
          .zoom()
          .scaleExtent([0.3, 1])
          .on('zoom', () =>
            d3.select(this.circleRef).attr('transform', d3.event.transform),
          )
          .on('end', () =>
            this.setState({
              scale: d3.event.transform.k,
              translateX: d3.event.transform.x,
              translateY: d3.event.transform.y,
            }),
          ),
      );
      this.setState({
        isZoom: true,
      });
    }
  };

  // compute to get (x,y ) of the nodes by d3-force: https://github.com/d3/d3-force/blob/v1.2.1/README.md#d3-force
  // it will change the data.edges and data.vertexes passed in
  computeDataByD3Force() {
    const { width, height, data } = this.props;
    const linkForce = d3
      .forceLink(data.edges)
      .id((d: any) => {
        return d.name;
      })
      .distance((d: any) => {
        return d.value * 30;
      });
    if (!this.force) {
      this.force = d3
        .forceSimulation()
        .force('charge', d3.forceManyBody().strength(-20))
        .force('x', d3.forceX())
        .force('y', d3.forceY())
        .force(
          'collide',
          d3
            .forceCollide()
            .radius(60)
            .iterations(2),
        );
    }
    this.force
      .nodes(data.vertexes)
      .force('link', linkForce)
      .force('center', d3.forceCenter(width / 2, height / 2))
      .restart();
    this.handleUpdataNodes(data.vertexes, data.selectIdsMap);
  }

  isIncludeField = (node, field) => {
    let isInclude = false;
    node.nodeProp.tables.forEach(v => {
      Object.keys(v).forEach(nodeField => {
        if (nodeField === field) {
          isInclude = true;
        }
      });
    });
    return isInclude;
  };

  targetName = (node, field) => {
    let nodeText = '';
    node.nodeProp.tables.forEach(v => {
      Object.keys(v).forEach(nodeField => {
        if (nodeField === field) {
          nodeText = `${nodeField}: ${v[nodeField]}`;
        }
      });
    });
    return nodeText;
  };

  nodeRenderText() {
    const { showFields, data } = this.props;
    d3.selectAll('tspan').remove();
    data.vertexes.forEach((node: any) => {
      let line = 1;
      if (node.nodeProp) {
        showFields.forEach(field => {
          if (this.isIncludeField(node, field)) {
            line++;
            d3.select('#name_' + node.name)
              .append('tspan')
              .attr('x', (d: any) => d.x)
              .attr('y', (d: any) => d.y + 20 * line)
              .attr('dy', '1em')
              .text(d => this.targetName(d, field));
          }
        });
      }
    });
  }
  render() {
    this.computeDataByD3Force();
    const { width, height, data, onMouseInLink, onMouseOut } = this.props;
    const { isZoom, translateX, translateY, scale } = this.state;
    return (
      <div>
        {data.vertexes.length !== 0 && (
          <Button
            type={isZoom ? 'primary' : 'default'}
            className="graph-btn"
            onClick={this.handleZoom}
          >
            {intl.get('explore.zoom')}
          </Button>
        )}
        <svg
          className="output-graph"
          ref={mountPoint => (this.ctrls.mountPoint = mountPoint)}
          width={width}
          height={height}
        >
          <g ref={(ref: SVGCircleElement) => (this.circleRef = ref)}>
            <Links
              links={data.edges}
              onUpdataLinks={this.handleUpdataLinks}
              onMouseInLink={onMouseInLink}
              onMouseOut={onMouseOut}
            />
            <g
              ref={(ref: SVGCircleElement) => (this.nodeRef = ref)}
              className="nodes"
            />
            <Labels
              nodes={data.vertexes}
              onUpDataNodeTexts={this.handleUpdataNodeTexts}
            />
            <SelectIds
              nodes={data.vertexes}
              translateX={translateX}
              translateY={translateY}
              scale={scale}
              onSelectVertexes={this.props.onSelectVertexes}
            />
          </g>
        </svg>
      </div>
    );
  }
}

export default NebulaD3;
