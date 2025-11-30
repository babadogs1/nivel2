import React from 'react';
import type { TableData } from '../types';

interface TableComponentProps {
  data: TableData;
}

const TableComponent: React.FC<TableComponentProps> = ({ data }) => {
  if (!data || !data.headers || !data.rows) {
    return <p className="my-4 text-red-500">Datos de la tabla inválidos.</p>;
  }
  
  return (
    <div className="my-6 overflow-x-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {data.headers.map((header, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
