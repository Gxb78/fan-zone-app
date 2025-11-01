import React, { Component } from 'react';
import FallbackUI from './FallbackUI';

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error) {
    // Met à jour l'état pour que le prochain rendu affiche l'UI de secours.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Vous pouvez également logger l'erreur à un service de monitoring
    console.error('Erreur interceptée par Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Affiche n'importe quelle UI de secours.
      return <FallbackUI error={this.state.error} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;