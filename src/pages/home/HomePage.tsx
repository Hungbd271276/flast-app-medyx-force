import { useState, useEffect, useRef } from "react";
import {
  IonAvatar,
  IonContent,
  IonHeader,
  IonPage,
  IonImg,
  IonIcon,
  IonInput,
  IonFooter,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { Storage } from "@capacitor/storage";
import "./HomePage.css";
import avatar from "../../assets/images/avatar.png";
import { useSelector } from "../../utils/redux/hooks";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import LanguageSelect from "../../components/language/LanguageSelect";
import { useDispatch } from "../../utils/redux/hooks";
import { setDoctors, setDoctorParams } from "../../utils/redux/doctorSlice";
import axiosInstance from "../../utils/functions/axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { serviceIcons } from "../../assets/images/service/index";
import {
  calendarOutline,
  searchOutline,
  heartOutline,
  informationCircleOutline,
  peopleOutline,
  clipboardOutline,
  statsChartOutline,
  timeOutline,
  micOutline,
  scanOutline,
} from "ionicons/icons";
import DepartmentGrid from "../../components/departmentgrid/DepartmentGrid";
import { AVATAR, HO_TEN } from "../../share/constraint";

const domain = import.meta.env.VITE_API_URL;
const bannerUrl = `${domain}/MedyxAPI/Avatar?userId=Banner`;
const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const [departments, setDepartments] = useState<any[]>([]);
  const [name, setName] = useState<string | null>(null);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState<string>("");
  const { user } = useSelector((state) => state.userInfoState);
  const { t, i18n } = useTranslation();
  const departmentIcons = import.meta.glob(
    "../../assets/images/imgdepart/*.svg",
    { eager: true, import: "default" }
  );
  const history = useHistory();
  const swiperRef = useRef<any>(null);
  const features = [
    { label: "booking", icon: calendarOutline, path: "/booking" },
    { label: "doctor_search", icon: searchOutline, path: "/doctor" },
    { label: "health_profile", icon: heartOutline, path: "/health-profile" },
    {
      label: "info_search",
      icon: informationCircleOutline,
      path: "/info-search",
    },
    {
      label: "appointment_check",
      icon: searchOutline,
      path: "/appointment-check",
    },
    { label: "family", icon: peopleOutline, path: "/family" },
    { label: "chart", icon: statsChartOutline, path: "/chart" },
    { label: "reminder", icon: timeOutline, path: "/reminder" },
    { label: "services", icon: clipboardOutline, path: "/services" },
  ];
  const serviceList = [
    { icon: serviceIcons.doctor, title: "Khám và tư vấn" },
    { icon: serviceIcons.test, title: "Xét nghiệm và thăm dò chức năng" },
    { icon: serviceIcons.treatment, title: "Điều trị" },
    { icon: serviceIcons.blood, title: "Tiếp nhận máu và cung cấp máu" },
  ];
  const partnerList = [
    { image: serviceIcons.cooperate1 },
    { image: serviceIcons.cooperate2 },
    { image: serviceIcons.cooperate3 },
    { image: serviceIcons.cooperate4 },
    { image: serviceIcons.cooperate5 },
    { image: serviceIcons.cooperate6 },
  ];
  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };
  const [userInfo, setUserInfo] = useState<any>(null);
  const { doctors, params } = useSelector((state) => state.doctorState);

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

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axiosInstance.post(
          "/MedyxAPI/BenhNhan/GetPublicList",
          params
        );
        const doctors = data.data.map((item: any) => {
          const nameObj = item.patientData.find((f: any) => f.key === HO_TEN);
          const avatarObj = item.patientData.find(
            (f: any) => f.key === AVATAR
          );
          let avatar = avatarObj?.value || "";
          if (avatar && !/^https?:\/\//.test(avatar)) {
            avatar = `${domain}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
          }
          return {
            name: nameObj?.value || "Không rõ tên",
            avatar: avatar || "",
          };
        });
        dispatch(setDoctors(doctors));
      } catch (error) {
        dispatch(setDoctors([]));
      }
    };
    fetchDoctors();
  }, [dispatch, params]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await axiosInstance.post("/MedyxAPI/NewsList", {}, {});
        setNewsList(data.news || []);
      } catch (error) {
        setNewsList([]);
      }
    };
    fetchNews();
  }, []);
  const navigateToDetail = (item: any) => {
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  const { departmentBody } = useSelector((state) => state.department);
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data } = await axiosInstance.post(
          "/MedyxAPI/BenhNhan/GetPublicList",
          departmentBody,
          {}
        );
        setDepartments(data.data || []); // hoặc data.departments tuỳ API trả về
      } catch (error) {
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, []);
  
  const getDepartmentIcon = (iconKey: string): string => {
    const path = `../../assets/images/imgdepart/${iconKey}.svg`;
    return (departmentIcons[path] || departmentIcons["../../assets/images/imgdepart/default.svg"]) as string;
  }

  return (
    <IonPage
      className="ion-home-page"
      onTouchStart={() => {
        if (swiperRef.current && swiperRef.current.swiper) {
          swiperRef.current.swiper.autoplay.start();
        }
      }}
    >
      <IonContent
        className="ion-padding-function"
        style={{ paddingTop: "12px" }}
      >
        <div>
          <IonGrid className="grid-container-function" fixed={true}>
            <IonRow className="custom-ion-row">
              {features.map((item, index) => (
                <IonCol
                  size="3.8"
                  key={index}
                  onClick={() => history.push(item.path)}
                  className="grid-item-function"
                >
                  <IonIcon icon={item.icon} className="icon-function" />
                  <div className="label-function">{t(item.label)}</div>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
          <div className="ion-banner">
            <div className="banner-content">
              <IonImg
                src={bannerUrl}
                alt="Banner Home"
                className="banner-img"
              />
            </div>
          </div>
          <div className="ion-info-doctor">
            <h3 className="news-section-title">{t("doctor_team")}</h3>
            <div className="doctor-list">
              {doctors.map((doctor, idx) => (
                <div className="doctor-avatar" key={idx}>
                  <img
                    className="doctor-image"
                    src={doctor.avatar}
                    alt={doctor.name}
                  />
                  <div className="doctor-title">{t("doctor")}</div>
                  <div className="doctor-title">{doctor.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="news-section-title">{t("department")}</h3>
            <DepartmentGrid
              departments={departments || []}
              getDepartmentIcon={getDepartmentIcon}
            />
          </div>
          <div className="highlight-services">
            <h2 className="highlight-title">{t("service")}</h2>
            <div className="service-title-grid">
              {serviceList.map((item, idx) => (
                <div className="service-title-card" key={idx}>
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="service-title-icon"
                  />
                  <div className="service-title-text">{item.title}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="partner-section">
            <h2 className="news-section-title">Hợp tác chuyên môn</h2>
            <Swiper
              modules={[Autoplay, FreeMode]}
              spaceBetween={24}
              slidesPerView={3}
              freeMode={true}
              autoplay={{
                delay: 1,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              speed={3000} // tốc độ cuộn (ms)
              loop={true}
              style={{ padding: "16px 0" }}
            >
              {partnerList.map((item, idx) => (
                <SwiperSlide key={idx}>
                  <div className="partner-card">
                    <img src={item.image} className="partner-logo" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div>
            <h3 className="news-section-title">{t("news")}</h3>
            <div style={{ paddingLeft: 16, paddingRight: 16 }}>
              <Swiper
                modules={[Pagination, Autoplay]}
                pagination={{ clickable: true }}
                spaceBetween={12}
                slidesPerView={1.4}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
              >
                {newsList.map((item, index) => (
                  <SwiperSlide key={index}>
                    <div
                      className="news-slide"
                      onClick={() => navigateToDetail(item)}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="news-image"
                      />
                      <div className="news-overlay">
                        <h4>{item.title}</h4>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
          <div className="buffer-content"></div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
