import { useState, useEffect } from 'react';
import api from '../utils/api';

const readableEvent = {
  LOGIN_SUCCESS: 'Successful Login',
  LOGIN_FAIL: 'Failed Login Attempt',
  REGISTER: 'Account Created'
};

const eventColors = {
  LOGIN_SUCCESS: 'badge-success',
  LOGIN_FAIL: 'badge-danger',
  REGISTER: 'badge-purple',
  default: 'badge-warning'
};

export default function SecurityLog() {
  const [logs, setLogs] = useState([]);
  const [headers, setHeaders] = useState(null);

  useEffect(() => {
    api.get('/security/logs/me')
      .then((r) => setLogs(r.data))
      .catch(() => {});

    api.get('/security/headers')
      .then((r) => setHeaders(r.data))
      .catch(() => {});
  }, []);

  return (
    <div
      style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '32px 24px'
      }}
    >
      <h1
        style={{
          fontSize: '26px',
          fontWeight: 700,
          color: 'var(--purple2)',
          marginBottom: '8px'
        }}
      >
        🔍 Security Activity
      </h1>

      <p
        style={{
          color: 'var(--text2)',
          marginBottom: '28px',
          fontSize: '14px'
        }}
      >
        This page records important account-related security events.
      </p>

      {headers && (
        <div
          className="card"
          style={{
            padding: '20px',
            marginBottom: '24px'
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '14px'
            }}
          >
            🪖 HTTP Security Headers
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {Object.entries(headers.headers).map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  gap: '12px',
                  fontSize: '13px',
                  padding: '8px 12px',
                  background: 'rgba(168,148,255,0.05)',
                  borderRadius: '8px'
                }}
              >
                <span
                  style={{
                    color: 'var(--teal)',
                    fontWeight: 500,
                    minWidth: '200px',
                    flexShrink: 0
                  }}
                >
                  {k}
                </span>

                <span style={{ color: 'var(--text2)' }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="card"
        style={{
          padding: '20px'
        }}
      >
        <h2
          style={{
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '16px'
          }}
        >
          📋 Account Activity Log
        </h2>

        {logs.length === 0 ? (
          <p
            style={{
              color: 'var(--text3)',
              textAlign: 'center',
              padding: '20px'
            }}
          >
            No events recorded yet.
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  border: '0.5px solid var(--border)'
                }}
              >
                <span
                  className={`badge ${
                    eventColors[log.event_type] || eventColors.default
                  }`}
                  style={{ flexShrink: 0 }}
                >
                  {readableEvent[log.event_type] || log.event_type}
                </span>

                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text2)'
                    }}
                  >
                    {log.details || '—'}
                  </p>

                  <p
                    style={{
                      fontSize: '11px',
                      color: 'var(--text3)',
                      marginTop: '3px'
                    }}
                  >
                    IP: {log.ip_address} ·{' '}
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}