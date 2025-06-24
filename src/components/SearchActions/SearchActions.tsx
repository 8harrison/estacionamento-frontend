import styles from "./SearchActions.module.css";

interface SearchActionsProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearch?: (e: React.FormEvent) => void;
  onAdd: () => void;
  searchPlaceholder?: string;
  addButtonLabel?: string;
  showAddButton?: boolean;
  showSearchButton?: boolean;
}

function SearchActions({
  onSearch,
  searchTerm,
  searchPlaceholder,
  onAdd,
  addButtonLabel,
  onSearchTermChange,
  showSearchButton = true,
}: SearchActionsProps) {
  return (
    <div className={styles.actionsContainer}>
      <form onSubmit={onSearch} className={styles.searchForm}>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.buttonGroup}>
          {showSearchButton && (
            <button type="submit" className={styles.searchButton}>
              Buscar
            </button>
          )}
          <button className={styles.addButton} onClick={onAdd}>
            {addButtonLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SearchActions;
