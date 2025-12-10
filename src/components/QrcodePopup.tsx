// components/QRCodePopup.tsx
import React, { useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import './QrcodePopup.css';

interface QRCodePopupProps {
  onClose: () => void;
  onResult: (result: string) => void;
}

const QRCodePopup: React.FC<QRCodePopupProps> = ({ onClose, onResult }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserQRCodeReader | null>(null);

  useEffect(() => {
    codeReader.current = new BrowserQRCodeReader();
    codeReader.current.decodeFromVideoDevice(undefined, videoRef.current!, (result, err) => {
      if (result) {
        onResult(result.getText());
        onClose();
      }
    });

    return () => {
        (codeReader.current as any)?.reset();
      };
  }, []);

  return (
    <div className="qr-popup-overlay">
      <div className="qr-popup-content">
        <video ref={videoRef} style={{ width: '100%' }} />
        <button onClick={onClose} className="qr-close-btn">Đóng</button>
      </div>
    </div>
  );
};

export default QRCodePopup;
