import Playlist from '../types/Playlist';

export default function processPlaylists(
  playlists: SpotifyApi.PlaylistObjectSimplified[],
) {
  return playlists.map((playlist) => {
    const smallestAlbumImage = playlist.images.reduce((smallest, image) => {
      if (!image.height) return smallest;
      if (!smallest.height) return image;
      if (image.height < smallest.height) return image;
      return smallest;
    }, playlist.images[0]);

    return {
      title: playlist.name,
      uri: playlist.uri,
      albumUrl: smallestAlbumImage.url,
    } as Playlist;
  });
}
