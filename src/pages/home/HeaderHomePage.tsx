import React, { useEffect, useState } from "react";
import { IonAvatar, IonHeader, IonIcon, IonImg, IonInput } from "@ionic/react";
import LanguageSelect from "../../components/language/LanguageSelect";
import { Storage } from "@capacitor/storage";
import avatar from "../../assets/images/avatar.png";
import { useSelector } from "../../utils/redux/hooks";
import { useTranslation } from "react-i18next";
import { micOutline, scanOutline, searchOutline } from "ionicons/icons";
import './HomePage.css';

const domain = import.meta.env.VITE_API_URL;
const bannerUrl = `${domain}/MedyxAPI/Avatar?userId=Banner`;
const HeaderHomePage = () => {
  const { user } = useSelector((state) => state.userInfoState);
  const [name, setName] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState<string>("");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchUserInfo = async () => {
      // Ưu tiên lấy từ auth_user
      const authUser = await Storage.get({ key: "auth_user" });
      if (authUser.value) {
        try {
          const parsed = JSON.parse(authUser.value);
          setUserInfo(parsed);
          setName(parsed?.fullName || parsed?.name || parsed?.ssoId || null);
          return;
        } catch {}
      }
      // Nếu không có auth_user thì lấy user cũ
      const { value } = await Storage.get({ key: "user" });
      try {
        const user = JSON.parse(value || "{}");
        setUserInfo(user);
        setName(user?.fullName || user?.name || user?.ssoId || null);
      } catch {
        setUserInfo(null);
        setName(null);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const now = new Date();
    const d = now.getDate();
    const m = now.toLocaleString("vi-VN", { month: "numeric" });
    const y = now.getFullYear();
    setCurrentDate(`${d}, tháng ${m}, ${y}`);
  }, []);

  return (
    <IonHeader className="ion-home-header">
      <div className="ion-header-container">
        <div className="ion-user-info">
          <IonAvatar className="ion-avatar">
            <IonImg
              src={
                userInfo?.avatar
                  ? userInfo.avatar.startsWith("http")
                    ? userInfo.avatar
                    : `${domain}/${userInfo.avatar}`
                  : user?.avatar || avatar
              }
              alt="avatar"
            />
          </IonAvatar>
          <div className="ion-header-text">
            <h5>{t("greeting", { name: name ? `, ${name}` : "" })}</h5>
            <p>{currentDate}</p>
          </div>
        </div>
        <div className="ion-lang-switch">
          <LanguageSelect />
        </div>
      </div>
      <div className="ion-search-header">
        <IonIcon icon={searchOutline} className="search-icon" />
        <IonInput
          placeholder={t("search_placeholder")}
          className="search-input"
          type="text"
        />
        <div className="search-actions">
          <IonIcon icon={micOutline} className="action-icon" />
          <IonIcon icon={scanOutline} className="action-icon" />
        </div>
      </div>
    </IonHeader>
  );
};

export default HeaderHomePage;
