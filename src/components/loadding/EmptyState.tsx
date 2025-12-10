import React from 'react';
import { IonText, IonIcon } from '@ionic/react';
import { documentOutline } from 'ionicons/icons';

interface EmptyStateProps {
  message?: string;
  showIcon?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = 'Không có dữ liệu', 
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
          icon={documentOutline} 
          style={{ 
            fontSize: '48px', 
            color: '#8c8c8c',
            marginBottom: '12px'
          }}
        />
      )}
      <IonText color="medium">
        <p style={{ margin: 0, fontSize: '14px' }}>{message}</p>
      </IonText>
    </div>
  );
};

export default EmptyState;
