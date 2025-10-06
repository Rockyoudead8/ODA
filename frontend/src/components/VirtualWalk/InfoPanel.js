
import React from 'react';

const InfoPanel = ({ info, isLoading }) => (
  <div style={{
   
    width: '100%', 
    background: 'white', 
    padding: 15,
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxHeight: '25%', 
    overflowY: 'auto'
  }}>
    <h3 style={{
        fontSize: '1.1em',
        marginBottom: '10px',
        fontWeight: 'bold',
        color: '#333'
    }}>
        Location Information
    </h3>
    <div style={{
        borderTop: '2px solid red', 
        paddingTop: '10px'
    }}>
        {isLoading ? <p>Fetching new location data...</p> : <p>{info}</p>}
    </div>
  </div>
);

export default InfoPanel;