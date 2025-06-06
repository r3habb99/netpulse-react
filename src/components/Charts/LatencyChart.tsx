/**
 * Enhanced Latency Chart Component
 * Interactive SVG-based line chart for latency trend visualization
 */

import React, { useMemo, useState } from 'react';
import { formatLatency } from '../../utils';

export interface ChartDataPoint {
  timestamp: number;
  latency: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor';
}

export interface LatencyChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  maxDataPoints?: number;
  className?: string;
}

const LatencyChart: React.FC<LatencyChartProps> = ({
  data,
  width = 400,
  height = 200,
  showGrid = true,
  showTooltip = true,
  maxDataPoints = 50,
  className = ''
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Process and limit data
  const chartData = useMemo(() => {
    const limitedData = data.slice(-maxDataPoints);
    return limitedData.length > 0 ? limitedData : [];
  }, [data, maxDataPoints]);

  // Calculate chart dimensions and scales
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const { xScale, yScale, maxLatency, minLatency } = useMemo(() => {
    if (chartData.length === 0) {
      return { xScale: (x: number) => 0, yScale: (y: number) => 0, maxLatency: 0, minLatency: 0 };
    }

    const timestamps = chartData.map(d => d.timestamp);
    const latencies = chartData.map(d => d.latency);
    
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const minLat = Math.min(...latencies);
    const maxLat = Math.max(...latencies);
    
    // Add some padding to the y-scale
    const yPadding = (maxLat - minLat) * 0.1;
    const yMin = Math.max(0, minLat - yPadding);
    const yMax = maxLat + yPadding;

    const xScale = (timestamp: number) => 
      ((timestamp - minTime) / (maxTime - minTime)) * chartWidth;
    
    const yScale = (latency: number) => 
      chartHeight - ((latency - yMin) / (yMax - yMin)) * chartHeight;

    return { xScale, yScale, maxLatency: yMax, minLatency: yMin };
  }, [chartData, chartWidth, chartHeight]);

  // Generate path for the line chart
  const linePath = useMemo(() => {
    if (chartData.length === 0) return '';
    
    const pathCommands = chartData.map((point, index) => {
      const x = xScale(point.timestamp);
      const y = yScale(point.latency);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    
    return pathCommands.join(' ');
  }, [chartData, xScale, yScale]);

  // Generate area path for gradient fill
  const areaPath = useMemo(() => {
    if (chartData.length === 0) return '';
    
    const pathCommands = chartData.map((point, index) => {
      const x = xScale(point.timestamp);
      const y = yScale(point.latency);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    
    // Close the path at the bottom
    const firstX = xScale(chartData[0].timestamp);
    const lastX = xScale(chartData[chartData.length - 1].timestamp);
    pathCommands.push(`L ${lastX} ${chartHeight}`);
    pathCommands.push(`L ${firstX} ${chartHeight}`);
    pathCommands.push('Z');
    
    return pathCommands.join(' ');
  }, [chartData, xScale, yScale, chartHeight]);

  // Generate grid lines
  const gridLines = useMemo(() => {
    if (!showGrid) return { horizontal: [], vertical: [] };
    
    const horizontal = [];
    const vertical = [];
    
    // Horizontal grid lines (latency values)
    const latencyStep = Math.ceil((maxLatency - minLatency) / 5);
    for (let i = 0; i <= 5; i++) {
      const latency = minLatency + (i * latencyStep);
      const y = yScale(latency);
      horizontal.push({ y, label: Math.round(latency) });
    }
    
    // Vertical grid lines (time)
    if (chartData.length > 1) {
      const timeStep = (chartData[chartData.length - 1].timestamp - chartData[0].timestamp) / 4;
      for (let i = 0; i <= 4; i++) {
        const timestamp = chartData[0].timestamp + (i * timeStep);
        const x = xScale(timestamp);
        const time = new Date(timestamp);
        vertical.push({ 
          x, 
          label: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    }
    
    return { horizontal, vertical };
  }, [showGrid, maxLatency, minLatency, yScale, chartData, xScale]);

  // Handle mouse events for tooltip
  const handleMouseMove = (event: React.MouseEvent<SVGElement>) => {
    if (!showTooltip || chartData.length === 0) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left - margin.left;
    const mouseY = event.clientY - rect.top - margin.top;
    
    // Find closest data point
    let closestPoint = chartData[0];
    let minDistance = Infinity;
    
    chartData.forEach(point => {
      const x = xScale(point.timestamp);
      const y = yScale(point.latency);
      const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });
    
    // Only show tooltip if mouse is close enough to a point
    if (minDistance < 30) {
      setHoveredPoint(closestPoint);
      setMousePosition({ x: event.clientX, y: event.clientY });
    } else {
      setHoveredPoint(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Get quality color
  const getQualityColor = (quality: string): string => {
    const colors = {
      'excellent': 'var(--excellent-color)',
      'good': 'var(--good-color)',
      'fair': 'var(--fair-color)',
      'poor': 'var(--poor-color)',
      'very-poor': 'var(--very-poor-color)'
    };
    return colors[quality as keyof typeof colors] || 'var(--primary-color)';
  };

  if (chartData.length === 0) {
    return (
      <div className={`latency-chart-container ${className}`}>
        <div className="chart-empty-state">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`latency-chart-container ${className}`}>
      <svg
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ overflow: 'visible' }}
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="latencyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Chart area */}
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {showGrid && (
            <g className="grid-lines">
              {/* Horizontal grid lines */}
              {gridLines.horizontal.map((line, index) => (
                <g key={`h-grid-${index}`}>
                  <line
                    x1={0}
                    y1={line.y}
                    x2={chartWidth}
                    y2={line.y}
                    stroke="var(--border-color)"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <text
                    x={-10}
                    y={line.y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="var(--text-secondary)"
                  >
                    {line.label}ms
                  </text>
                </g>
              ))}
              
              {/* Vertical grid lines */}
              {gridLines.vertical.map((line, index) => (
                <g key={`v-grid-${index}`}>
                  <line
                    x1={line.x}
                    y1={0}
                    x2={line.x}
                    y2={chartHeight}
                    stroke="var(--border-color)"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <text
                    x={line.x}
                    y={chartHeight + 15}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--text-secondary)"
                  >
                    {line.label}
                  </text>
                </g>
              ))}
            </g>
          )}
          
          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#latencyGradient)"
            opacity="0.6"
          />
          
          {/* Main line */}
          <path
            d={linePath}
            fill="none"
            stroke="var(--primary-color)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {chartData.map((point, index) => (
            <circle
              key={index}
              cx={xScale(point.timestamp)}
              cy={yScale(point.latency)}
              r="3"
              fill={getQualityColor(point.quality)}
              stroke="white"
              strokeWidth="1"
              style={{ cursor: 'pointer' }}
            />
          ))}
          
          {/* Highlighted point */}
          {hoveredPoint && (
            <circle
              cx={xScale(hoveredPoint.timestamp)}
              cy={yScale(hoveredPoint.latency)}
              r="5"
              fill={getQualityColor(hoveredPoint.quality)}
              stroke="white"
              strokeWidth="2"
            />
          )}
        </g>
      </svg>
      
      {/* Tooltip */}
      {hoveredPoint && showTooltip && (
        <div
          className="chart-tooltip"
          style={{
            position: 'fixed',
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            background: 'var(--background-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            {formatLatency(hoveredPoint.latency)}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            {new Date(hoveredPoint.timestamp).toLocaleTimeString()}
          </div>
          <div style={{ 
            color: getQualityColor(hoveredPoint.quality),
            textTransform: 'capitalize',
            fontSize: '11px',
            marginTop: '2px'
          }}>
            {hoveredPoint.quality}
          </div>
        </div>
      )}
    </div>
  );
};

export default LatencyChart;
