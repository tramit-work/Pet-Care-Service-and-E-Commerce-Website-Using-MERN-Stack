import { useEffect } from 'react';

function Snackbar({ message, onHide }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onHide, 3000);
    return () => clearTimeout(timer);
  }, [message, onHide]);

  return (
    <div id="snackbar" className={message ? 'show' : ''}>
      {message}
    </div>
  );
}

export default Snackbar;
