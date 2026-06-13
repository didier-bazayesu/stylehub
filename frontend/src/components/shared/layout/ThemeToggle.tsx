import { useUIStore } from "@/store";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const [isOpen, setIsOpen] = useState(false);

  const current = themes.find((t) => t.value === theme) || themes[0];
  const CurrentIcon = current.icon;

  return (
    <div className="relative px-3 py-2">
      {/* Dropdown Trigger - Looks like other sidebar items */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
          "text-zinc-700 dark:text-zinc-300",
        )}
      >
        <div className="flex items-center gap-3">
          <CurrentIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Theme</span>
        </div>
        <ChevronDown
          className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-4 right-4 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-1 z-50">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value as "light" | "dark" | "system");
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                theme === value &&
                  "bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-500",
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {theme === value && (
                <div className="ml-auto text-emerald-500">✓</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Close when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
