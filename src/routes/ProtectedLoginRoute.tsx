// src/routes/ProtectedLoginRoute.tsx
import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Storage } from '@capacitor/storage';

const ProtectedLoginRoute = ({ component: Component, ...rest }: any) => {
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    (async () => {
      const result = await Storage.get({ key: 'auth_token' });
      setHasToken(!!result.value);
      setTokenLoaded(true);
    })();
  }, []);

  if (!tokenLoaded) return null; // chờ token load xong

  return (
    <Route
      {...rest}
      render={(props) => {
        if (hasToken) {
          let intendedPath = sessionStorage.getItem('intendedPath');
          sessionStorage.removeItem('intendedPath');
          if (!intendedPath || intendedPath === '/login') {
            intendedPath = '/home'; // fallback
          }
          return <Redirect to={intendedPath} />;
        } else {
          const currentPath =
            props.location.pathname + props.location.search + props.location.hash;
          sessionStorage.setItem('intendedPath', currentPath);
          return <Component {...props} />;
        }
      }}
    />
  );
};

export default ProtectedLoginRoute;
