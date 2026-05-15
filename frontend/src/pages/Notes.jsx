import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import api from '../utils/api';
import { encryptNote, decryptNote } from '../utils/crypto';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', is_encrypted: false });
  const [encPass, setEncPass] = useState('');
  const [decPass, setDecPass] = useState('');
  const [decrypted, setDecrypted] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    const { data } = await api.get('/notes');
    setNotes(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      let content = form.content;
      if (form.is_encrypted) {
        if (!encPass) { setError('Enter encryption password'); setLoading(false); return; }
        content = encryptNote(form.content, encPass);
      }
      await api.post('/notes', { title: form.title, content, is_encrypted: form.is_encrypted });
      setForm({ title: '', content: '', is_encrypted: false }); setEncPass('');
      setSuccess('Note saved! ✨');
      fetchNotes();
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(errs ? errs.map(e => e.msg).join(', ') : err.response?.data?.error || 'Failed');
    } finally { setLoading(false); }
  };

  const handleDecrypt = (noteId, content) => {
    if (!decPass) return;
    const plain = decryptNote(content, decPass);
    if (plain === null) setDecrypted(p => ({ ...p, [noteId]: '⚠ Wrong password or corrupted data' }));
    else setDecrypted(p => ({ ...p, [noteId]: plain }));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    await api.delete(`/notes/${id}`);
    fetchNotes();
  };

  // XSS demo: content is sanitized before display
  const safeContent = (text) => DOMPurify.sanitize(text);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--purple2)', marginBottom: '8px' }}>📝 Notes Vault</h1>
      <p style={{ color: 'var(--text2)', marginBottom: '28px', fontSize: '14px' }}>
        Input is validated server-side · XSS prevented via DOMPurify · SQLi blocked via parameterized queries
      </p>

      {/* Create note form */}
      <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Create New Note</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Note title..." required maxLength={100} />
          <textarea value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))} placeholder="Write your note here..." rows={4} required style={{ resize: 'vertical' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(168,148,255,0.06)', borderRadius: '10px', border: '0.5px solid var(--border)' }}>
            <input type="checkbox" id="enc" checked={form.is_encrypted} onChange={e => setForm(p => ({...p, is_encrypted: e.target.checked}))} style={{ width: '16px', height: '16px' }} />
            <label htmlFor="enc" style={{ fontSize: '14px', color: 'var(--text2)', cursor: 'pointer' }}>🔒 Encrypt with AES-256 (client-side)</label>
          </div>

          {form.is_encrypted && (
            <input type="password" value={encPass} onChange={e => setEncPass(e.target.value)} placeholder="Encryption password (you must remember this!)" />
          )}

          {error && <p className="error-msg">⚠ {error}</p>}
          {success && <p className="success-msg">{success}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Note 🚀'}</button>
        </form>
      </div>

      {/* Decrypt password input */}
      {notes.some(n => n.is_encrypted) && (
        <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="password" value={decPass} onChange={e => setDecPass(e.target.value)} placeholder="Password to decrypt notes..." style={{ flex: 1 }} />
        </div>
      )}

      {/* Notes list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {notes.length === 0 && <p style={{ color: 'var(--text3)', textAlign: 'center', padding: '40px' }}>No notes yet. Create your first one! 🌸</p>}
        {notes.map(note => (
          <div key={note.id} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <h3 style={{ fontWeight: 600, color: 'var(--text)' }}>{note.title}</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                {note.is_encrypted && <span className="badge badge-purple">🔒 AES-256</span>}
                <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleDelete(note.id)}>Delete</button>
              </div>
            </div>

            {note.is_encrypted ? (
              <div>
                {decrypted[note.id] ? (
                  <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.6 }}
                     dangerouslySetInnerHTML={{ __html: safeContent(decrypted[note.id]) }} />
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text3)', flex: 1 }}>🔐 Content encrypted. Enter password above and click Decrypt.</p>
                    <button className="btn btn-teal" style={{ padding: '4px 12px', fontSize: '12px', flexShrink: 0 }} onClick={() => handleDecrypt(note.id, note.content)}>Decrypt</button>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.6 }}
                 dangerouslySetInnerHTML={{ __html: safeContent(note.content) }} />
            )}

            <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '10px' }}>
              {new Date(note.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
