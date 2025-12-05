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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6M1 12h6m6 0h6" />
                    <path d="M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24M4.93 19.07l4.24-4.24m5.66-5.66l4.24-4.24" />
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
