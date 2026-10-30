import './StatCard.css';

const StatCard = ({ title, value, subtitle, icon, color = 'primary', trend }) => {
  const isTrendPositive = trend && !trend.startsWith('-');

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div>
          <p className="stat-card-title">{title}</p>
        </div>
        {icon && (
          <div className={`stat-card-icon stat-card-icon--${color}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="stat-card-value">{value}</p>
      <div className="stat-card-footer">
        {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
        {trend && (
          <span className={`stat-card-trend stat-card-trend--${isTrendPositive ? 'positive' : 'negative'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
