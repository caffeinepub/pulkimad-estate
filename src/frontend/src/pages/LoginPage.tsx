import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen flex items-center justify-center bg-estate-cream relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, oklch(0.28 0.07 152) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, oklch(0.28 0.07 152) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.28 0.07 152) 0%, transparent 50%, oklch(0.84 0.05 85) 100%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-card rounded-2xl shadow-card-hover overflow-hidden">
          {/* Header bar */}
          <div className="bg-estate-green px-8 py-6 text-center">
            <img
              src="/assets/generated/pulkimad-logo-transparent.dim_120x120.png"
              alt="Pulkimad Estate"
              className="w-16 h-16 mx-auto mb-3 opacity-90"
            />
            <h1 className="font-display text-2xl font-bold text-primary-foreground tracking-wide">
              Pulkimad Estate
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "oklch(0.84 0.05 85 / 0.85)" }}
            >
              Coorg, Karnataka
            </p>
          </div>

          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-estate-text mb-2">
              Welcome Back
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              Sign in to manage your estate — finances, workers, and equipment.
            </p>

            <Button
              data-ocid="login.primary_button"
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full bg-estate-green hover:bg-estate-green-mid text-primary-foreground font-semibold py-3 text-base rounded-xl"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
                  in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Powered by Internet Identity — secure and private
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-estate-text-muted mt-6">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-estate-green"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
