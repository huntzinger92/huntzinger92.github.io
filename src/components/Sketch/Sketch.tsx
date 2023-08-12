import Sketch from "react-p5";
import p5Types from "p5";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SoundDot } from "./SoundDot";
import { getNotesAndColor } from "./Sketch.utils";
import { filter, handleReverbCrossfade, synths } from "./Sound";
import { ISketchConfigType } from "../ByteChime/ByteChime";

// create a "recommended settings" dropdown, named after stuff from your life
// cleanup styles a bit
// figure out better style/placement for input elements
// deploy on its own website
// build personal website
// write article

export interface ISketchComponentProps {
  /**
   * a throttled state setter for container box shadow, used by SoundDots
   */
  throttledSetBoxShadowOpacity: Dispatch<SetStateAction<number>>;
  sketchSize: number;
  sketchConfig: ISketchConfigType;
}

export const SketchComponent = ({
  throttledSetBoxShadowOpacity,
  sketchSize,
  sketchConfig: {
    density,
    harmony,
    filterFrequency,
    range,
    soundEnabled,
    speed,
    trail,
    volume,
    waveform,
  },
}: ISketchComponentProps) => {
  const [soundDots, setSoundDots] = useState<SoundDot[]>([]);

  useEffect(() => {
    handleReverbCrossfade(trail);
  }, [trail]);

  // update synth waveforms in response to user update
  useEffect(() => {
    synths.forEach((synth) => (synth.oscillator.type = waveform));
    // synths.forEach((synth) => (synth. = waveform));
  }, [waveform]);

  // update synth volume in response to user update
  useEffect(() => {
    synths.forEach((synth) => (synth.volume.value = volume));
  }, [volume]);

  // keep filter updated with user selected filter freq
  useEffect(() => {
    filter.frequency.rampTo(filterFrequency, 0.1);
  }, [filterFrequency]);

  // when speed updates, update each soundDots
  useEffect(() => {
    soundDots.forEach((soundDot) => soundDot.setSpeed(speed));
  }, [soundDots, speed]);

  // when sound enabled updates, update each soundDot
  useEffect(() => {
    soundDots.forEach((soundDot) => soundDot.setSoundEnabled(soundEnabled));
  }, [soundDots, soundEnabled]);

  // when harmony, range, or filter freq updates, update possible notes and color of each dot
  useEffect(() => {
    const { possibleNotes, colorPalette } = getNotesAndColor({
      newHarmony: harmony,
      newRange: range,
      filterFrequency,
    });
    soundDots.forEach((soundDot) =>
      soundDot.setNewNoteAndColorProperties({ possibleNotes, colorPalette })
    );
  }, [soundDots, harmony, range, filterFrequency]);

  // when density updates add or remove soundDots as needed
  useEffect(() => {
    if (soundDots.length > density) {
      // remove dots
      setSoundDots((prev) => prev.slice(0, density));
    }
    if (density > soundDots.length) {
      // create new dots
      const amountToAdd = density - soundDots.length;
      const newDots: SoundDot[] = [];
      for (let i = 0; i < amountToAdd; i++) {
        // share synths among dots
        const currentSynth = synths[i % synths.length];
        // random number between .3 and .7, provides more "depth" in the chime texture
        const noteVelocity = (Math.random() * 4 + 3) / 10;
        const { possibleNotes, colorPalette } = getNotesAndColor({
          newHarmony: harmony,
          newRange: range,
          filterFrequency,
        });
        newDots.push(
          new SoundDot({
            sketchBorderLength: sketchSize,
            speedFactor: speed,
            possibleNotes,
            colorPalette,
            soundEnabled,
            synth: currentSynth,
            noteVelocity,
            throttledSetBoxShadowOpacity,
          })
        );
      }
      // note we keep the previous dots when adding new ones
      setSoundDots((prev) => prev.concat(newDots));
    }
  }, [
    density,
    filterFrequency,
    harmony,
    soundEnabled,
    range,
    sketchSize,
    soundDots,
    speed,
    throttledSetBoxShadowOpacity,
  ]);

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    // set framerate down from 60 for performance
    // note that this affects the visual speed of the dots!
    p5.frameRate(37);
    p5.createCanvas(sketchSize, sketchSize).parent(canvasParentRef);
  };

  const draw = (p5: p5Types) => {
    p5.background(0, 0, 0, trail);
    soundDots.forEach((soundDot) => {
      soundDot.callEllipse(p5);
    });
  };

  return <Sketch setup={setup} draw={draw} style={{ display: "flex" }} />;
};
