
interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
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
  trend,
  onClick,
  className = ''
}: DashboardCardProps) {
  return (
    <div
      className={`card cursor-pointer group ${onClick ? 'hover:shadow-lg' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {icon && <span className="text-xl">{icon}</span>}
              <h3 className="text-sm font-medium text-secondary">{title}</h3>
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-primary">{value}</p>
              {trend && (
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? 'text-success' : 'text-error'
                  }`}
                >
                  {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-secondary mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
