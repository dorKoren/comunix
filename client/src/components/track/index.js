import "./style.scss";

const Track = ({ track, chooseTrack }) => {
  const handlePlay = () => {
    chooseTrack(track);
  };
  const duration = `${Math.floor(track.duration / 1000 / 60)} min`;

  return (
    <div className="track" onClick={handlePlay}>
      <div className="track__img-wrapper">
        <img className="track__img" src={track.albumUrl} alt="track img" />
      </div>
      <div className="track__content">
        <div className="track__title">{track.title}</div>
        <div className="track__artist">{track.artist}</div>
        <div className="track__duration">{duration}</div>
      </div>
    </div>
  );
};

export default Track;
