import { useState, useEffect } from 'react';
import SpotifyPlayer from 'react-spotify-web-playback';
import { setShuffle } from '../api/spotify';

export default function Player({
  accessToken,
  playlistUri,
}: {
  accessToken: string | undefined;
  playlistUri: string | undefined;
}) {
  const [, setPlay] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  useEffect(() => {
    if (!accessToken || !deviceId || !playlistUri) return;
    setShuffle(accessToken, deviceId, true);
  }, [accessToken, deviceId, playlistUri]);
  if (!accessToken) return null;
  return (
    <>
      <button onClick={() => setPlay((play) => !play)}>Play</button>
      <SpotifyPlayer
        token={accessToken}
        showSaveIcon
        callback={(state) => {
          if (!state.isPlaying) setPlay(false);
          setDeviceId(state.currentDeviceId);
        }}
        play={true}
        uris={playlistUri ? [playlistUri] : []}
      />
    </>
  );
}
