import * as Tone from "tone";
import { synthConfiguration } from "./Sketch.constants";
import { maxTrail } from "../ByteChime/ByteChime.constants";

export const master = new Tone.Gain(1).toDestination();
export const filter = new Tone.Filter(1000, "lowpass", -24).connect(master);

// the reason for using an array of gains and reverbs is given on the handleReverbCrossfade comment below
export const reverbGains = [...Array(4)].map(() =>
  new Tone.Gain(0).connect(filter)
);
export const reverbs = [
  new Tone.Reverb({
    decay: 0.5,
    preDelay: 0.01,
    wet: 0.5,
  }).connect(reverbGains[0]),
  new Tone.Reverb({
    decay: 5,
    preDelay: 0.01,
    wet: 0.5,
  }).connect(reverbGains[1]),
  new Tone.Reverb({
    decay: 8,
    preDelay: 0.01,
    wet: 0.5,
  }).connect(reverbGains[2]),
  new Tone.Reverb({
    decay: 11,
    preDelay: 0.01,
    wet: 0.5,
  }).connect(reverbGains[3]),
];

// use array of nine synths so we can play many dot sounds at once (polyphony seems to be 2 or 3, going by ear)
// these synths are divided among the sound dots as they're generated
export const synths = [...Array(9)].map(() =>
  new Tone.MonoSynth(synthConfiguration).chain(...reverbs)
);

export const determineReverbNodeGain = ({
  begin,
  end,
  trail,
  manualAdjustment = 0,
}: {
  begin: number;
  end: number;
  trail: number;
  manualAdjustment?: number;
}) => {
  // determine absolute value function, in the general form a * | x - h | + k = y
  // a is slope, h is placement of the axis of symmetry, and k is y shift
  const k = 1; // we always want the high point of graph to be 1, as 1 is full volume on a gain node
  const h = (begin - end) / 2 + end; // place axis of symmetry at midpoint between begin and end
  // formula for slope of an abs function is y2 - k / x2 (end) - h
  const a = ((0 - k) / (end - h)) * -1; // note we always set a negative slope, vertex should be highest point
  const absoluteValueEquation = (x: number) => a * Math.abs(x - h) + k;
  return absoluteValueEquation(trail) < 0
    ? 0
    : absoluteValueEquation(trail) + manualAdjustment; // use a ternary operator to make sure abs fn bottoms out at 0
};

/**
 * I feel like I owe an apology and explanation to the coding gods of legibility and maintainability for this one
 * (as well as any future dev who wants to understand this)
 *
 * Here's the deal:
 *
 * We want reverb to increase as the "trail" value selected by the user decreases.
 * However, the reverb class used by ToneJS cannot update its decay time while continuously producing sound (wah).
 * MANY workarounds - all more legible, dumb, and sane than this one - were tried to try and use only one reverb to achieve this effect.
 * None of them worked.
 *
 * But where reasonable solutions fail, unhinged solutions persevere!
 * To achieve the effect of increasing reverb as trail decreases,
 * we create FOUR reverb instances, each with a gradually increasing decay time and hooked up to their own gain knob.
 * As trail value decreases, we gradually fade the reverb with the shortest decay time out, and the reverb with the next shortest one in,
 * such that, when trail is its max value, only the reverb with the shortest time is used, and when we reach trail's min value,
 * we're left only using the reverb with the longest decay time.
 *
 * We can achieve this fade-in-and-out process by using an absolute value function for the gain of each knob, where x
 * is the trail value and y is the resulting gain.
 * Imagine plotting several upside-down letter Vs in a row - ɅɅɅɅ. Now make them overlap, such that the end of one Ʌ's line lines up with the vertex of the adjacent Ʌ.
 * Each Ʌ is the plotted gain of one of the reverb instances as the trail value changes. Each peak is where that reverb's volume is max (1),
 * the end of each descending line is where it becomes silent (0).
 *
 * This is what the function below does - given the current trail value, maxTrail, and the array of reverbs we're working with,
 * it calculates the required absolute value function for each reverb instance to achieve this crossfade, gets the gain required for each
 * reverb instance, and then sets each gain to that value.
 */
export const handleReverbCrossfade = (trail: number) =>
  reverbGains.forEach((reverbGain, index) => {
    const begin =
      ((reverbGains.length - index) / (reverbGains.length - 1)) * maxTrail;
    const end =
      ((reverbGains.length - 2 - index) / (reverbGains.length - 1)) * maxTrail;
    const needsManualBoost = index === reverbGains.length - 1;
    const manualAdjustment = needsManualBoost ? 0.9 : 0; // the chained reverbs kill the dry fx volume, so boost it a bit when using the last reverb
    const newGainAmount = determineReverbNodeGain({
      begin,
      end,
      trail,
      manualAdjustment,
    });
    reverbGain.gain.rampTo(newGainAmount, 0.1);
  });
