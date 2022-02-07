import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import PlaylistSearchResult from './PlaylistSearchResult';
import SpotifyWebApi from 'spotify-web-api-node';
import Playlist from '../types/Playlist';
import processPlaylists from '../utils/processPlaylists';
import SpotifyPlayer, { SpotifyPlayerTrack } from 'react-spotify-web-playback';
import timeout from '../utils/timeout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPause,
  faStepForward,
  faStepBackward,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_CLIENT_ID,
});

export default function Dashboard({
  code,
  setLoginNeeded,
}: {
  code: string;
  setLoginNeeded: React.Dispatch<React.SetStateAction<boolean>>;
}) {
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
  const [guessResult, setGuessResult] = useState<boolean | null>(null);
  const [trackNumber, setTrackNumber] = useState(-1);
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
          setLoginNeeded(true);
        }
      });
  }, [accessToken, setLoginNeeded]);
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
    if (
      !accessToken ||
      !currentPlaylist ||
      !deviceId ||
      !play ||
      !track ||
      trackNumber < 2
    )
      return;
    spotifyApi.getMyCurrentPlaybackState().then((response) => {
      if (!response?.body?.shuffle_state) {
        spotifyApi.setShuffle(true);
      }
    });
  }, [currentPlaylist, deviceId, accessToken, play, track, trackNumber]);
  useEffect(() => {
    setTrackNumber((trackNumber) => trackNumber + 1);
  }, [track]);
  function handleSubmitGuess() {
    if (guess === 'correct') {
      return handleGuessed(true);
    }
    if (!guess) return;
    if (guessResult !== null) return;
    if (!track) return;
    const songName = track.name;
    const processed = songName.replace(/ *\([^)]*\) */g, '').toLowerCase();
    return handleGuessed(processed === guess.toLowerCase());
  }
  function handleGuessed(correct: boolean) {
    setGuessResult(correct);
    timeout(1989).then(() => {
      setGuessResult(null);
      // if (deviceId && correct) spotifyApi.skipToNext();
    });
  }
  function createDashboardClassName() {
    if (guessResult == null) return 'dashboard no-guess';
    return guessResult ? 'dashboard guessed-true' : 'dashboard guessed-false';
  }
  const controllers = {
    togglePlay: () => {
      setPlay((play) => !play);
    },
    next: () => {
      if (deviceId) spotifyApi.skipToNext();
    },
    previous: () => {
      if (deviceId) spotifyApi.skipToPrevious();
    },
  };
  return (
    <>
      <div className={createDashboardClassName()}>
        {guessResult === true && (
          <div className='guess-result correct'>Correct</div>
        )}
        {guessResult === false && (
          <div className='guess-result incorrect'>Incorrect</div>
        )}
        <div className='blanket'></div>
        <div className='dashboard-column'>
          <div className='tab-toggle'>
            <span
              onClick={() => setTab('search')}
              className={tab === 'search' ? 'toggled' : ''}>
              Search
            </span>
            {currentPlaylist && (
              <span
                onClick={() => setTab('guess')}
                className={tab === 'guess' ? 'toggled' : ''}>
                Guess
              </span>
            )}
          </div>
          <div className='tab-content'>
            {tab === 'search' && (
              <div className='search-tab'>
                <input
                  type='text'
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
                <button onClick={handleSubmitGuess}>Guess</button>
              </div>
            )}
          </div>
        </div>
        <div style={{ visibility: tab === 'guess' ? 'visible' : 'hidden' }}>
          {currentPlaylist && accessToken && (
            <>
              <button onClick={controllers.previous}>
                <FontAwesomeIcon icon={faStepBackward} />
              </button>
              <button onClick={controllers.togglePlay}>
                {play ? (
                  <FontAwesomeIcon icon={faPause} />
                ) : (
                  <FontAwesomeIcon icon={faPlay} />
                )}
              </button>
              <button onClick={controllers.next}>
                <FontAwesomeIcon icon={faStepForward} />
              </button>
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
