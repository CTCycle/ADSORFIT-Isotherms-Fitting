import React from 'react';

interface SidebarProps {
    currentPage: 'config' | 'models' | 'metrics';
    onPageChange: (page: 'config' | 'models' | 'metrics') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
    return (
        <div className="sidebar">
            <button
                className={`sidebar-icon ${currentPage === 'config' ? 'active' : ''}`}
                onClick={() => onPageChange('config')}
                title="Configuration"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
            </button>
            <button
                className={`sidebar-icon ${currentPage === 'models' ? 'active' : ''}`}
                onClick={() => onPageChange('models')}
                title="Models"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                </svg>
            </button>
            <button
                className={`sidebar-icon ${currentPage === 'metrics' ? 'active' : ''}`}
                onClick={() => onPageChange('metrics')}
                title="Metrics"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
            </button>
        </div>
    );
};
