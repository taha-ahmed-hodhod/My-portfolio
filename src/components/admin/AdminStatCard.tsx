import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  accentColor?: string;
  badge?: string;
  isWarning?: boolean;
  onClick?: () => void;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'var(--accent-light)',
  badge,
  isWarning,
  onClick,
}) => {
  return (
    <div
      className={`admin-bento-stat-card ${onClick ? 'is-clickable' : ''} ${
        isWarning ? 'is-warning' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="stat-card-top">
        <span className="stat-card-label">{title}</span>
        <div
          className="stat-card-icon-bubble"
          style={{ color: accentColor }}
        >
          <Icon size={18} />
        </div>
      </div>

      <div className="stat-card-mid">
        <span className="stat-card-value">{value}</span>
        {badge && (
          <span
            className={`stat-card-badge ${
              isWarning ? 'badge-warning' : 'badge-neutral'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="stat-card-bottom">
        <span className="stat-card-sub">{subtitle}</span>
      </div>

      {/* Underline accent indicator */}
      <div
        className="stat-card-accent-line"
        style={{
          background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)`,
        }}
      />
    </div>
  );
};
