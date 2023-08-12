import * as Tone from "tone";
import { synthConfiguration } from "./Sketch.constants";

export const master = new Tone.Gain(1).toDestination();
export const filter = new Tone.Filter(1000, "lowpass", -24).connect(master);

export const reverb = new Tone.Reverb({
  decay: 11,
  preDelay: 0.01,
  wet: 0.5,
}).connect(filter);

// use array of synths so we can play many dot sounds at once
// (had issues changing osc type with polysynth api, unfortunately)
// these synths are divided among the sound dots as they're generated
export const synths = [...Array(9)].map(() =>
  new Tone.MonoSynth(synthConfiguration).connect(reverb)
);
