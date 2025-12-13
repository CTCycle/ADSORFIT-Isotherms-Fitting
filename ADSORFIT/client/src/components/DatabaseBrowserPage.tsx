import React, { useState, useEffect, useCallback } from 'react';
import { fetchTableList, fetchTableData } from '../services';

interface TableInfo {
    table_name: string;
    display_name: string;
}

export const DatabaseBrowserPage: React.FC = () => {
    const [tables, setTables] = useState<TableInfo[]>([]);
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [columnCount, setColumnCount] = useState(0);
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch table list on mount
    useEffect(() => {
        const loadTables = async () => {
            const result = await fetchTableList();
            if (result.error) {
                setError(result.error);
            } else {
                setTables(result.tables);
                if (result.tables.length > 0) {
                    setSelectedTable(result.tables[0].table_name);
                }
            }
        };
        loadTables();
    }, []);

    // Fetch table data when selection changes
    const loadTableData = useCallback(async () => {
        if (!selectedTable) return;

        setLoading(true);
        setError(null);

        const result = await fetchTableData(selectedTable);

        if (result.error) {
            setError(result.error);
            setTableData([]);
            setColumns([]);
            setRowCount(0);
            setColumnCount(0);
            setDisplayName('');
        } else {
            setTableData(result.data);
            setColumns(result.columns);
            setRowCount(result.rowCount);
            setColumnCount(result.columnCount);
            setDisplayName(result.displayName);
        }

        setLoading(false);
    }, [selectedTable]);

    useEffect(() => {
        loadTableData();
    }, [loadTableData]);

    const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTable(e.target.value);
    };

    const handleRefresh = () => {
        loadTableData();
    };

    return (
        <div className="browser-page">
            <div className="browser-header">
                <div className="browser-title-section">
                    <span className="browser-label">ADSORFIT DATA</span>
                    <h1 className="browser-title">Database Browser</h1>
                    <p className="browser-subtitle">
                        Browse model fitting results and uploaded adsorption data.
                    </p>
                </div>
            </div>

            <div className="browser-controls">
                <div className="browser-select-group">
                    <label className="browser-select-label">Select Table</label>
                    <div className="browser-select-row">
                        <select
                            className="select-input browser-select"
                            value={selectedTable}
                            onChange={handleTableChange}
                            disabled={loading}
                        >
                            {tables.map((table) => (
                                <option key={table.table_name} value={table.table_name}>
                                    {table.display_name}
                                </option>
                            ))}
                        </select>
                        <button
                            className="browser-refresh-btn"
                            onClick={handleRefresh}
                            disabled={loading}
                            title="Refresh data"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10" />
                                <polyline points="1 20 1 14 7 14" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="browser-stats">
                    <span className="browser-stat-label">Statistics</span>
                    <span className="browser-stat-item">Rows: <strong>{rowCount}</strong></span>
                    <span className="browser-stat-item">Columns: <strong>{columnCount}</strong></span>
                    <span className="browser-stat-item">Table: <strong className="browser-stat-table">{displayName}</strong></span>
                </div>
            </div>

            {error && (
                <div className="browser-error">
                    {error}
                </div>
            )}

            <div className="browser-table-container">
                {loading ? (
                    <div className="browser-loading">
                        <div className="browser-spinner"></div>
                        <span>Loading data...</span>
                    </div>
                ) : tableData.length > 0 ? (
                    <div className="browser-table-scroll">
                        <table className="browser-table">
                            <thead>
                                <tr>
                                    {columns.map((col) => (
                                        <th key={col}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row, idx) => (
                                    <tr key={idx}>
                                        {columns.map((col) => (
                                            <td key={col}>
                                                {row[col] !== null && row[col] !== undefined
                                                    ? String(row[col])
                                                    : ''}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="browser-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <ellipse cx="12" cy="5" rx="9" ry="3" />
                            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                        </svg>
                        <p>No data available in this table.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
