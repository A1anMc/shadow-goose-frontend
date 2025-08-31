
interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  iconColor?: 'primary' | 'success' | 'warning' | 'error';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'primary',
  trend,
  onClick,
  className = ''
}: DashboardCardProps) {
  return (
    <div
      className={`dashboard-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="dashboard-card-header">
        <div className="dashboard-card-icon primary">
          {icon && <span>{icon}</span>}
        </div>
        {trend && (
          <div className={`dashboard-card-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <div className="dashboard-card-title">{title}</div>
      <div className="dashboard-card-value">{value}</div>
      
      {subtitle && (
        <div className="text-sm text-gray-500 mt-2">{subtitle}</div>
      )}
    </div>
  );
}
