import * as React from "react"

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | null>(null);

export const Tabs: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
  }
> = ({ defaultValue, value, onValueChange, children, ...props }) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || "");

  React.useEffect(() => {
    if (value !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(value);
    }
  }, [value]);

  const handleValueChange = (val: string) => {
    setActiveTab(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value: activeTab, onValueChange: handleValueChange }}>
      <div {...props}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={`flex items-center gap-1 ${className || ""}`} {...props} />
);

export const TabsTrigger: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
> = ({ value, className, children, ...props }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.value === value;

  return (
    <button
      type="button"
      className={`${className || ""} ${isActive ? "data-[state=active]:bg-[#4262ff] data-[state=active]:text-white shadow-sm" : ""}`}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => context.onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { value: string }
> = ({ value, children, ...props }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.value !== value) return null;

  return <div {...props}>{children}</div>;
};
