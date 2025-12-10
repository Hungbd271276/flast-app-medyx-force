import React from 'react';
import { IonText, IonIcon } from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';

interface ErrorMessageProps {
  message?: string;
  showIcon?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message = 'Đã xảy ra lỗi', 
  showIcon = true 
}) => {
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
      {showIcon && (
        <IonIcon 
          icon={alertCircleOutline} 
          style={{ 
            fontSize: '48px', 
            color: '#ff4961',
            marginBottom: '12px'
          }}
        />
      )}
      <IonText color="danger">
        <p style={{ margin: 0, fontSize: '14px' }}>{message}</p>
      </IonText>
    </div>
  );
};

export default ErrorMessage; 