import AppPreview from "./components/app-preview";
import Hero from "./components/hero";
import Navbar from "./components/nav-bar";

export default function Home() {
  return (
    <main className="min-h-dvh w-full relative">
      {/* Teal Glow Background */}
      <div
        className="
    absolute inset-0 z-0
    bg-[radial-gradient(125%_125%_at_50%_90%,#ffffff_40%,var(--primary)_100%)]
    dark:bg-[radial-gradient(125%_125%_at_50%_90%,#0f172a_40%,var(--primary)_150%)]
  "
      >
        {/* Light mode subtle grid */}
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            backgroundImage: `
        linear-gradient(to right, rgba(226,232,240,0.2) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(226,232,240,0.2) 1px, transparent 1px)
      `,
            backgroundSize: "60px 60px", // bigger spacing = fewer lines
            WebkitMaskImage:
              "radial-gradient(circle at 50% 40%, rgba(0,0,0,0.9) 70%, transparent 100%)",
            maskImage:
              "radial-gradient(circle at 50% 40%, rgba(0,0,0,0.9) 70%, transparent 100%)",
          }}
        />

        {/* Dark mode subtle grid */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage: `
        linear-gradient(to right, rgba(51,65,85,0.25) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(51,65,85,0.25) 1px, transparent 1px)
      `,
            backgroundSize: "60px 60px", // same here
            WebkitMaskImage:
              "radial-gradient(circle at 50% 40%, rgba(0,0,0,0.85) 65%, transparent 100%)",
            maskImage:
              "radial-gradient(circle at 50% 40%, rgba(0,0,0,0.85) 65%, transparent 100%)",
          }}
        />
      </div>

      {/* Your Content/Components */}
      <div className="relative">
        {/* Your Content/Components */}
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
          <Navbar />
          <Hero />
          <AppPreview />
        </div>
      </div>
    </main>
  );
}
