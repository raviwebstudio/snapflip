import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full rounded-2xl border border-slate-900 bg-slate-950 p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Background accent light */}
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-[#0B3037]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-[#0B3037]/20 blur-3xl pointer-events-none" />
            
            <div className="space-y-3 relative z-10">
              <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wider">
                Application Exception
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                An unexpected runtime exception has occurred. You can attempt to refresh or navigate back to safety.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl max-h-24 overflow-y-auto text-left font-mono text-[10px] text-rose-400 select-text relative z-10">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-4 justify-center relative z-10">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-sky-500/20 cursor-pointer"
              >
                Reload Application
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/dashboard";
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-350 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
