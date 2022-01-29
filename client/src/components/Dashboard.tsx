import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import Player from './player/Player';
import PlaylistSearchResult from './PlaylistSearchResult';
import SpotifyWebApi from 'spotify-web-api-node';
import Playlist from './Playlist';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_CLIENT_ID,
});

export default function Dashboard({ code }: { code: string }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist>();

  function choosePlaylist(playlist: Playlist) {
    setCurrentPlaylist(playlist);
    setSearch('');
  }

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return;

    let cancel = false;
    spotifyApi.searchPlaylists(search).then((res) => {
      if (cancel) return;
      const playlists = res.body.playlists?.items;
      if (!playlists) return;
      setSearchResults(
        playlists.map((playlist) => {
          const smallestAlbumImage = playlist.images.reduce(
            (smallest, image) => {
              if (!image.height) return smallest;
              if (!smallest.height) return image;
              if (image.height < smallest.height) return image;
              return smallest;
            },
            playlist.images[0],
          );

          return {
            title: playlist.name,
            uri: playlist.uri,
            albumUrl: smallestAlbumImage.url,
          } as Playlist;
        }),
      );
    });
    return function () {
      cancel = true;
    };
  }, [search, accessToken]);

  return (
    <div className='dashboard'>
      <input
        type='search'
        placeholder='Search Songs/Artists'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className='flex-grow-1 my-2' style={{ overflowY: 'auto' }}>
        {searchResults.map((playlist) => (
          <PlaylistSearchResult
            playlist={playlist}
            key={playlist.uri}
            chooseTrack={choosePlaylist}
          />
        ))}
      </div>
      {currentPlaylist && (
        <Player accessToken={accessToken} playlistUri={currentPlaylist.uri} />
      )}
    </div>
  );
}
