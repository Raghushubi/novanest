import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const active = (path) => loc.pathname === path ? { color: 'var(--purple2)', borderBottom: '2px solid var(--purple)' } : {};

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(13,13,26,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '0.5px solid var(--border)',
      padding: '0 24px', display: 'flex', alignItems: 'center',
      height: '60px', gap: '8px'
    }}>
      <Link to="/" style={{ textDecoration: 'none', marginRight: 'auto' }}>
        <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--purple2)' }}>🌸 NovaNest</span>
      </Link>

      {user && <>
        <Link to="/dashboard" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '14px', color: 'var(--text2)', ...active('/dashboard') }}>Dashboard</Link>
        <Link to="/notes" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '14px', color: 'var(--text2)', ...active('/notes') }}>Notes</Link>
        <Link to="/security" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '14px', color: 'var(--text2)', ...active('/security') }}>Security Log</Link>
        {user.role === 'admin' && <Link to="/admin" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '14px', color: 'var(--teal)', ...active('/admin') }}>Admin</Link>}
        <Link to="/profile" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '14px', color: 'var(--text2)', ...active('/profile') }}>Profile</Link>
        <button className="btn btn-ghost" onClick={handleLogout} style={{ fontSize: '13px', padding: '6px 14px' }}>Logout</button>
      </>}
      {!user && <>
        <Link to="/login"><button className="btn btn-ghost" style={{ fontSize: '13px' }}>Login</button></Link>
        <Link to="/register"><button className="btn btn-primary" style={{ fontSize: '13px' }}>Register</button></Link>
      </>}
    </nav>
  );
}
