import React from 'react';
import Playlist from '../types/Playlist';

export default function PlaylistSearchResult({
  playlist,
  chooseTrack,
}: {
  playlist: Playlist;
  chooseTrack: (playlist: Playlist) => void;
}) {
  function handlePlay() {
    chooseTrack(playlist);
  }

  return (
    <div
      className='d-flex m-2 align-items-center'
      style={{ cursor: 'pointer' }}
      onClick={handlePlay}>
      <img
        src={playlist.albumUrl}
        style={{ height: '64px', width: '64px' }}
        alt='Album'
      />
      <div className='ml-3'>
        <div>{playlist.title}</div>
      </div>
    </div>
  );
}
