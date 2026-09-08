import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

/**
 * PasswordInput — text input with a show/hide eye toggle.
 *
 * Default rendering assumes a standalone `.form-control` field and positions
 * the toggle button absolutely inside it. Pass `bare` to render just the
 * input and button as plain siblings instead — for embedding inside a
 * differently-styled wrapper (e.g. Login's `.login-input-wrap` flex row)
 * that provides its own layout, background, and icon.
 */
const PasswordInput = ({
  value, onChange, autoFocus, placeholder, required, disabled, name, id, autoComplete, bare = false,
}) => {
  const [visible, setVisible] = useState(false);

  const input = (
    <input
      id={id}
      type={visible ? 'text' : 'password'}
      className={bare ? undefined : 'form-control'}
      style={bare ? undefined : { paddingRight: '2.5rem' }}
      name={name}
      value={value}
      onChange={onChange}
      autoFocus={autoFocus}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      autoComplete={autoComplete}
    />
  );

  const toggleButton = (
    <button
      type="button"
      onClick={() => setVisible((v) => !v)}
      disabled={disabled}
      aria-label={visible ? 'Hide password' : 'Show password'}
      title={visible ? 'Hide password' : 'Show password'}
      style={bare ? {
        background: 'none', border: 'none', padding: 0, margin: 0,
        display: 'flex', alignItems: 'center', cursor: disabled ? 'default' : 'pointer', flexShrink: 0,
      } : {
        position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', padding: 0, cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', color: 'var(--text-muted)',
      }}
    >
      {visible ? <FiEyeOff size={15} /> : <FiEye size={15} />}
    </button>
  );

  if (bare) {
    return (
      <>
        {input}
        {toggleButton}
      </>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {input}
      {toggleButton}
    </div>
  );
};

export default PasswordInput;
