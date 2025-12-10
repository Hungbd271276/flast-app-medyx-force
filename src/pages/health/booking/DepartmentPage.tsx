import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonLabel, IonIcon, IonButton } from '@ionic/react';
import DepartmentGrid from '../../../components/departmentgrid/DepartmentGrid';
import { useSelector, useDispatch } from '../../../utils/redux/hooks';
import { setDepartments } from '../../../utils/redux/departmentSlice';
import axiosInstance from '../../../utils/functions/axios';
import { setSelectedDepartment } from '../../../utils/redux/booking';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import './DepartmentPage.css';
interface DepartmentPageProps {
  onNext: () => void;
  onBack: () => void;
}

const DepartmentPage: React.FC<DepartmentPageProps> = ({ onNext, onBack }) => {
  const dispatch = useDispatch();
  const { departments, departmentBody } = useSelector(state => state.department);
  const { selectedDepartmentId } = useSelector(state => state.booking);
  const handleSelect = (id: string | number) => {
    dispatch(setSelectedDepartment(id));
  };
  const { t, i18n } = useTranslation();
  const departmentIcons = import.meta.glob('../../../assets/images/imgdepart/*.svg', { eager: true, import: 'default' });
  function getDepartmentIcon(iconKey: string): string {
    const path = `../../../assets/images/imgdepart/${iconKey}.svg`;
    return (departmentIcons[path] || departmentIcons['../../../assets/images/imgdepart/default.svg']) as string;
  }

  useEffect(() => {
    if (!departments || departments.length === 0) {
      const fetchDepartments = async () => {
        try {
          const { data } = await axiosInstance.post(
            '/MedyxAPI/BenhNhan/GetPublicList',
            departmentBody,
            {}
          );
          dispatch(setDepartments(data.data || []));
        } catch (error) {
          dispatch(setDepartments([]));
        }
      };
      fetchDepartments();
    }
  }, [departments, departmentBody, dispatch]);
  return (
    <div>
      <div className="department-page-content">
        <h3 className="news-section-title">{t('department')}</h3>
        <DepartmentGrid
          departments={departments || []}
          getDepartmentIcon={getDepartmentIcon}
          selectedId={selectedDepartmentId}
          onSelect={handleSelect}
        />
      </div>
      <div className="navigation-buttons">
          <IonButton fill="outline" onClick={onBack} className="back-btn">
            <IonIcon slot="start" icon={chevronBackOutline} />
            Quay lại
          </IonButton>

          <IonButton
            onClick={onNext}
            className="confirm-btn"
            disabled={selectedDepartmentId == null}
          >
            Tiếp tục
            <IonIcon slot="end" icon={chevronForwardOutline} />
          </IonButton>
        </div>
    </div>

  );
};


export default DepartmentPage;
