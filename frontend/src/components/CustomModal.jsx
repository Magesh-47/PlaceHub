import React from 'react';

/**
 * CustomModal — alert / confirm dialog
 * Props: isOpen, onClose, onConfirm, title, message, type ('alert'|'confirm'), confirmText, cancelText
 */
const CustomModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'alert',
  confirmText = 'OK',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card animate-slide-down"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">
            {title || (type === 'confirm' ? 'Confirm Action' : 'Notice')}
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          {type === 'confirm' && (
            <button className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>
              {cancelText}
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => { if (onConfirm) onConfirm(); onClose(); }}
            style={{ flex: 1 }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
