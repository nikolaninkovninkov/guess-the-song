import { useState, useEffect } from 'react';
import SpotifyPlayer from 'react-spotify-web-playback';

export default function Player({
  accessToken,
  playlistUri,
}: {
  accessToken: string | undefined;
  playlistUri: string | undefined;
}) {
  const [play, setPlay] = useState(false);

  useEffect(() => setPlay(true), [playlistUri]);

  if (!accessToken) return null;
  return (
    <SpotifyPlayer
      token={accessToken}
      showSaveIcon
      callback={(state) => {
        if (!state.isPlaying) setPlay(false);
      }}
      play={play}
      uris={playlistUri ? [playlistUri] : []}
    />
  );
}
