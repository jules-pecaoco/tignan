import { useEffect } from 'react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: '#2C2C2A',
      border: '1px solid #444441',
      borderLeft: `4px solid ${type === 'success' ? '#639922' : '#E24B4A'}`,
      padding: '12px 16px',
      color: '#F1EFE8',
      fontFamily: 'monospace',
      fontSize: '13px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      {message}
      <button onClick={onClose} style={{
        background: 'none', border: 'none', color: '#888780', cursor: 'pointer', fontSize: '16px'
      }}>×</button>
    </div>
  );
}
