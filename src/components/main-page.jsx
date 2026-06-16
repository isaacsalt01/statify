import React, { useCallback } from "react";
import { useStore } from "../store/useStore";
import UserInfo from "./user-info.jsx";
import GenreChart from "./pie-chart.jsx";
import Album from "./albums.jsx";
import AudioPlayer from "./audio-player.jsx";
import SpotifyEmbed from "./spotify-embed.jsx";
import "../App.css";
import "./albums-style.css";

const MainPage = () => {
  const {
    currentDataSet,
    setCurrentDataSet,
    playStatus,
    setPlayStatus,
    previewURL,
    setPreviewURL,
    getCurrentDataSet,
    accessToken,
    embedTrackID,
  } = useStore();

  const dataSet = getCurrentDataSet();

  const renderAlbums = useCallback(
    (dataSet) => {
      if (!dataSet?.topTracks) return null;

      const albumsToRender = dataSet.topTracks;
      return (
        <div className="container">
          <div className="row">
            {albumsToRender.slice(0, 20).map((track, index) => (
              <div
                key={track.trackId}
                className="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-6"
              >
                <Album
                  trackInfo={track}
                  onClickHandler={onClickHandler_Album}
                  accessToken={accessToken}
                />
              </div>
            ))}
          </div>
        </div>
      );
    },
    [accessToken]
  );

  const renderSpotifyPlayer = useCallback(() => {
    console.log("renderSpotifyPlayer called with embedTrackID:", embedTrackID);
    return <SpotifyEmbed trackID={embedTrackID} />;
  }, [embedTrackID]);

  const renderInfoAndGraphs = useCallback(
    (dataSet) => {
      if (!dataSet) return null;

      return (
        <div
          className="container"
          style={{ paddingBottom: "0px", paddingTop: "10px" }}
        >
          <div className="grid">
            <div className="row">
              <div className="col-6" style={{ paddingTop: "30px" }}>
                {renderSpotifyPlayer()}
              </div>
              <div className="col-2" style={{ paddingTop: "20px" }}>
                <GenreChart genreData={dataSet.topArtists} />
              </div>
            </div>
          </div>
        </div>
      );
    },
    [dataSet, embedTrackID]
  );

  const onClickTimeFrame = useCallback(
    (timeFrame) => {
      setCurrentDataSet(timeFrame);
    },
    [setCurrentDataSet]
  );

  const onClickHandler_Album = useCallback(
    (soundURL) => {
      // Same song - toggle play/pause
      if (playStatus === "PLAYING") {
        setPlayStatus("STOPPED");
      } else {
        setPlayStatus("PLAYING");
      }

      if (soundURL !== previewURL) {
        // New song - set new URL and start playing
        console.log("New song");
        console.log(soundURL);
        console.log(previewURL);
        setPreviewURL(soundURL);
        setPlayStatus("PLAYING");
      }
      console.log(playStatus);
    },
    [previewURL, playStatus, setPlayStatus, setPreviewURL]
  );

  const openSongInSpotify = useCallback(
    (trackURI) => {
      console.log(accessToken);
      fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: { Authorization: "Bearer " + accessToken },
        body: JSON.stringify({ uris: ["spotify:track:" + trackURI] }),
      });
    },
    [accessToken]
  );

  const handleAudioEnded = useCallback(() => {
    setPlayStatus("STOPPED");
  }, [setPlayStatus]);

  const handleAudioError = useCallback(
    (error) => {
      console.error("Audio error:", error);
      setPlayStatus("STOPPED");
    },
    [setPlayStatus]
  );

  if (!dataSet) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border" role="status"></div>
        <p className="mt-3">Loading your music data...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <AudioPlayer
        url={previewURL}
        isPlaying={playStatus === "PLAYING"}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
      />
      <h3 style={{ paddingTop: "20px" }}>Main Stats</h3>

      <div className="container" style={{ paddingTop: "5px" }}>
        <div>
          <button
            className="btn btn-outline-info"
            onClick={() => onClickTimeFrame("shortTerm")}
            style={{ margin: "10px" }}
          >
            Short Term
          </button>
          <button
            className="btn btn-outline-info"
            onClick={() => onClickTimeFrame("mediumTerm")}
            style={{ margin: "10px" }}
          >
            Medium Term
          </button>
          <button
            className="btn btn-outline-info"
            onClick={() => onClickTimeFrame("longTerm")}
            style={{ margin: "10px" }}
          >
            Long Term
          </button>
        </div>
      </div>
      {renderInfoAndGraphs(dataSet)}
      {renderAlbums(dataSet)}
    </div>
  );
};

export default MainPage;
