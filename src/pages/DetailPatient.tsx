import React, { useEffect, useState } from "react";
import {
  IonAlert,
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowForwardOutline } from "ionicons/icons";

import { useDispatch, useSelector } from "../utils/redux/hooks";
import axiosInstance from "../utils/functions/axios";
// import Toolbar from "../components/Toolbar";
// import { ListMapBnProps, OutPatient } from "../share/ListBenhNhan";
// import { getInitials } from "../utils/functions/dateHelper";
import { Storage } from "@capacitor/storage";
import { ListViewProps } from "../share/ListView";
// import { setListDetailForm } from "../utils/redux/reducer/ListBenhNhanSlice";
import { useHistory } from "react-router";
import "./DetailPatient.css";

const DetailPatientPage: React.FC = () => {

  const history = useHistory();
  const dispatch = useDispatch();
  // const { patientData, patientList, isTextValid } = useSelector((state) => state.patientListState);
  // const [listMapBn, setListMapBn] = useState<ListMapBnProps[]>([]);
  const [listData, setListData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  // const {tt2, tt3, tt4, tt5 } = patientData;

  // useEffect(() => {
  //   (async() => {
  //     const { data } = await axiosInstance.get(`/MedyxAPI/ControlList?formname=DSBN`);
  //     const newMap = [];
  //     for (const item of data) {
  //       const listPatient1 = tt2.filter(f => f.orders === item.orderId);
  //       const listPatient3 = tt3.filter(f => f.orders === item.orderId);
  //       const listPatient4 = tt4.filter(f => f.orders === item.orderId);
  //       const listPatient5 = tt5.filter(f => f.orders === item.orderId);
  //       const listmap = {
  //           listPatient: [...listPatient1, ...listPatient3, ...listPatient4, ...listPatient5],
  //           ...item
  //         };
  //         newMap.push(listmap)
  //       }
  //       setListMapBn(newMap.filter(f => f.listPatient?.length > 0))
  //     })()
  // },[patientData, patientList])

  // useEffect(() => {
  //   (async () => {
  //     // const userResult = localStorage.getItem('auth_token');
  //     const userResult = await Storage.get({ key: 'auth_user' });
  //     if (!userResult.value) {
  //       await Storage.clear();
  //       return window.location.href = '/login';
  //     } else {
  //       const { data } = await axiosInstance.get(`/MedyxAPI/MenuList`);
  //       await new Promise(resolve => setTimeout(resolve, 500));
  //       const newItem = data.filter((f: ListViewProps) => f.layout === 'ListBenhNhanNoi')
  //       setListData(newItem);
  //       if(OutPatient?.noitru === isTextValid) {
  //         const newItem = data.filter((f: ListViewProps) => f.layout === 'ListBenhNhanNoi')
  //         setListData(newItem);
  //       } else if(OutPatient?.ngoaitru === isTextValid) {
  //         const newItem = data.filter((f: ListViewProps) => f.layout === 'ListBenhNhanNgoai')
  //         setListData(newItem);
  //       }
  //     }
  //   })();
  // }, [dispatch, isTextValid]);

  // const onHandleGetPublicMenu = async (item: ListViewProps) => {
  //   const {data} = await axiosInstance.get(`/MedyxAPI/ControlList/GetPublicMenu?formname=${item?.id}`)    
  //   if(data) {
  //     dispatch(setListDetailForm(data));
  //     history.push("/DetailFormName");
  //   } else {
  //     setIsOpen(true)
  //   }
  // }   

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Thông tin Bệnh nhân</IonTitle>
        </IonToolbar>
      </IonHeader>

      {/* <Toolbar/> */}
    </IonPage>
  );
};

export default DetailPatientPage;
