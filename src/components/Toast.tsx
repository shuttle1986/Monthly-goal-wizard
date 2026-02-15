import { useEffect, useState } from 'react';

let showToastGlobal: ((msg: string) => void) | null = null;

export function toast(msg: string) {
  showToastGlobal?.(msg);
}

export default function ToastContainer() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    showToastGlobal = (msg: string) => {
      setMessage(msg);
      setVisible(true);
      setTimeout(() => setVisible(false), 3000);
    };
    return () => {
      showToastGlobal = null;
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-toast">
      <div className="bg-gray-900/95 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2">
        <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        {message}
      </div>
    </div>
  );
}
