import React from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
}

/**
 * Toast notification component.
 */
export default function Toast({
  message,
  visible,
}: ToastProps): React.JSX.Element {
  return (
    <div id="toast" role="status" className={visible ? 'show' : ''}>
      {message}
    </div>
  );
}
