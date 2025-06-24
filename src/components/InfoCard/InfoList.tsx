import InfoCard from "./InfoCard";
import styles from "./InfoCard.module.css";

interface InfoItem<T> {
  label: string;
  value: keyof T | ((item: T) => string | number);
}

interface InfoCardProps<T> {
  title:  keyof T | ((item: T) => string);
  subtitle: keyof T | ((item: T) => string | undefined);
  info: InfoItem<T>[];
  actions?: (item: T) => React.ReactNode;
}

interface InfoListProps<T> {
  infoCard: InfoCardProps<T>;
  data: T[];
}

export default function InfoList<T extends { id: string }>(
  props: InfoListProps<T>
) {
  const { data, infoCard } = props;
  const { title, subtitle, actions, info } = infoCard;

  return (
    <div className={styles.tableContainer}>
      {data.map((each) => (
        <InfoCard
          key={each.id}
          title={typeof title === 'function' ? title(each) : String(each[title])}
          subtitle={typeof subtitle === 'function' ? subtitle(each) : String(each[subtitle])}
          info={info.map((item) => ({
            label: item.label,
            value:
              typeof item.value === "function"
                ? item.value(each)
                : String(each[item.value]),
          }))}
          actions={actions ? actions(each) : undefined}
        />
      ))}
    </div>
  );
}
