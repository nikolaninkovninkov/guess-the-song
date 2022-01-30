import axios, { AxiosRequestConfig } from 'axios';
async function getMyPlaylists(accessToken: string) {
  const axiosRequestConfig: AxiosRequestConfig = {
    url: 'https://api.spotify.com/v1/me/playlists',
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + accessToken,
    },
  };
  const response = await axios(axiosRequestConfig);
  return response.data;
}
async function setShuffle(
  accessToken: string,
  deviceId: string,
  state: boolean,
) {
  const axiosRequestConfig: AxiosRequestConfig = {
    url: 'https://api.spotify.com/v1/me/player/shuffle',
    method: 'PUT',
    params: {
      state,
      device_id: deviceId,
    },
    headers: {
      Authorization: 'Bearer ' + accessToken,
    },
  };
  const response = await axios(axiosRequestConfig).catch((err) =>
    console.log(err),
  );
  return response;
}
export { getMyPlaylists, setShuffle };
