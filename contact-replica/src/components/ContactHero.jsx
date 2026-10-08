import React from 'react';

export default function ContactHero() {
  return (
    <div className="hero-box">
      <div className="hero-label-badge">
        <span>CONVERSATION</span>
        
        {/* Wondermake Mailbox SVG Icon */}
        <span className="mailbox-icon">
          <svg width="42" height="34" viewBox="0 0 42 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="40" height="26" rx="3" stroke="#0F0F0F" strokeWidth="2" fill="none"/>
            <path d="M1 2L21 17L41 2" stroke="#0F0F0F" strokeWidth="2"/>
            <path d="M16 27V33H26V27" stroke="#0F0F0F" strokeWidth="2"/>
            <circle cx="21" cy="20" r="3" fill="#0F0F0F"/>
          </svg>
        </span>

        <span>INVITATION</span>
      </div>

      <h1 className="hero-title">CONTACT</h1>

      <p className="hero-subtitle">
        Get in touch, drop us a line, give us a bell and let’s make something wonderful together
      </p>
    </div>
  );
}
