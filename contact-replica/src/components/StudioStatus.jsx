import React, { useState, useEffect } from 'react';

export default function StudioStatus() {
  const [timeString, setTimeString] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function updateClock() {
      const nowLondon = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' }));
      
      // Calculate BST vs GMT
      const formattedUK = new Date().toLocaleString('en-GB', { hour12: true, timeZone: 'Europe/London' });
      const londonHour = parseInt(formattedUK.split(':')[0], 10);
      const utcHour = new Date().getUTCHours();
      const isBST = londonHour !== utcHour;
      
      const parts = formattedUK.split(' ');
      parts.shift(); // Remove date or day part
      const timeOnly = (isBST ? 'BST ' : 'GMT ') + parts.join(' ').toUpperCase();
      setTimeString(timeOnly);

      // Studio hours: Mon(1) - Fri(5), 09:00 - 17:00
      const day = nowLondon.getDay();
      const hour = nowLondon.getHours();
      const month = nowLondon.getMonth() + 1;
      const date = nowLondon.getDate();
      
      // Holiday checks (Dec 20 - Jan 2)
      const isHoliday = (month === 12 && date >= 20) || (month === 1 && date <= 2);
      const open = day >= 1 && day <= 5 && hour >= 9 && hour < 17 && !isHoliday;
      setIsOpen(open);
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="studio-widget-container">
      <button className="clock-icon-btn" aria-label="Clock Status">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </button>

      <div className="studio-status-card">
        <div className="studio-time-header">
          {timeString || 'BST 09:00:00 AM'}
        </div>

        <div className="studio-state-banner">
          <div className="state-label">The studio is</div>
          <div className="state-val">{isOpen ? 'OPEN' : 'CLOSED'}</div>
        </div>
      </div>

      <div className="studio-hours-box">
        <div className="hours-title">Studio Hours</div>
        <div className="hours-row">
          <div className="hours-col">Mon - Fri</div>
          <div className="hours-col">09:00 - 17:00</div>
        </div>
      </div>
    </div>
  );
}
