
import React from 'react';

const Controls = ({ onMove, isLoading }) => (
  <div style={{
    position: 'absolute', 
    top: 10,
    left: 10,
    zIndex: 1, 
    background: 'white',
    padding: 10,
    borderRadius: 5,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)', 
    display: 'flex', 
    gap: '10px'
  }}>
    <button onClick={() => onMove(0, 500)} disabled={isLoading}>North</button>
    <button onClick={() => onMove(180, 500)} disabled={isLoading}>South</button>
    <button onClick={() => onMove(90, 500)} disabled={isLoading}>East</button>
    <button onClick={() => onMove(270, 500)} disabled={isLoading}>West</button>
  </div>
);

export default Controls;