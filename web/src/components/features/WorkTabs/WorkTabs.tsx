export interface WorkTabsProps {
  tabs: readonly string[];
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export function WorkTabs({ tabs, activeTab, setActiveTab }: WorkTabsProps) {
  return (
    <div
      className="d-flex gap-1 p-1 bg-secondary rounded-3"
      role="tablist"
      aria-label="View"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`btn flex-fill fw-bold fs-5 rounded-2 ${
              isActive ? "bg-light text-dark" : "bg-transparent text-light"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        );
      })}
    </div>
  );
}
