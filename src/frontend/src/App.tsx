import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Layout } from "./components/Layout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { YearDetailView } from "./pages/YearDetailView";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export type YearTab = "dashboard" | "transactions" | "equipment" | "profitloss";

export type AppView =
  | { kind: "home" }
  | { kind: "year"; yearLabel: string; tab: YearTab };

function AppInner() {
  const { identity, isInitializing } = useInternetIdentity();
  const [view, setView] = useState<AppView>({ kind: "home" });

  const username = identity
    ? identity.getPrincipal().toString().slice(0, 8)
    : "User";

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-estate-cream">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-estate-green mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Loading Pulkimad Estate...
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  const handleChangeTab = (tab: string) => {
    if (view.kind === "year") {
      setView({ ...view, tab: tab as YearTab });
    }
  };

  const handleHome = () => setView({ kind: "home" });

  return (
    <Layout
      view={view}
      onChangeTab={handleChangeTab}
      onHome={handleHome}
      username={username}
    >
      {view.kind === "home" && (
        <HomePage
          onSelectYear={(y) =>
            setView({ kind: "year", yearLabel: y, tab: "dashboard" })
          }
        />
      )}
      {view.kind === "year" && (
        <YearDetailView
          view={view}
          onChangeTab={(tab) => setView({ ...view, tab })}
          onHome={handleHome}
        />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
