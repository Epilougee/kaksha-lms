'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// Single-hue blue palette bar chart for average assignment scores
export function AssignmentBarChart({ averages }) {
  if (!averages || averages.length === 0) return null;

  const data = {
    labels: averages.map((a) => (a.title.length > 20 ? a.title.slice(0, 18) + '...' : a.title)),
    datasets: [
      {
        label: 'Average Score %',
        data: averages.map((a) => a.averagePercent),
        backgroundColor: '#2F6FED',
        borderRadius: 6,
        maxBarThickness: 42,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Average: ${ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (v) => `${v}%` },
        grid: { color: '#E4E9F2' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12, weight: 600 } },
      },
    },
  };

  return (
    <div style={{ height: 240 }}>
      <Bar data={data} options={options} />
    </div>
  );
}

// Single-hue blue palette donut chart for grade band distribution
export function GradeDonutChart({ distribution }) {
  if (!distribution) return null;

  const data = {
    labels: ['Grade A (≥85%)', 'Grade B (70-84%)', 'Grade C (55-69%)', 'Grade D (40-54%)', 'Grade F (<40%)'],
    datasets: [
      {
        data: [
          distribution.A || 0,
          distribution.B || 0,
          distribution.C || 0,
          distribution.D || 0,
          distribution.F || 0,
        ],
        // Single-hue blue tint palette per requirements
        backgroundColor: [
          '#1D4ED8', // Deepest blue
          '#2F6FED', // Primary blue
          '#60A5FA', // Medium blue
          '#93C5FD', // Light blue
          '#CBD5E1', // Slate fallback for F
        ],
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, font: { size: 11, weight: 600 } },
      },
    },
    cutout: '70%',
  };

  return (
    <div style={{ height: 240 }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
