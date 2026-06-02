import { useState } from 'react';
import './AuthModal.css';

export default function AuthModal({ mode, onClose, onLogin, onSignup }) {
  const [activeMode, setActiveMode] = useState(mode);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignup = activeMode === 'signup';

  function updateField(event) {
    setForm(prev => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        await onSignup(form);
      } else {
        await onLogin({ email: form.email, password: form.password });
      }
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="auth-dialog" role="dialog" aria-modal="true" onMouseDown={event => event.stopPropagation()}>
        <div className="auth-head">
          <div>
            <h2>{isSignup ? 'Create account' : 'Welcome back'}</h2>
            <p>{isSignup ? 'Save favorites and protect your SkyCast profile.' : 'Log in to sync your favorites.'}</p>
          </div>
          <button type="button" className="auth-close" onClick={onClose}>x</button>
        </div>

        <div className="auth-switch">
          <button className={!isSignup ? 'active' : ''} onClick={() => setActiveMode('login')}>Login</button>
          <button className={isSignup ? 'active' : ''} onClick={() => setActiveMode('signup')}>Signup</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {isSignup && (
            <label>
              Name
              <input name="name" value={form.name} onChange={updateField} required maxLength="80" />
            </label>
          )}
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={updateField} required minLength="8" />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Working...' : isSignup ? 'Signup' : 'Login'}
          </button>
        </form>
      </section>
    </div>
  );
}
