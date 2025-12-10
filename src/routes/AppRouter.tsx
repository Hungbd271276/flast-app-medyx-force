// src/routes/AppRouter.tsx
import { IonTabs, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";

import LoginPage from "../pages/Login";
import ProtectedLoginRoute from "./ProtectedLoginRoute";
import AppLifecycleHandler from "./AppLifecycleHandler";
import MainTabs from "../pages/tabs/MainTabs";
import BookingForm from "../components/bookingform/BookingForm";
import GlobalHeader from "./GlobalHeader";

const AppRouter = () => {
  
  return (
    <IonReactRouter>
      <AppLifecycleHandler />
      <GlobalHeader />
      <IonRouterOutlet>
        <Route path="/" component={MainTabs} />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export default AppRouter;
