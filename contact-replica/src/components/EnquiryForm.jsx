import React, { useState } from 'react';

const SERVICES = [
  'Long Form',
  'Motion Designs',
  'Website Development',
  'Short Form',
  'Projects',
  'Something else...'
];

export default function EnquiryForm() {
  const [selectedServices, setSelectedServices] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    timeline: '',
    budget: '',
    message: '',
    privacy: false
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function toggleService(service) {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message || !formData.privacy) {
      alert('Please fill out all required fields (*)');
      return;
    }

    setLoading(true);
    try {
      // Post to local server backend
      await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enquiry-form',
          data: {
            ...formData,
            project: selectedServices,
            origin: 'Contact Page Replica'
          }
        })
      });
      setSubmitted(true);
    } catch (err) {
      // Fallback optimistic submission
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="success-card">
        <svg className="success-icon" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <h3 className="success-title">Thank you!</h3>
        <p className="success-subtitle">We'll be in contact soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Services Checkboxes */}
      <div className="form-group">
        <label className="form-label">WHAT ARE YOU LOOKING FOR?</label>
        <div className="checkbox-grid">
          {SERVICES.map(srv => {
            const isChecked = selectedServices.includes(srv);
            return (
              <div
                key={srv}
                className={`custom-checkbox-item ${isChecked ? 'checked' : ''}`}
                onClick={() => toggleService(srv)}
              >
                <div className="checkbox-box">
                  {isChecked && (
                    <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                      <path d="M1.5 6L5.5 10L12.5 1.5" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <span className="checkbox-label">{srv}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Name */}
      <div className="form-group">
        <label className="form-label">
          WHAT’S YOUR NAME? <span className="required-star">*</span>
        </label>
        <input
          type="text"
          className="form-input-text"
          placeholder="Your name"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      {/* Company */}
      <div className="form-group">
        <label className="form-label">WHAT’S YOUR COMPANY NAME?</label>
        <input
          type="text"
          className="form-input-text"
          placeholder="Your company"
          value={formData.company}
          onChange={e => setFormData({ ...formData, company: e.target.value })}
        />
      </div>

      {/* Email */}
      <div className="form-group">
        <label className="form-label">
          WHAT’S YOUR EMAIL ADDRESS? <span className="required-star">*</span>
        </label>
        <input
          type="email"
          className="form-input-text"
          placeholder="Your email address"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      {/* Timeline */}
      <div className="form-group">
        <label className="form-label">
          WHAT’S YOUR TIMELINE? <span className="required-star">*</span>
        </label>
        <input
          type="text"
          className="form-input-text"
          placeholder="Your ideal launch date"
          value={formData.timeline}
          onChange={e => setFormData({ ...formData, timeline: e.target.value })}
          required
        />
        <div className="form-hint">
          Knowing your deadline helps us to organise a realistic timeline
        </div>
      </div>

      {/* Budget */}
      <div className="form-group">
        <label className="form-label">
          WHAT’S YOUR BUDGET? <span className="required-star">*</span>
        </label>
        <input
          type="text"
          className="form-input-text"
          placeholder="£1k - £100k"
          value={formData.budget}
          onChange={e => setFormData({ ...formData, budget: e.target.value })}
          required
        />
        <div className="form-hint">
          Ballpark budgets help us create a better, more accurate proposal
        </div>
      </div>

      {/* Message */}
      <div className="form-group">
        <label className="form-label">
          TELL US ABOUT YOUR PROJECT <span className="required-star">*</span>
        </label>
        <textarea
          className="form-textarea"
          placeholder="Your project details"
          maxLength={1000}
          value={formData.message}
          onChange={e => setFormData({ ...formData, message: e.target.value })}
          required
        />
        <div className="textarea-footer">
          {formData.message.length} / 1000
        </div>
      </div>

      {/* Privacy Agreement */}
      <div
        className={`privacy-checkbox-row ${formData.privacy ? 'checked' : ''}`}
        onClick={() => setFormData({ ...formData, privacy: !formData.privacy })}
      >
        <div className="privacy-box">
          {formData.privacy && (
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
              <path d="M1.5 6L5.5 10L12.5 1.5" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          )}
        </div>
        <span className="privacy-text">
          I agree with the processing of my personal data
        </span>
      </div>

      {/* Submit Button */}
      <button type="submit" className="submit-btn" disabled={loading}>
        <span>{loading ? 'SENDING...' : 'SUBMIT'}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </form>
  );
}
