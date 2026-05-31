import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-slate-50 relative z-10 shadow-2xl">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-20 w-150 h-150 rounded-full bg-indigo-100/40 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 w-125 h-125 rounded-full bg-blue-100/40 blur-3xl" />
        </div>
        <div className="mx-auto w-full max-w-sm lg:max-w-[420px] relative z-10">
          {children}
        </div>
      </div>

      {/* Right side: Image */}
      <div className="hidden lg:flex flex-1 relative bg-slate-100 items-center justify-center p-12">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/auth-bg.png"
            alt="Abstract finance growth"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Glassmorphism Overlay */}
        <div className="relative z-10 bg-white/70 backdrop-blur-md p-10 rounded-3xl border border-white/50 shadow-xl max-w-md text-center mx-auto mt-auto mb-20">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Enterprise Lending</h2>
          <p className="text-slate-600 font-medium leading-relaxed">
            Experience a modern, highly secure platform designed to accelerate financial operations and borrower growth.
          </p>
        </div>
      </div>
    </div>
  );
}
