import React, { useEffect } from "react";
import { IonPage, IonButton, IonIcon, IonLabel, IonFooter } from "@ionic/react";
import { chevronBackOutline, chevronForwardOutline } from "ionicons/icons";
import {
  fetchPayment,
  setSelectedPaymentMethod,
} from "../../../utils/redux/booking";
import { useDispatch, useSelector } from "../../../utils/redux/hooks";
import { useTranslation } from "react-i18next";
import {
  formatDateToDDMMYYYY,
  getStartHour,
} from "../../../utils/functions/dateUtils";
import "./PaymentPage.css";

const paymentIcons = import.meta.glob("../../../assets/svg/*.svg", {
  eager: true,
  import: "default",
});
const lowercasedPaymentIcons: Record<string, string> = Object.fromEntries(
  Object.entries(paymentIcons).map(([path, url]) => [
    path.toLowerCase(),
    url as string,
  ])
);

function getPaymentIcon(id: string): string {
  const path = `../../../assets/svg/${id.toLowerCase()}.svg`;
  const defaultIconPath = "../../../assets/svg/tm.svg";
  return (
    lowercasedPaymentIcons[path] || lowercasedPaymentIcons[defaultIconPath]
  );
}

interface PaymentPageProps {
  onBack: () => void;
  onNext: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onNext, onBack }) => {
  const dispatch = useDispatch();
  const publicMenu = useSelector((state) => state.booking.publicMenu);
  const formData = useSelector((state) => state.booking.formData);
  const defaultValues = useSelector((state) => state.booking.defaultValues);
  const selectedDepartmentId = useSelector((state) => state.booking.selectedDepartmentId);
  const selectedDoctorId = useSelector((state) => state.booking.selectedDoctorId);
  const selectedDate = useSelector((state: any) => state.booking.selectedDate);
  const selectedTimeSlot = useSelector((state: any) => state.booking.selectedTimeSlot);
  const selectedServiceId = useSelector((state) => state.booking.selectedServiceId);
  const selectedPaymentMethod = useSelector((state) => state.booking.selectedPaymentMethod);
  const methods = useSelector((state) => state.booking.paymentList) || [];
  const { t } = useTranslation();

  const controlForms = publicMenu?.data ? publicMenu.data.flatMap((item: any) => item.controlForm || [])
: [];
  const filteredFormData: Record<string, any> = {};

  function formatDateToDDMMYYYY(dateStr: string) {
    if (!dateStr) return "";
    // Nếu đã đúng định dạng dd/MM/yyyy thì giữ nguyên
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    // Nếu là yyyy-MM-dd hoặc yyyy-MM-ddTHH:mm:ss...
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const dateFields = ["NGAY_SINH", "GT_THE_TU", "GT_THE_DEN", "NGAY_CAP_CCCD"];

  controlForms.forEach((ctrl: any) => {
    const key = ctrl.mapfield;
    let value = formData[key];
    if (value === undefined || value === null) value = defaultValues[key];
    if (value === undefined || value === null) value = "";

    if (key && (ctrl.type === "date" || dateFields.includes(key))) {
      value = formatDateToDDMMYYYY(value);
    }

    if (key) {
      filteredFormData[key] = value;
    }
  });

  const handleConfirm = async () => {
    const khungThoiGian = `${formatDateToDDMMYYYY(selectedDate)} ${getStartHour(
      selectedTimeSlot
    )}`;
    const payload = {
      ...filteredFormData,
      MaKhoa: selectedDepartmentId,
      MaBS: selectedDoctorId,
      KhungThoiGian: khungThoiGian,
      MaDV: selectedServiceId,
      MaPTTT: selectedPaymentMethod,
    };
    try {
      onNext();
    } catch (error) {
      alert("Đăng ký khám chữa bệnh thất bại!");
    }
  };

  useEffect(() => {
    dispatch(fetchPayment());
  }, [dispatch]);

  const handleSelect = (id: string) => {
    dispatch(setSelectedPaymentMethod(id));
  };
  return (
    <div>
      <div className="payment-page">
        <h3 className="news-section-title">{t("payment_list")}</h3>

        <div className="payment-card-list">
          {methods.map((method: any) => (
            <div
              key={method.id}
              className={`payment-card${
                selectedPaymentMethod === method.id ? " selected" : ""
              }`}
              onClick={() => handleSelect(method.id)}
            >
              <img
                src={getPaymentIcon(method.id)}
                alt={method.name}
                className="payment-icon"
              />
              <span className="payment-label">{method.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="navigation-buttons">
        <IonButton fill="outline" onClick={onBack} className="back-btn">
          <IonIcon slot="start" icon={chevronBackOutline} />
          {t("back") || "Quay lại"}
        </IonButton>
        <IonButton className="confirm-btn" onClick={onNext} disabled={!selectedPaymentMethod}
        >
          {t("confirm") || "Tiếp tục"}
          <IonIcon slot="end" icon={chevronForwardOutline} />
        </IonButton>
      </div>
    </div>
  );
};

export default PaymentPage;
