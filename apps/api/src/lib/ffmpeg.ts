import Ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

Ffmpeg.setFfmpegPath(ffmpegPath!);
Ffmpeg.setFfprobePath(ffprobeStatic.path);

export default Ffmpeg;