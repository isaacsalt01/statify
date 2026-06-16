import React from "react"
import axios from "axios";
import * as cheerio from "cheerio";
import SpotifyWebApi from "spotify-web-api-node";
import { useStore } from '../store/useStore';

const Album = ({ trackInfo, onClickHandler, accessToken }) => {
  const { getCachedPreviewUrl, cachePreviewUrl, isDemoMode } = useStore();
  const { getEmbedTrackID, setEmbedTrackID } = useStore()

  
  async function getSpotifyLinks(url) {
    /* 
      NOT MY CODE
      FROM REPO - https://github.com/AliAkhtari78/SpotifyScraper  
    */
    const scraper = import.meta.env.VITE_SCRAPER_URL || "http://127.0.0.1:9000/.netlify/functions/api/scrape"
    try {
      const response = await axios.get(scraper, {
        headers: {
          url
        }
      })
      const html = response.data;
      const $ = cheerio.load(html);
      const scdnLinks = new Set();
  
      $('*').each((i, element) => {
        const attrs = element.attribs;
        Object.values(attrs).forEach(value => {
          if (value && value.includes('p.scdn.co')) {
            scdnLinks.add(value);
          }
        });
      });
  
      return Array.from(scdnLinks);
    } catch (error) {
      throw new Error(`Failed to fetch preview URLs: ${error.message}`);
    }
  }


  async function searchAndGetLinks(songName, limit = 5) {
    /* 
      NOT MY CODE
      FROM REPO - https://github.com/AliAkhtari78/SpotifyScraper  
    */
    try {
      if (!songName) {
        throw new Error('Song name is required');
      }
  
      const spotifyApi = new SpotifyWebApi()
      spotifyApi.setAccessToken(accessToken);
      
      const searchResults = await spotifyApi.searchTracks(songName);
      
      if (searchResults.body.tracks.items.length === 0) {
        return {
          success: false,
          error: 'No songs found',
          results: []
        };
      }
  
      const tracks = searchResults.body.tracks.items.slice(0, limit);
      const results = await Promise.all(tracks.map(async (track) => {
        const spotifyUrl = track.external_urls.spotify;
        const previewUrls = await getSpotifyLinks(spotifyUrl);
        return {
          name: `${track.name} - ${track.artists.map(artist => artist.name).join(', ')}`,
          spotifyUrl: spotifyUrl,
          previewUrls: previewUrls
        };
      }));
  
      return {
        success: true,
        results: results
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }

  const handlePreviewClick = async () => {
    try {
      if (isDemoMode) {
        if (trackInfo.previewURL) {
          onClickHandler(trackInfo.previewURL);
        } else {
          console.log(`No preview URL available for demo track: ${trackInfo.trackName}`);
        }
        return;
      }

      // Check if we have a cached URL first
      const cachedUrl = getCachedPreviewUrl(trackInfo.trackId);
      
      if (cachedUrl) {
        // Use cached URL directly
        console.log(`Using cached preview URL for: ${trackInfo.trackName}`);
        onClickHandler(cachedUrl);
        return;
      }
      
      // No cached URL, fetch it
      console.log(`Fetching preview URL for: ${trackInfo.trackName}`);
      const previewResult = await searchAndGetLinks(trackInfo.trackName, 1);
      
      if (previewResult.success && previewResult.results.length > 0) {
        const song = previewResult.results[0];
        const previewUrl = song.previewUrls[0];
        
        // Cache the URL for future use
        cachePreviewUrl(trackInfo.trackId, previewUrl);
        
        console.log(`Found and cached: ${song.name}`);
        console.log(`Preview URL: ${previewUrl}`);
        onClickHandler(previewUrl);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  function handlePreviewClickEmbed() {
    console.log('handlePreviewClickEmbed called for trackId:', trackInfo.trackId)
    const embedId = trackInfo.trackId
    console.log('setting embedTrackID to:', embedId)
    setEmbedTrackID(embedId)
    console.log('after set, getEmbedTrackID():', getEmbedTrackID())
  };

  return (
    <div style={{ paddingBottom: "10px" }}>
      <div className="card">
      {trackInfo.image && (
        <div className="img-preview-button">
          <img className="card-img-top" src={trackInfo.image} alt={`${trackInfo.trackName} album cover`} />
          <div className="preview-button">
            {(!isDemoMode || trackInfo.previewURL) && (
              <span
                className="btn-success albumButton"
                style={{ padding: "10px" }}
                onClick={handlePreviewClick}
              >
                Preview
              </span>
            )}
            <span
              className="btn-success albumButton"
              style={{ padding: "10px" }}
              onClick={handlePreviewClickEmbed}
            >
              Play in embed
            </span>
          </div>
        </div>)}
        <div className="card-body">
          <h5 className="card-title">{trackInfo.trackName}</h5>
          <h6 className="card-subtitle">
            {trackInfo.artistName} - {trackInfo.albumName}
          </h6>
        </div>
      </div>
    </div>
  )
}

export default Album
