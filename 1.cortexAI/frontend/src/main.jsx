import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Provider} from "react-redux"
import { store } from './redux/store.js'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught Error in App:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: "white", padding: 24, backgroundColor: "#0d0f14", minHeight: "100vh", fontFamily: "sans-serif" }}>
          <h2 style={{ color: "#f87171" }}>App Encountered an Error:</h2>
          <pre style={{ backgroundColor: "#1e293b", padding: 16, borderRadius: 8, overflowX: "auto" }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <Provider store={store}>
      <App />
    </Provider>
  </ErrorBoundary>
)
