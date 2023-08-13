import Sketch from "react-p5";
import p5Types from "p5";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SoundDot } from "./SoundDot";
import { getNotesAndColor } from "./Sketch.utils";
import { filter, reverb, synths } from "./Sound";
import { ISketchConfigType } from "../ByteChime/ByteChime";

export interface ISketchComponentProps {
  /**
   * we use a different frame rate depending on performance mode
   */
  frameRate: 30 | 60;
  /**
   * given cpu intensive animations and sound, provide flag to tweak settings for slower devices
   * defaults to true on small screen widths
   */
  lowPerformanceMode: boolean;
  /**
   * a throttled state setter for container box shadow, used by SoundDots
   */
  throttledSetBoxShadowOpacity: Dispatch<SetStateAction<number>> | undefined;
  sketchSize: number;
  sketchConfig: ISketchConfigType;
}

export const SketchComponent = ({
  frameRate,
  lowPerformanceMode,
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

  // as trail value decreases, increase reverb wet value
  useEffect(() => {
    const newReverbWet = -0.006923 * trail + 0.95; // convert range of 1 - 131 into normal range
    reverb.wet.rampTo(newReverbWet, 0.5);
  }, [trail]);

  // update synth waveforms in response to user update
  useEffect(() => {
    synths.forEach((synth) => (synth.oscillator.type = waveform));
  }, [waveform]);

  // update synth volume in response to user update
  useEffect(() => {
    synths.forEach((synth) => (synth.volume.value = volume));
  }, [volume]);

  // keep filter updated with user selected filter freq
  useEffect(() => {
    filter.frequency.rampTo(filterFrequency, 0.75);
  }, [filterFrequency]);

  // big sound dot updating useEffect
  // consider creating util functions to make this more legible
  useEffect(() => {
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
            throttledSetBoxShadowOpacity: lowPerformanceMode
              ? undefined
              : throttledSetBoxShadowOpacity,
            frameRate,
          })
        );
      }
      // note we keep the previous dots when adding new ones
      setSoundDots((prev) => prev.concat(newDots));
    } else if (soundDots.length > density) {
      // remove dots
      setSoundDots((prev) => prev.slice(0, density));
    }
    // update already present dots
    // when harmony, range, or filter freq updates, update possible notes and color of each dot
    const { possibleNotes, colorPalette } = getNotesAndColor({
      newHarmony: harmony,
      newRange: range,
      filterFrequency,
    });
    soundDots.forEach((soundDot) => {
      soundDot.setSoundEnabled(soundEnabled);
      soundDot.setNewNoteAndColorProperties({ possibleNotes, colorPalette });
      soundDot.setSpeedAndFrameRate(speed, frameRate);
      soundDot.setThrottledSetBoxShadowOpacity(
        lowPerformanceMode ? undefined : throttledSetBoxShadowOpacity
      );
    });
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
    frameRate,
    lowPerformanceMode,
  ]);

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(sketchSize, sketchSize).parent(canvasParentRef);
  };

  const draw = (p5: p5Types) => {
    // set framerate down from 60 for performance
    // note that this affects the visual speed of the dots!
    p5.frameRate(frameRate);
    p5.background(0, 0, 0, trail);
    soundDots.forEach((soundDot) => {
      soundDot.callEllipse(p5);
    });
  };

  return <Sketch setup={setup} draw={draw} style={{ display: "flex" }} />;
};
