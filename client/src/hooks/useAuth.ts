import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import useLocalStorage from './useLocalStorage';

export default function useAuth(code: string) {
  const [accessToken, setAccessToken] = useLocalStorage('access-token', '');
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();

  useEffect(() => {
    if (accessToken) return;
    axios
      .post('/login', {
        code,
      })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        setExpiresIn(res.data.expiresIn);
        window.history.pushState({}, '/', '/');
      })
      .catch((err: AxiosError<any>) => {
        console.log(err, err.message);
        // window.location.href = '/';
      });
  }, [code, setAccessToken, accessToken, setRefreshToken, setExpiresIn]);

  useEffect(() => {
    if (!refreshToken || !expiresIn) return;
    const interval = setInterval(() => {
      axios
        .post('/refresh', {
          refreshToken,
        })
        .then((res) => {
          setAccessToken(res.data.accessToken);
          setExpiresIn(res.data.expiresIn);
        })
        .catch(() => {
          window.location.href = '/';
        });
    }, (expiresIn - 60) * 1000);

    return () => clearInterval(interval);
  }, [
    refreshToken,
    expiresIn,
    setAccessToken,
    accessToken,
    setRefreshToken,
    setExpiresIn,
  ]);

  return accessToken;
}
