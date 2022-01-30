import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import PlaylistSearchResult from './PlaylistSearchResult';
import SpotifyWebApi from 'spotify-web-api-node';
import Playlist from '../types/Playlist';
import processPlaylists from '../utils/processPlaylists';
import SpotifyPlayer, { SpotifyPlayerTrack } from 'react-spotify-web-playback';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_CLIENT_ID,
});

export default function Dashboard({ code }: { code: string }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist>();
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [tab, setTab] = useState<'search' | 'guess'>('search');
  const [guess, setGuess] = useState('');
  const [play, setPlay] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [track, setTrack] = useState<SpotifyPlayerTrack>();
  function choosePlaylist(playlist: Playlist) {
    setCurrentPlaylist(playlist);
    setSearch('');
    setTab('guess');
  }
  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);
  useEffect(() => {
    spotifyApi
      .getUserPlaylists()
      .then((response) => {
        const playlists = response.body.items;
        setMyPlaylists(processPlaylists(playlists));
      })
      .catch((err) => {
        if (err.body.error.message === 'The access token expired') {
          localStorage.setItem('access-token', '');
          localStorage.setItem('code', '');
        }
      });
  }, [accessToken]);
  useEffect(() => {
    if (!search) {
      return setSearchResults([]);
    }
    if (!accessToken) return;

    let cancel = false;
    spotifyApi.searchPlaylists(search).then((res) => {
      if (cancel) return;
      const playlists = res.body.playlists?.items;
      if (!playlists) return;
      setSearchResults(processPlaylists(playlists));
    });
    return function () {
      cancel = true;
    };
  }, [search, accessToken]);
  useEffect(() => {
    if (!accessToken || !currentPlaylist || !deviceId || !play) return;
    spotifyApi.getMyCurrentPlaybackState().then((response) => {
      if (!response.body.shuffle_state) {
        spotifyApi.setShuffle(true);
      }
    });
  }, [currentPlaylist, deviceId, accessToken, play]);
  function handleSubmitGuess() {
    if (!track) return;
    const songName = track.name;
    const processed = songName.replace(/ *\([^)]*\) */g, '').toLowerCase();
    return handleGuessed(processed === guess.toLowerCase());
  }
  function handleGuessed(correct: boolean) {}
  return (
    <div className='dashboard'>
      <div className='dashboard-column'>
        <div className='tab-toggle'>
          <button onClick={() => setTab('search')}>Search</button>
          {currentPlaylist && (
            <button onClick={() => setTab('guess')}>Guess</button>
          )}
        </div>
        <div className='tab-content'>
          {tab === 'search' && (
            <div className='search-tab'>
              <input
                type='search'
                placeholder='Search Songs/Artists'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className='playlists'>
                {(search ? searchResults : myPlaylists).map((playlist) => (
                  <PlaylistSearchResult
                    playlist={playlist}
                    key={playlist.uri}
                    chooseTrack={choosePlaylist}
                  />
                ))}
              </div>
            </div>
          )}
          {tab === 'guess' && (
            <div className='guess-tab'>
              <input
                type='text'
                placeholder="Guess the song's name"
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmitGuess();
                }}
              />
            </div>
          )}
        </div>
      </div>
      {currentPlaylist && accessToken && (
        <SpotifyPlayer
          token={accessToken}
          showSaveIcon
          callback={(state) => {
            setPlay(state.isPlaying);
            setDeviceId(state.currentDeviceId);
            setTrack(state.track);
          }}
          play={play}
          uris={[currentPlaylist.uri]}
        />
      )}
    </div>
  );
}
