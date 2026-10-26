import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  type ChartConfiguration,
} from 'chart.js';
import type { Locale } from '../../types';

// Register only tree-shakeable required Chart.js controllers & plugins
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
);

interface ChartDataPoint {
  monthKey: string; // e.g. "2026-01"
  label: string;    // e.g. "Jan" or "يناير"
  count: number;
}

interface AdminGrowthChartProps {
  locale: Locale;
  projects: Array<{ created_at?: string }>;
  certificates: Array<{ created_at?: string; issue_date?: string }>;
  testimonials: Array<{ created_at?: string }>;
}

export const AdminGrowthChart: React.FC<AdminGrowthChartProps> = ({
  locale,
  projects,
  certificates,
  testimonials,
}) => {
  const [activeView, setActiveView] = useState<'all' | 'projects'>('all');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Compute real monthly distribution from actual Supabase timestamps
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const months: ChartDataPoint[] = [];
    const now = new Date();

    // Past 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
      });
      months.push({ monthKey, label, count: 0 });
    }

    const countItem = (dateStr?: string) => {
      if (!dateStr) return;
      const key = dateStr.slice(0, 7);
      const bucket = months.find((m) => m.monthKey === key);
      if (bucket) bucket.count++;
    };

    projects.forEach((p) => countItem(p.created_at));

    if (activeView === 'all') {
      certificates.forEach((c) => countItem(c.created_at || c.issue_date));
      testimonials.forEach((t) => countItem(t.created_at));
    }

    return months;
  }, [locale, projects, certificates, testimonials, activeView]);

  const totalInPeriod = chartData.reduce((acc, curr) => acc + curr.count, 0);

  // Initialize and update Chart.js instance
  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy any existing chart instance to prevent memory leaks or overlay issues
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    // Gradient fill from Teal to transparent
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(45, 212, 191, 0.35)');
    gradient.addColorStop(1, 'rgba(20, 184, 166, 0.00)');

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: chartData.map((d) => d.label),
        datasets: [
          {
            label:
              activeView === 'all'
                ? locale === 'ar'
                  ? 'إجمالي الأنشطة'
                  : 'Total Activity'
                : locale === 'ar'
                ? 'المشاريع'
                : 'Projects',
            data: chartData.map((d) => d.count),
            borderColor: '#2dd4bf',
            borderWidth: 2.5,
            pointBackgroundColor: '#2dd4bf',
            pointBorderColor: '#080d11',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#5eead4',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 2,
            fill: true,
            backgroundColor: gradient,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 150,
        animation: {
          duration: 350,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#0e161c',
            borderColor: 'rgba(45, 212, 191, 0.3)',
            borderWidth: 1,
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            titleFont: {
              family: locale === 'ar' ? 'Cairo, sans-serif' : 'Geist, sans-serif',
              size: 12,
              weight: 'bold',
            },
            bodyFont: {
              family: locale === 'ar' ? 'Cairo, sans-serif' : 'Geist, sans-serif',
              size: 12,
            },
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            rtl: locale === 'ar',
            callbacks: {
              label: (context) => {
                const count = context.parsed.y;
                return locale === 'ar'
                  ? `${count} عنصر موثق`
                  : `${count} recorded item(s)`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.04)',
            },
            ticks: {
              color: '#94a3b8',
              font: {
                family: locale === 'ar' ? 'Cairo, sans-serif' : 'Geist, sans-serif',
                size: 11,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.04)',
            },
            ticks: {
              color: '#94a3b8',
              stepSize: 1,
              font: {
                family: 'Geist, sans-serif',
                size: 11,
              },
            },
          },
        },
      },
    };

    let animFrame = 0;
    animFrame = requestAnimationFrame(() => {
      if (canvasRef.current) {
        chartInstanceRef.current = new Chart(ctx, config);
      }
    });

    return () => {
      cancelAnimationFrame(animFrame);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [chartData, activeView, locale]);

  return (
    <div className="admin-bento-chart-card">
      <div className="chart-card-header">
        <div>
          <h2 className="chart-card-title">
            {locale === 'ar' ? 'نشاط المحتوى الموثق' : 'Portfolio Content Activity'}
          </h2>
          <span className="chart-card-sub">
            {locale === 'ar'
              ? `${totalInPeriod} عنصر مسجل في قاعدة البيانات خلال آخر 6 أشهر`
              : `${totalInPeriod} record(s) logged in database across past 6 months`}
          </span>
        </div>

        {/* View Toggle Chips */}
        <div className="chart-toggle-chips">
          <button
            type="button"
            className={`chip-btn ${activeView === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveView('all')}
          >
            {locale === 'ar' ? 'جميع العناصر' : 'All Activity'}
          </button>
          <button
            type="button"
            className={`chip-btn ${activeView === 'projects' ? 'is-active' : ''}`}
            onClick={() => setActiveView('projects')}
          >
            {locale === 'ar' ? 'المشاريع فقط' : 'Projects Only'}
          </button>
        </div>
      </div>

      {/* Chart.js Canvas Visualizer */}
      <div className="chart-visual-wrapper">
        <canvas ref={canvasRef} className="admin-chart-canvas" />
      </div>
    </div>
  );
};
