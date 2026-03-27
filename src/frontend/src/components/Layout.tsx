import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronRight, Home, LogOut, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { AppView, YearTab } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const TAB_ITEMS: { id: YearTab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "transactions", label: "Transactions" },
  { id: "equipment", label: "Equipment" },
  { id: "profitloss", label: "Profit / Loss" },
];

interface LayoutProps {
  view: AppView;
  onChangeTab: (tab: string) => void;
  onHome: () => void;
  username: string;
  children: React.ReactNode;
}

export function Layout({
  view,
  onChangeTab,
  onHome,
  username,
  children,
}: LayoutProps) {
  const { clear } = useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isYearView = view.kind === "year";
  const currentTab = isYearView ? view.tab : null;
  const yearLabel = isYearView ? view.yearLabel : null;

  const tabLabel = TAB_ITEMS.find((t) => t.id === currentTab)?.label ?? "";

  return (
    <div className="min-h-screen flex flex-col bg-estate-cream">
      {/* Header */}
      <header className="bg-estate-green shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onHome}
            className="flex items-center gap-3 group"
            data-ocid="header.home.link"
          >
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
              <img
                src="/assets/generated/pulkimad-logo-transparent.dim_120x120.png"
                alt="Pulkimad Estate"
                className="w-9 h-9 object-contain"
              />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg leading-tight group-hover:text-estate-gold transition-colors">
                Pulkimad Estate
              </h1>
              <p className="text-xs text-white/60">Coorg, Karnataka</p>
            </div>
          </button>

          {/* Desktop user */}
          <div className="hidden sm:flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-ocid="header.dropdown_menu"
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-white/10 text-white"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-estate-gold text-estate-green text-xs font-semibold">
                      {username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-white">
                    {username}
                  </span>
                  <ChevronDown className="w-4 h-4 text-white/60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  data-ocid="header.logout_button"
                  onClick={() => clear()}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="sm:hidden p-2 text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Breadcrumb + Tab Bar (year view) */}
        {isYearView && (
          <div className="border-t border-white/10">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-1.5 text-xs text-white/60">
              <button
                type="button"
                onClick={onHome}
                data-ocid="breadcrumb.home.link"
                className="flex items-center gap-1 hover:text-estate-gold transition-colors"
              >
                <Home className="w-3 h-3" /> Home
              </button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/80 font-medium">{yearLabel}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-estate-gold font-medium">{tabLabel}</span>
            </div>

            {/* Tab Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 hidden sm:flex items-center gap-0">
              {TAB_ITEMS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  data-ocid={`nav.${item.id}.tab`}
                  onClick={() => onChangeTab(item.id)}
                  className={`px-5 py-2.5 text-sm font-medium transition-colors relative ${
                    currentTab === item.id
                      ? "text-estate-gold"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}
                  {currentTab === item.id && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-estate-gold"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Mobile nav dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sm:hidden bg-estate-green overflow-hidden z-30"
          >
            <div className="px-4 py-2 flex flex-col">
              <button
                type="button"
                data-ocid="mobile.home.link"
                onClick={() => {
                  onHome();
                  setMobileOpen(false);
                }}
                className="py-3 text-left text-sm font-medium border-b border-white/10 text-white/80 flex items-center gap-2"
              >
                <Home className="w-4 h-4" /> Home
              </button>
              {isYearView &&
                TAB_ITEMS.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    data-ocid={`mobile.nav.${item.id}.tab`}
                    onClick={() => {
                      onChangeTab(item.id);
                      setMobileOpen(false);
                    }}
                    className={`py-3 text-left text-sm font-medium border-b border-white/10 last:border-0 ${
                      currentTab === item.id
                        ? "text-estate-gold"
                        : "text-white/80"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              <button
                type="button"
                data-ocid="mobile.logout_button"
                onClick={() => clear()}
                className="py-3 text-left text-sm font-medium text-red-300 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={
              view.kind === "year" ? `${view.yearLabel}-${view.tab}` : "home"
            }
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-estate-green text-white/50 text-center text-xs py-4">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-estate-gold transition-colors"
        >
          Built with love using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
