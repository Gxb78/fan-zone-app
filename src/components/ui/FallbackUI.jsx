import React from 'react';

const fallbackStyles = {
  padding: '2rem',
  margin: '2rem',
  background: 'var(--surface-dark)',
  borderRadius: 'var(--border-radius)',
  border: '2px solid var(--danger)',
  color: 'var(--text-primary)',
  textAlign: 'center',
};

const FallbackUI = ({ error }) => (
  <div style={fallbackStyles}>
    <h2>😕 Oups ! Quelque chose s'est mal passé.</h2>
    <p>L'application a rencontré une erreur inattendue. Notre équipe technique a été prévenue.</p>
    <pre style={{ 
        color: 'var(--danger)', 
        textAlign: 'left', 
        background: 'var(--background-dark)', 
        padding: '1rem', 
        borderRadius: '8px', 
        whiteSpace: 'pre-wrap', 
        wordBreak: 'break-all',
        maxHeight: '200px',
        overflowY: 'auto',
        marginTop: '20px'
    }}>
      {error && error.toString()}
    </pre>
    <button
      className="navbar-btn"
      style={{ marginTop: '20px', background: 'var(--primary)' }}
      onClick={() => window.location.reload()}
    >
      Recharger la page
    </button>
  </div>
);

export default FallbackUI;