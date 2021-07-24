import { useState, useEffect } from "react";
import { useAuth } from "hooks/useAuth";
import axios from "axios";
import SpotifyWebApi from "spotify-web-api-node";
import Track from "components/track";
import Player from "components/player";
import "./style.scss";

const spotifyWebApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_CLIENT_ID,
});

const Dashboard = ({ code }) => {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("");
  const [tracks, setTracks] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");
  const [albumType, setAlbumType] = useState("all");
  const [sortType, setSortType] = useState("");

  const chooseTrack = track => {
    setPlayingTrack(track);
    setSearch("");
    setLyrics("");
  };

  const handleSortChange = e => {
    const type = e.target.value;
    setSortType(type);

    if (tracks.length !== 0) {
      const sortingTracks = sortTracks(type);
      setTracks(sortingTracks);
    }
  };

  const sortTracks = type => {
    return [...tracks].sort((track1, track2) => {
      const name1 = track1[type].toLowerCase();
      const name2 = track2[type].toLowerCase();

      if (name1 < name2) return -1;
      if (name1 > name2) return 1;

      return 0;
    });
  };

  const handleSerachChange = e => setSearch(e.target.value);

  const handleAlbumChange = e => {
    const type = e.target.value;
    setAlbumType(type);
    if (tracks.length === 0) return;
    filterSearchResults(type);
  };

  const filterSearchResults = type => {
    const filterResults = tracks.map(track => {
      if (type === "all") {
        return track.visible === false ? { ...track, visible: true } : track;
      }

      return track.albumType !== type
        ? { ...track, visible: false }
        : { ...track, visible: true };
    });

    setTracks(filterResults);
  };

  useEffect(() => {
    if (!playingTrack) return;

    axios
      .get("http://localhost:3001/lyrics", {
        params: {
          track: playingTrack.title,
          artist: playingTrack.artist,
        },
      })
      .then(res => {
        setLyrics(res.data.lyrics);
      });
  }, [playingTrack]);

  useEffect(() => {
    if (!accessToken) return;
    spotifyWebApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!search) return setTracks([]);
    if (!accessToken) return;

    let cancel = false;

    const delay = setTimeout(() => {
      spotifyWebApi.searchTracks(search, { limit: 9 }).then(res => {
        if (cancel) return;

        const tracks = res.body.tracks.items.map(track => {
          const highestAlbumImage = track.album.images.reduce(
            (highest, image) => {
              if (image.height > highest.height) return image;
              return highest;
            },
            track.album.images[0]
          );

          const visible =
            albumType === "all" || albumType === track.album.album_type;

          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumType: track.album.album_type,
            duration: track.duration_ms,
            albumUrl: highestAlbumImage.url,
            visible: visible,
          };
        });

        let sortedTracks = tracks;

        if (sortType !== "") {
          sortedTracks = tracks.sort((track1, track2) => {
            const name1 = track1[sortType].toLowerCase();
            const name2 = track2[sortType].toLowerCase();

            if (name1 < name2) return -1;
            if (name1 > name2) return 1;

            return 0;
          });
        }

        setTracks(sortedTracks);
      });
    }, 1000);

    return () => {
      cancel = true;
      clearTimeout(delay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, accessToken /*, albumType, sortType*/]);

  return (
    <div className="dashboard">
      <form className="form">
        <div className="form__wrapper">
          <label htmlFor="search">search: </label>
          <input
            id="search"
            type="text"
            placeholder="Search Songs/Artists"
            value={search}
            onChange={handleSerachChange}
          ></input>
        </div>
        <div className="form__wrapper">
          <label htmlFor="sorting-type">sorting type: </label>
          <select
            id="sorting-type"
            value={sortType}
            onChange={handleSortChange}
          >
            <option value="" disabled>
              sort type
            </option>
            <option>title</option>
            <option>artist</option>
          </select>
        </div>

        <div className="form__wrapper">
          <label htmlFor="album-type">album type: </label>
          <select
            id="album-type"
            value={albumType}
            onChange={handleAlbumChange}
          >
            <option>all</option>
            <option>album</option>
            <option>single</option>
          </select>
        </div>
      </form>

      <div className="tracks">
        {tracks.map(track => {
          return track.visible ? (
            <Track track={track} key={track.uri} chooseTrack={chooseTrack} />
          ) : null;
        })}
      </div>

      {tracks.length === 0 && <div className="lyrics">{lyrics}</div>}

      <div className="player">
        <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
      </div>
    </div>
  );
};

export default Dashboard;
