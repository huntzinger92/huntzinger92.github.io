import * as Tone from "tone";
import { synthConfiguration } from "./Sketch.constants";

export const master = new Tone.Gain(1).toDestination();
export const filter = new Tone.Filter(1000, "lowpass", -24).connect(master);

export const reverb = new Tone.Reverb({
  decay: 11,
  preDelay: 0.01,
  wet: 0.5,
}).connect(filter);

/**
 * There is a tradeoff happening here that should be noted.
 *
 * Using a monosynth on each dot will cause notes to be caught off at high rates of border events.
 * This is most audible when density and speed are high and trail is low.
 *
 * ToneJS's PolySynth would be more appropriate for this use case, however we ran into two issues:
 *
 * 1. Performance was significantly higher, and exceeding max polyphony on occasion fails audibly.
 * App was almost unusable on mobile without unpleasant compromises.
 * 2. It's not clear from the docs how to update a polysynth's oscillator type. We could instantiate
 * a polysynth for every waveform option, but that feels hacky and prone to causing even more performance issues.
 *
 * For this reason, we use an array of MonoSynths - one for each dot. This has an inferior sound in some use cases
 * due to the abrupt cutoff issue mentioned above, however it is usable on mobile, has a simple api to change the waveform, and
 * sounds no worse in the majority of use cases. Hopefully, one day a better solution is worked out.
 */
export const synths = [...Array(12)].map(() =>
  new Tone.MonoSynth(synthConfiguration).connect(reverb)
);
