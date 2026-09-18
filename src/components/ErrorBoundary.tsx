import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'An unexpected error occurred' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090b10] text-zinc-100 p-6">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#11141e] border border-[#23293d] shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 font-mono text-xl">
              !
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">360° View Notice</h2>
            <p className="text-sm text-zinc-400">
              The environment encountered an unexpected display issue. Click below to reload the 360° panorama workspace.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all"
            >
              Reload World
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
