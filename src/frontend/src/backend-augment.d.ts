// Augment the generated backendInterface and Backend class to include
// internal methods that are added by optional Caffeine components.
import "./backend";

declare module "./backend" {
  interface backendInterface {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
  }
  interface Backend {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
  }
}
