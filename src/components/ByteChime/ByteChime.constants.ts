import { ISketchConfigType } from "./ByteChime";

export const harmonyOptions = {
  chromatic: "Chromatic",
  harmonicMinor: "Harmonic Minor",
  lydianDominant: "Lydian Dominant",
  majorPentatonic: "Major Pentatonic",
  majorScale: "Major Scale",
  minorPentatonic: "Minor Pentatonic",
  minorScale: "Minor Scale",
  octatonic: "Octatonic",
  stackedFifths: "Stacked Fifth",
  stackedFourths: "Stacked Fourths",
  wholeTone: "Whole Tone",
};

export type HarmonyOptions = keyof typeof harmonyOptions;

export const synthOscillatorTypeOptions = {
  fatsine: "Sine",
  fatsquare: "Square",
  fatsawtooth: "Sawtooth",
  fattriangle5: "Triangle",
  pulse: "Pulse",
  pwm: "PWM",
  fmsawtooth30: "FM Sawtooth",
};

export type SynthOscillatorTypeOptions =
  keyof typeof synthOscillatorTypeOptions;

export const maxTrail = 110;

export const convertLinearVolumeToDb = (sliderVolume: number) =>
  (Math.log(sliderVolume) * -43.5 + 100) * -1;

export const convertLogVolumeToLinear = (volumeDb: number) => {
  return Math.E ** ((-1 * volumeDb - 100) / -43.5);
};

export interface IFavoriteSetting extends Partial<ISketchConfigType> {
  name: string;
}

export const favoritesList: IFavoriteSetting[] = [
  {
    density: 3,
    filterFrequency: 750,
    harmony: "majorPentatonic",
    range: 0,
    speed: 1,
    trail: -55,
    waveform: "fatsquare",
    name: "Default",
  },
  {
    density: 2,
    filterFrequency: 7500,
    harmony: "chromatic",
    name: "Blaze",
    range: 3,
    speed: 50, // easter egg - 50 significantly exceeds the speed limit imposed by the UI
    trail: -105,
    waveform: "fmsawtooth30",
    volume: convertLinearVolumeToDb(6),
  },
  {
    density: 12,
    filterFrequency: 7728.52350000832,
    harmony: "wholeTone",
    range: 6,
    speed: 19,
    trail: -5,
    volume: -29.989450809116633,
    waveform: "fattriangle5",
    name: "Kaleidoscope",
  },
  {
    density: 10,
    filterFrequency: 10415.385763505483,
    harmony: "lydianDominant",
    range: 0,
    speed: 13,
    trail: -60,
    volume: -15.352908516093876,
    waveform: "fattriangle5",
    name: "K",
  },
  {
    density: 12,
    filterFrequency: 324.5797962223746,
    harmony: "majorScale",
    range: 6,
    speed: 0.1,
    trail: -5,
    volume: -17.352908516093876,
    waveform: "pwm",
    name: "Ocean",
  },
  {
    density: 8,
    filterFrequency: 2095.024754449904,
    harmony: "harmonicMinor",
    range: 3,
    speed: 4,
    trail: -36,
    volume: -22.058463088579614,
    waveform: "fmsawtooth30",
    name: "Rough in the Diamond",
  },
  {
    density: 9,
    filterFrequency: 500,
    harmony: "harmonicMinor",
    name: "Shorty",
    range: 2,
    speed: 3,
    trail: -55,
    waveform: "fattriangle5",
    volume: -17,
  },
  {
    density: 6,
    filterFrequency: 6657.437803392279,
    harmony: "minorPentatonic",
    range: 6,
    soundEnabled: true,
    speed: 15,
    trail: -13,
    volume: -29.989450809116633,
    waveform: "pwm",
    name: "Waimea Canyon",
  },
];
