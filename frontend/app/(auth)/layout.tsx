export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-20 w-150 h-150 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-125 h-125 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="w-full max-w-105 relative z-10">{children}</div>
    </div>
  );
}
