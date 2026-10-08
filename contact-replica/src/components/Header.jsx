import React from 'react';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="site-header">
      <button className="header-menu-btn" aria-label="Open Menu">
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      <a href="/" className="header-logo-box">
        W<span className="asterisk">✱</span>NDERMAKE
      </a>

      <div className="header-spacer"></div>

      <div className="header-tabs">
        <button
          className={`tab-btn ${activeTab === 'enquiry' ? 'active' : ''}`}
          onClick={() => setActiveTab('enquiry')}
        >
          <span>ENQUIRY</span>
          <svg className="chevron" width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <button
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <span>GENERAL</span>
          <svg className="chevron" width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
