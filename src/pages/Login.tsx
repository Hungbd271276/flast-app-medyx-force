import { useState } from 'react';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonList,
  IonPage,
  IonText,
  useIonToast
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';

import discoveryTool from '../assets/images/discoveryTool.png';
import arrowSvg from '../assets/svg/arrow.svg';
import { restoreAuthFromStorage, saveAuthData } from '../utils/functions/authService';
import axiosInstance from '../utils/functions/axios';
import { useDispatch } from '../utils/redux/hooks';
import './Login.css';

const LoginPage: React.FC = () => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { username: '', password: '' },
  });
  const dispatch = useDispatch();
  const history = useHistory();
  const [present] = useIonToast();
  const [showPassword, setShowPassword] = useState(false);

  const toBase64Unicode = (str: string) =>
    btoa(unescape(encodeURIComponent(str)));

  const onSubmit = async (value: any) => {
    try {
      const encoded = toBase64Unicode(`${value.username}:${value.password}`);
      const { data } = await axiosInstance.get(`/MedyxAPI/Login`, {
        headers: { 'Authorization': 'Basic ' + encoded }
      });

      if (!data?.token || !data?.user) {
        present({
          message: data?.message || 'Có lỗi xảy ra',
          duration: 1500,
          position: 'middle',
          color: 'danger',
          cssClass: 'custom-toast',
          buttons: [{ text: '✕', role: 'cancel' }]
        });
        return;
      }

      saveAuthData(data.user, data.token);
      restoreAuthFromStorage(dispatch);
      const intendedPath = sessionStorage.getItem('intendedPath');
      if (intendedPath && intendedPath !== '/login') {
        history.replace(intendedPath);
        sessionStorage.removeItem('intendedPath');
      } else {
        history.replace('/home');
      }
    } catch (error) {
      present({
        message: 'Đăng nhập thất bại',
        duration: 1500,
        position: 'middle',
        color: 'danger',
        cssClass: 'custom-toast'
      });
    }
  };

  const handleBack = () => {
    const lastPage = sessionStorage.getItem('lastPage');
    if (lastPage && lastPage !== '/login') {
      history.replace(lastPage);
    } else {
      history.replace('/home');
    }
  };

  return (
    <IonPage className="login-page">
      <IonContent className="login-content" fullscreen>
        <div className="logo-container" style={{ position: 'relative' }}>
          <h1>LOGO12</h1>
          <IonImg
            src={discoveryTool}
            style={{
              height: 'auto',
              width: '86%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              right: 0
            }}
            alt="Discovery Tool"
          />
          <button
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 10,
              background: 'rgba(255,255,255,0.8)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}
            aria-label="Đóng"
            onClick={handleBack}
          >
            ×
          </button>
        </div>

        <IonList className="custom-list">
          <h2>ĐĂNG NHẬP HỆ THỐNG</h2>

          <IonItem className={`custom-input ${errors.username ? 'input-error' : ''}`} style={{ marginBottom: errors.username ? 0 : '1.5rem' }}>
            <Controller
              name="username"
              control={control}
              rules={{ required: 'Vui lòng nhập tài khoản' }}
              render={({ field }) => (
                <IonInput
                  placeholder="Nhập tài khoản"
                  value={field.value}
                  onIonChange={(e) => field.onChange(e.detail.value!)}
                  style={{ background: '#fff' }}
                />
              )}
            />
          </IonItem>
          {errors.username && (
            <IonText color="danger" className="ion-padding-start">
              {errors.username.message}
            </IonText>
          )}

          <IonItem className={`custom-input ${errors.password ? 'input-error' : ''}`} style={{ marginBottom: errors.password ? 0 : '1.5rem' }}>
            <Controller
              name="password"
              control={control}
              rules={{ required: 'Vui lòng nhập mật khẩu' }}
              render={({ field }) => (
                <IonInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mật khẩu"
                  value={field.value}
                  onIonChange={(e) => field.onChange(e.detail.value!)}
                  style={{ background: '#fff' }}
                />
              )}
            />
            <IonIcon
              slot="end"
              icon={showPassword ? eyeOffOutline : eyeOutline}
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: 'pointer', fontSize: 20 }}
            />
          </IonItem>
          {errors.password && (
            <IonText color="danger" className="ion-padding-start">
              {errors.password.message}
            </IonText>
          )}

          <IonButton expand="block" className="btn_button" onClick={handleSubmit(onSubmit)}>
            ĐĂNG NHẬP
            <IonImg src={arrowSvg} style={{ marginLeft: 10 }} />
          </IonButton>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
