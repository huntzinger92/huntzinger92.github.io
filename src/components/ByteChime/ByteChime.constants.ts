import { ISketchConfigType } from "./ByteChime";
import { convertLinearVolumeToDb } from "./ByteChime.utils";

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
  amsine: "Sine",
  amsquare: "Square",
  amsawtooth: "Sawtooth",
  amtriangle: "Triangle",
  pulse: "Pulse",
  pwm: "PWM",
  fmsawtooth30: "FM Sawtooth",
};

export type SynthOscillatorTypeOptions =
  keyof typeof synthOscillatorTypeOptions;

export const maxTrail = 110;
export const maxDensityHighPerformance = 12;
export const maxDensityLowPerformance = 8;
export const maxSpeedHighPerformance = 25;
export const maxSpeedLowPerformance = 12;

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
    waveform: "amsquare",
    name: "Default",
  },
  {
    density: 2,
    filterFrequency: 7500,
    harmony: "chromatic",
    name: "Blaze's Two Brain Cells",
    range: 3,
    speed: 55, // easter egg - this amount significantly exceeds the speed limit imposed by the UI (just Blaze things)
    trail: -105,
    waveform: "fmsawtooth30",
    volume: convertLinearVolumeToDb(5),
  },
  {
    density: 10,
    filterFrequency: 7728.52350000832,
    harmony: "wholeTone",
    range: 6,
    speed: 25,
    trail: -5,
    volume: -29.989450809116633,
    waveform: "amtriangle",
    name: "Kaleidoscope",
  },
  {
    density: 8,
    filterFrequency: 500,
    harmony: "lydianDominant",
    range: 0,
    speed: 12,
    trail: -60,
    volume: -15.352908516093876,
    waveform: "amsine",
    name: "Krista",
  },
  {
    density: 12,
    filterFrequency: 424,
    harmony: "majorScale",
    range: 6,
    speed: 0.1,
    trail: -5,
    volume: -17.352908516093876,
    waveform: "pwm",
    name: "Ocean",
  },
  {
    density: 7,
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
    density: 7,
    filterFrequency: 500,
    harmony: "harmonicMinor",
    name: "Shorty",
    range: 2,
    speed: 3,
    trail: -55,
    waveform: "amtriangle",
    volume: -17,
  },
  {
    density: 8,
    filterFrequency: 6657.437803392279,
    harmony: "minorPentatonic",
    range: 6,
    soundEnabled: true,
    speed: 20,
    trail: -13,
    volume: -29.989450809116633,
    waveform: "pwm",
    name: "Waimea Canyon",
  },
];
