import React from 'react';
import { IonSpinner, IonText } from '@ionic/react';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'default' | 'large';
  color?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Đang tải dữ liệu...', 
  size = 'default',
  color = 'primary'
}) => {
  const spinnerSize = {
    small: '16px',
    default: '24px',
    large: '32px'
  };

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px'
    }}>
      <IonSpinner 
        name="crescent" 
        style={{ 
          width: spinnerSize[size], 
          height: spinnerSize[size],
          marginBottom: '12px'
        }}
        color={color}
      />
      <IonText color="medium">
        <p style={{ margin: 0, fontSize: '14px' }}>{message}</p>
      </IonText>
    </div>
  );
};

export default Loading;