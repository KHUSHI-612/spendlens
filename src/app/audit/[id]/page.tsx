export default function AuditPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-emerald-400 font-medium">
            Audit Complete
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4">
          Your <span className="gradient-text-blue">Spending Audit</span>
        </h1>
        <p className="text-white/40 text-lg">
          Audit ID: <code className="text-white/60 text-sm">{params.id}</code>
        </p>
      </div>

      {/* Placeholder for results */}
      <div className="glass-card-elevated p-8 sm:p-12 text-center glow-border">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-xl font-display font-semibold text-white mb-2">
          Results View Coming Soon
        </h2>
        <p className="text-white/40 max-w-md mx-auto">
          This page will display per-tool recommendations, savings
          calculations, AI-generated summary, and sharing options.
        </p>
      </div>
    </div>
  );
}
