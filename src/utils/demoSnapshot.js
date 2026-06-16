const DEMO_USER = {
  userName: "Demo Listener",
  profileImage: null,
  followers: 0,
}

const serialiseTrack = (track, previewUrlCache) => ({
  albumName: track.albumName,
  trackName: track.trackName,
  artistName: track.artistName,
  image: track.image,
  trackId: track.trackId,
  previewURL: track.previewURL || previewUrlCache.get(track.trackId) || null,
  uri: track.uri,
})

const serialiseDataSet = (dataSet, previewUrlCache) => ({
  topTracks: (dataSet?.topTracks || []).map((track) =>
    serialiseTrack(track, previewUrlCache)
  ),
  topArtists: dataSet?.topArtists || [],
  user: DEMO_USER,
})

export const createDemoSnapshot = ({
  shortTerm,
  mediumTerm,
  longTerm,
  previewUrlCache,
}) => ({
  user: DEMO_USER,
  shortTerm: serialiseDataSet(shortTerm, previewUrlCache),
  mediumTerm: serialiseDataSet(mediumTerm, previewUrlCache),
  longTerm: serialiseDataSet(longTerm, previewUrlCache),
})

export const createDemoDataModule = (snapshot) => {
  const json = JSON.stringify(snapshot, null, 2)

  return `export const demoData = ${json}
`
}

export const downloadDemoDataModule = (contents) => {
  const blob = new Blob([contents], { type: "text/javascript" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = "demoData.js"
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
