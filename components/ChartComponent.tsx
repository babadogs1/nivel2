import React, { useEffect, useRef } from 'react';
import type { Chart } from 'chart.js';
import type { ChartData } from '../types';

// Declaring Chart on window for global script from index.html
declare global {
  interface Window {
    Chart: typeof Chart;
  }
}

interface ChartComponentProps {
  data: ChartData;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return;

    // Destroy previous chart instance if it exists to prevent memory leaks
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const isDarkMode = document.body.classList.contains('dark');
    const textColor = isDarkMode ? '#e5e7eb' : '#4b5563';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const titleColor = isDarkMode ? '#f9fafb' : '#1f2937';

    chartRef.current = new window.Chart(ctx, {
      type: data.type,
      data: {
        labels: data.labels,
        datasets: data.datasets.map(ds => ({
          ...ds,
          // Add some default styling for better visuals
          borderRadius: data.type === 'bar' ? 6 : undefined,
          hoverBorderWidth: 2,
          hoverBorderColor: titleColor,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            position: 'top',
             labels: {
              color: textColor,
              font: {
                size: 14,
              }
            }
          },
          title: {
            display: true,
            text: data.title,
            color: titleColor,
            font: {
                size: 20,
                weight: 'bold',
            },
            padding: {
              top: 10,
              bottom: 20,
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: isDarkMode ? '#374151' : '#ffffff',
            titleColor: isDarkMode ? '#f9fafb' : '#1f2937',
            bodyColor: isDarkMode ? '#e5e7eb' : '#4b5563',
            borderColor: gridColor,
            borderWidth: 1,
            padding: 10,
            caretPadding: 10,
            displayColors: true,
            boxPadding: 4,
            callbacks: {
              label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                      label += ': ';
                  }
                  if (context.parsed.y !== null) {
                      label += new Intl.NumberFormat('en-US').format(context.parsed.y);
                  }
                  return label;
              }
            }
          }
        },
        scales: (data.type === 'bar' || data.type === 'line') ? {
            y: {
                beginAtZero: true,
                ticks: { color: textColor, font: { size: 12 } },
                grid: { color: gridColor },
            },
            x: {
                ticks: { color: textColor, font: { size: 12 } },
                 grid: { display: false },
            }
        } : {},
      },
    });

    // Cleanup function to destroy the chart on component unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]); // Rerun effect if data changes

  return (
    <div className="my-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
       <div style={{ position: 'relative', height: '400px', width: '100%' }}>
         <canvas ref={canvasRef}></canvas>
       </div>
    </div>
  );
};

export default ChartComponent;