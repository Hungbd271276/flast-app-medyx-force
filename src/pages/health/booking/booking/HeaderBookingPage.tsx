import React from "react";
import { IonBackButton, IonButtons, IonHeader, IonToolbar } from "@ionic/react";
import './BookingPage.css';
import { useLocation } from "react-router";

const HeaderBookingPage = () => {
    return (
        <IonHeader className="ion-home-page_booking">
        <IonToolbar className="tool-bar-header custom-toolbar">
            <div className="toolbar-flex">
            <div className="toolbar-side">
                <IonButtons slot="start">
                <IonBackButton defaultHref="/" />
                </IonButtons>
            </div>
            <div className="toolbar-center">Đặt lịch khám bệnh</div>
            <div className="toolbar-side" />
            </div>
        </IonToolbar>
        </IonHeader>
    );
};

export default HeaderBookingPage;
