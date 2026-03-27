import { motion } from "motion/react";
import { useAnnualRecords } from "../hooks/useQueries";
import { formatINR } from "../utils/format";

const YEARS = [
  "2025-2026",
  "2026-2027",
  "2027-2028",
  "2028-2029",
  "2029-2030",
  "2030-2031",
];

const YEAR_ICONS = ["☕", "🌿", "🫘", "🌱", "🍃", "✨"];

interface HomePageProps {
  onSelectYear: (year: string) => void;
}

export function HomePage({ onSelectYear }: HomePageProps) {
  const { data: annualRecords = [] } = useAnnualRecords();

  const getPL = (yearLabel: string) => {
    const record = annualRecords.find((r) => r.yearLabel === yearLabel);
    if (!record) return null;
    const income =
      Number(record.coffeeIncome) +
      Number(record.pepperIncome) +
      Number(record.arecanutIncome) +
      Number(record.paddyIncome);
    const expense =
      Number(record.fertilisers) +
      Number(record.irrigation) +
      Number(record.managerSalary) +
      Number(record.workersTotalSalary) +
      Number(record.miscellaneous);
    return income - expense;
  };

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden bg-estate-green shadow-xl"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.28 0.07 152) 0%, oklch(0.38 0.09 148) 50%, oklch(0.32 0.08 130) 100%)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{
            background: "oklch(0.84 0.05 85)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
          style={{
            background: "oklch(0.84 0.05 85)",
            transform: "translate(-30%, 30%)",
          }}
        />

        <div className="relative px-8 py-12 sm:px-12 sm:py-16">
          <div className="flex items-start gap-6">
            <div className="hidden sm:flex w-20 h-20 rounded-2xl bg-white/15 items-center justify-center flex-shrink-0 text-4xl">
              ☕
            </div>
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-estate-gold text-sm font-semibold uppercase tracking-widest mb-2"
              >
                Estate Management
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-3"
              >
                Welcome to
                <br />
                <span className="text-estate-gold">Pulkimad Estate</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/70 text-lg"
              >
                Select a financial year below to manage transactions,
                <br className="hidden sm:block" /> equipment, and profit/loss
                for that period.
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Year Grid */}
      <div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-display text-xl font-bold text-estate-text mb-6"
        >
          Financial Years
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {YEARS.map((year, i) => {
            const pl = getPL(year);
            const isProfit = pl !== null && pl >= 0;
            const isLoss = pl !== null && pl < 0;

            return (
              <motion.button
                key={year}
                type="button"
                data-ocid={`home.year.item.${i + 1}`}
                onClick={() => onSelectYear(year)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="relative text-left rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
              >
                {/* Card gradient bg */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      i % 3 === 0
                        ? "linear-gradient(135deg, oklch(0.28 0.07 152) 0%, oklch(0.42 0.09 148) 100%)"
                        : i % 3 === 1
                          ? "linear-gradient(135deg, oklch(0.32 0.07 40) 0%, oklch(0.44 0.09 50) 100%)"
                          : "linear-gradient(135deg, oklch(0.30 0.08 148) 0%, oklch(0.22 0.06 152) 100%)",
                  }}
                />

                {/* Decorative circle */}
                <div
                  className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-15"
                  style={{
                    background: "oklch(0.84 0.05 85)",
                    transform: "translate(40%, -40%)",
                  }}
                />

                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl">
                      {YEAR_ICONS[i]}
                    </div>
                    <div
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                      group-hover:bg-white/20 transition-colors"
                    >
                      <span className="text-white/70 text-lg group-hover:text-white transition-colors">
                        →
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-white mb-1">
                    {year}
                  </h3>
                  <p className="text-white/60 text-xs mb-4">
                    Apr {year.split("-")[0]} — Mar {year.split("-")[1]}
                  </p>

                  {/* P/L preview */}
                  <div className="border-t border-white/10 pt-4">
                    {pl === null ? (
                      <p className="text-white/40 text-xs">No data yet</p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            isProfit
                              ? "bg-green-400/20 text-green-300"
                              : isLoss
                                ? "bg-red-400/20 text-red-300"
                                : "bg-white/10 text-white/60"
                          }`}
                        >
                          {isProfit ? "↑ Profit" : "↓ Loss"}
                        </span>
                        <span className="text-white font-bold text-sm">
                          {formatINR(Math.abs(pl))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer blurb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center py-4"
      >
        <p className="text-muted-foreground text-sm">
          🌿 Pulkimad Coffee Estate, Coorg, Karnataka
        </p>
      </motion.div>
    </div>
  );
}
