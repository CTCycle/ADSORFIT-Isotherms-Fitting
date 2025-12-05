import React from 'react';

export const MetricsPage: React.FC = () => {
    return (
        <div className="metrics-page">
            <div className="card" style={{ height: '100%', minHeight: '600px' }}>
                <h2 className="section-title">Fitting Metrics</h2>
                <div className="plot-canvas">
                    <div className="plot-placeholder">
                        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                        <p>Plot canvas ready</p>
                        <p className="text-sm" style={{ color: 'var(--slate-500)' }}>
                            Metrics will be displayed here after fitting
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
