import React from 'react';

/**
 * Loader — centred spinner with optional message
 * Props: message
 */
const Loader = ({ message = 'Loading…' }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      gap: '1rem',
    }}
  >
    <div className="spinner" />
    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
      {message}
    </p>
  </div>
);

/**
 * SkeletonRow — a shimmer table row placeholder
 * Props: cols (number of columns)
 */
export const SkeletonRow = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i}>
        <div
          className="skeleton"
          style={{ height: 14, width: i === 0 ? '80%' : i % 2 === 0 ? '60%' : '70%' }}
        />
      </td>
    ))}
  </tr>
);

/**
 * TableSkeleton — multiple skeleton rows for table loading state
 * Props: rows, cols
 */
export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} cols={cols} />
    ))}
  </>
);

export default Loader;
