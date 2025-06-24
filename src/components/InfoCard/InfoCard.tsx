import React from 'react';
import styles from './InfoCard.module.css';

interface InfoItem {
  label: string;
  value: string | number;
}

interface InfoCardProps {
  title: string;
  subtitle?: string;
  info: InfoItem[];
  actions?: React.ReactNode;
}

const InfoCard = ({ title, subtitle, info, actions }: InfoCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{title}</h3>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
      <div className={styles.info}>
        {info.map((item, index) => (
          <p key={index}>
            <strong>{item.label}:</strong> {item.value}
          </p>
        ))}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
};

export default InfoCard;
