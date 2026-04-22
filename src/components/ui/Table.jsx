import React from 'react';
import { MoreVertical } from 'lucide-react';

const Table = ({ columns, data, onRowClick }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th 
                key={column.header} 
                className="table-header text-left whitespace-nowrap"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
            <th className="table-header w-10"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex} 
              className="group hover:bg-gray-50 transition-colors cursor-pointer border-b border-border last:border-0"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column) => (
                <td key={column.header} className="table-cell whitespace-nowrap">
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
              <td className="table-cell">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

