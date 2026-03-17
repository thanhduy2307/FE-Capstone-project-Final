import React, { useState } from 'react';
import './Table.css';

const Table = ({ 
  columns, 
  data, 
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  isLoading = false,
  emptyMessage = 'No data available',
  className = ''
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange(data.map(row => row.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      onSelectionChange(selectedRows.filter(rowId => rowId !== id));
    } else {
      onSelectionChange([...selectedRows, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="table-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`}>
      <table className="table">
        <thead>
          <tr>
            {selectable && (
              <th className="table-checkbox">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length}
                  onChange={handleSelectAll}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.sortable ? 'sortable' : ''}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="th-content">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <span className="sort-icon">
                      {sortConfig.key === column.key ? (
                        sortConfig.direction === 'asc' ? '↑' : '↓'
                      ) : '↕'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'clickable' : ''}
            >
              {selectable && (
                <td className="table-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
