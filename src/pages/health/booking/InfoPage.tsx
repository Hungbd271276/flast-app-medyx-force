import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from '../../../utils/redux/hooks';
import { fetchPublicFormInfo, setFormData, setDefaultValues, setAdvancedOption, fetchBHYTInfo } from '../../../utils/redux/booking';
import { IonPage, IonIcon, IonButton } from '@ionic/react';
import { chevronForwardOutline, qrCodeOutline } from 'ionicons/icons';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import DinamicForm from '../../../components/dinamicForm/DinamicForm';
import QrSvg from '../../../assets/svg/qrCC.svg';

import './InfoPage.css';

interface InfoPageProps {
  onNext: (nextTab?: 'time' | 'department' | 'doctor' | 'payment') => void;
}

const InfoPage: React.FC<InfoPageProps> = ({ onNext }) => {
  const dispatch = useDispatch();
  const publicMenu = useSelector(state => state.booking.publicMenu);
  const loading = useSelector(state => state.booking.loading);
  const error = useSelector(state => state.booking.error);
  const bhytLoading = useSelector(state => state.booking.bhytLoading);
const bhytError = useSelector(state => state.booking.bhytError);

  const storedFormData = useSelector(state => state.booking.formData);
  const storedDefaultValues = useSelector(state => state.booking.defaultValues);
  const advancedOption = useSelector(state => state.booking.advancedOption);
  const bhytInfo = useSelector(state => state.booking.bhytInfo);

  const bhytCalledRef = useRef<string>(''); // Thêm dòng này để fix lỗi
  const [cccdValue, setCccdValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [qrData, setQrData] = useState<string[]>([]);
  const [localDefaultValues, setLocalDefaultValues] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(true); // Thêm state này


  useEffect(() => {
    dispatch(fetchPublicFormInfo('2001'));
  }, [dispatch]);

  useEffect(() => {
    const page = document.querySelector('.ion-page');
    if (isScanning) {
      document.body.classList.add('scanner-active');
      page?.classList.add('scanner-active');
    } else {
      document.body.classList.remove('scanner-active');
      page?.classList.remove('scanner-active');
    }
    return () => {
      document.body.classList.remove('scanner-active');
      page?.classList.remove('scanner-active');
    };
  }, [isScanning]);
  function convertDDMMYYYYtoYYYYMMDD(dateStr: string) {
    if (!dateStr || dateStr.length !== 8) return '';
    const day = dateStr.slice(0, 2);
    const month = dateStr.slice(2, 4);
    const year = dateStr.slice(4, 8);
    return `${year}-${month}-${day}`;
  }

  function convertDateToYYYYMMDD(dateStr: string) {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  }

  useEffect(() => {
    if (bhytInfo?.data) {
      const bhytData = bhytInfo.data;
      const newDefaultValues = {
        MA_THE_BHYT: bhytData.mA_THE_BHYT || '',
        GT_THE_TU: bhytData.gT_THE_TU ? convertDateToYYYYMMDD(bhytData.gT_THE_TU) : '',
        GT_THE_DEN: bhytData.gT_THE_DEN ? convertDateToYYYYMMDD(bhytData.gT_THE_DEN) : '',
        MA_DKBD: bhytData.mA_DKBD || '',
        PHAN_TUYEN: bhytData.phaN_TUYEN ? bhytData.phaN_TUYEN.toString() : '',
        TIEU_NHAN_BHYT: bhytData.tieP_NHAN_BHYT ? bhytData.tieP_NHAN_BHYT.toString() : '',
        MA_KQ: bhytData.mA_KQ || '',
        TEN_KQ: bhytData.teN_KQ || '',
        MA_DOITUONG_KCB: bhytData.madt || '',
      };
      setLocalDefaultValues(prev => ({ ...prev, ...newDefaultValues }));
      dispatch(setDefaultValues(newDefaultValues));
      console.log(newDefaultValues);
    }
  }, [bhytInfo, dispatch]);

  useEffect(() => {
    if (qrData.length > 0) {
      const newDefaultValues = {
        HO_TEN: qrData[2] || '',
        NGAY_SINH: convertDDMMYYYYtoYYYYMMDD(qrData[3] || ''),
        GIOI_TINH: mapGenderToId(qrData[4]),
        DIA_CHI: qrData[5] || '',
        SoCCCD: qrData[0] || '',
        MA_DINH_DANH: qrData[1] || '',
        NGAY_CAP_CCCD: convertDDMMYYYYtoYYYYMMDD(qrData[6] || ''),
      };
      setLocalDefaultValues(newDefaultValues);
      dispatch(setDefaultValues(newDefaultValues));
      if (newDefaultValues.SoCCCD && newDefaultValues.HO_TEN && newDefaultValues.NGAY_SINH) {
        callBHYTAPI(newDefaultValues.SoCCCD, newDefaultValues.HO_TEN, newDefaultValues.NGAY_SINH);
      }
    }
  }, [qrData, dispatch]);


  const genderOptions = [
    { id: "1", value: "Nam" },
    { id: "2", value: "Nữ" }
  ];
  function mapGenderToId(gender: string) {
    if (gender === "Nam") return "1";
    if (gender === "Nữ") return "2";
    return "";
  }


  // Khôi phục dữ liệu từ store khi component mount - chỉ chạy một lần
  useEffect(() => {
    if (Object.keys(storedDefaultValues).length > 0 && Object.keys(localDefaultValues).length === 0) {
      setLocalDefaultValues(storedDefaultValues);
    }
  }, []); 
  

  const handleScanQR = async () => {
    setIsScanning(true);
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (!status.granted) {
        setIsScanning(false);
        alert('Bạn cần cấp quyền camera để quét QR');
        return;
      }
      await BarcodeScanner.hideBackground();
      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        setCccdValue(result.content || '');
        // Parse dữ liệu QR
        const arr = (result.content || '').split('|');
        setQrData(arr);
      }
    } catch (err) {
      alert('Có lỗi khi quét QR. Vui lòng thử lại!');
    } finally {
      await BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
      setIsScanning(false);
    }
  };

  const handleFormChange = useCallback((formData: Record<string, any>) => {
    dispatch(setFormData(formData));
  }, [dispatch]);

  const callBHYTAPI = useCallback(async (cccd: string, hoTen: string, ngaySinh: string) => {
    try {
      await dispatch(fetchBHYTInfo({
        SoCCCD: cccd,
        HO_TEN: hoTen,
        NGAY_SINH: ngaySinh
      })).unwrap();
    } catch (error) {
      console.error('Lỗi khi gọi API BHYT:', error);
    }
  }, [dispatch]);

  const bhytCalledFlag = useRef(false);

  const lastBHYTCallParams = useRef({ cccd: '', hoTen: '', ngaySinh: '' });

  useEffect(() => {
      const formData = { ...storedFormData, ...localDefaultValues };
      const soCCCD = formData.SoCCCD;
      const hoTen = formData.HO_TEN;
      const ngaySinh = formData.NGAY_SINH;
  
      if (soCCCD && hoTen && ngaySinh &&
          (soCCCD !== lastBHYTCallParams.current.cccd ||
           hoTen !== lastBHYTCallParams.current.hoTen ||
           ngaySinh !== lastBHYTCallParams.current.ngaySinh)
      ) {
          callBHYTAPI(soCCCD, hoTen, ngaySinh);
          lastBHYTCallParams.current = { cccd: soCCCD, hoTen: hoTen, ngaySinh: ngaySinh };
      }
  }, [storedFormData, localDefaultValues, callBHYTAPI]);

  const controlForms = useMemo(() => {
    return publicMenu?.data?.find(item => item.orderId === 1)?.controlForm || [];
  }, [publicMenu]);


  if (loading || !controlForms.length) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <IonPage>
      <div className="info-page">
        {/* {cccdValue || 'Chưa có dữ liệu CCCD'} */}
        <div className="input-with-qr">
          {/* <div className="cccd-display">
            {'Quét cccd'}
          </div> */}
          <button className="qr-btn" type="button" onClick={handleScanQR}>
            <label>Quét CCCD</label>
            <img src={QrSvg} alt="QR" style={{ width: 24, height: 24 }} />
          </button>
        </div>
        {bhytLoading && <div className="bhyt-loading-indicator">Đang kiểm tra BHYT...</div>}
        {bhytError && <div className="bhyt-error-message">Lỗi BHYT: {bhytError}</div>}
        <DinamicForm
          controls={controlForms.map((ctrl: any) =>
            ctrl.mapfield === "GIOI_TINH"
              ? { ...ctrl, radioOptions: genderOptions, required: true }
              : ctrl
          )}
          defaultValues={localDefaultValues}
          onFormChange={handleFormChange}
          initialValues={storedFormData}
          onValidityChange={setIsFormValid} // Truyền prop này
        />

        <div className="info-page-actions">
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
            <input
              type="checkbox"
              checked={advancedOption}
              onChange={e => dispatch(setAdvancedOption(e.target.checked))}
              style={{ width: 16, height: 16 }}
            />
            Tùy chọn nâng cao
          </label>
          <IonButton
            expand="block"
            color="primary"
            className='continnue_form'
            onClick={() => onNext(advancedOption ? 'department' : 'time')}
            disabled={!isFormValid} // Disable nếu form chưa hợp lệ
          >
            Tiếp tục<IonIcon icon={chevronForwardOutline} />
          </IonButton>
        </div>
      </div>
    </IonPage>
  );
};

export default InfoPage;