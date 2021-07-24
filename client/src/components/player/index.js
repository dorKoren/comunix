import { useState, useEffect } from "react";
import SpotifyPlayer from "react-spotify-web-playback";
import "./style.scss";

const Player = ({ accessToken, trackUri }) => {
  const [play, setPlay] = useState(false);

  const handleCallback = state => !state.isPlaying && setPlay(false);

  useEffect(() => {
    setPlay(true);
  }, [trackUri]);

  if (!accessToken) return null;

  return (
    <SpotifyPlayer
      token={accessToken}
      showSaveIcon
      callback={handleCallback}
      play={play}
      uris={trackUri ? [trackUri] : []}
    />
  );
};

export default Player;
