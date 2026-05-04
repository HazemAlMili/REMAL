export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-neutral-900">Remal</h1>
          <p className="text-neutral-500 text-sm mt-1">Property Management Platform</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
