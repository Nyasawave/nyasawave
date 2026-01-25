export function downloadSong(song: any) {
  const link = document.createElement('a');
  link.href = song.streamUrl || song.src;
  link.download = `${song.title}.mp3`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
