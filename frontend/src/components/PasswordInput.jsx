import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const PasswordInput = ({ value, onChange, autoFocus, placeholder, required, disabled, name }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={visible ? 'text' : 'password'}
        className="form-control"
        style={{ paddingRight: '2.5rem' }}
        name={name}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', padding: 0, cursor: disabled ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', color: 'var(--text-muted)',
        }}
      >
        {visible ? <FiEyeOff size={15} /> : <FiEye size={15} />}
      </button>
    </div>
  );
};

export default PasswordInput;
