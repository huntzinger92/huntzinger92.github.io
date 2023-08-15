import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SoundDot } from "./SoundDot";
import { ISketchConfigType } from "../ByteChime/ByteChime";
import { getNotesAndColor } from "./Sound.utils";
import { HarmonyOptions } from "../ByteChime/ByteChime.constants";
import { monoSynths, polySynth } from "./SoundInstances";

export interface IUseSoundProps {
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
  throttledSetBoxShadowOpacity: Dispatch<SetStateAction<number>>;
  sketchSize: number;
  sketchConfig: ISketchConfigType;
}

/**
 * a hook for initializing sound and sound dots
 *
 * holds all of the complex logic around updating sound dots following config updates
 */
export const useSoundDots = ({
  frameRate,
  lowPerformanceMode,
  sketchConfig,
  sketchSize,
  throttledSetBoxShadowOpacity,
}: IUseSoundProps) => {
  const [soundDots, setSoundDots] = useState<SoundDot[]>([]);

  const formattedSketchConfig = useMemo(
    () => ({
      ...sketchConfig,
      density: Math.ceil(sketchConfig.density),
      range: Math.ceil(sketchConfig.range),
      speed: Math.ceil(sketchConfig.speed),
    }),
    [sketchConfig]
  );

  // dot focused config updates
  const createNewDots = useCallback(
    ({
      amountToAdd,
      harmony,
      filterFrequency,
      frameRate,
      lowPerformanceMode,
      range,
      sketchSize,
      soundEnabled,
      speed,
      throttledSetBoxShadowOpacity,
    }: {
      amountToAdd: number;
      harmony: HarmonyOptions;
      filterFrequency: number;
      frameRate: 30 | 60;
      lowPerformanceMode: boolean;
      range: number;
      sketchSize: number;
      soundEnabled: boolean;
      speed: number;
      throttledSetBoxShadowOpacity: Dispatch<SetStateAction<number>>;
    }) => {
      const newDots: SoundDot[] = [];
      for (let i = 0; i < amountToAdd; i++) {
        // share monoSynths among dots in low performance mode
        const currentSynth = lowPerformanceMode
          ? monoSynths[i % monoSynths.length]
          : polySynth;
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
    },
    []
  );

  const updateDots = useCallback(
    ({
      harmony,
      filterFrequency,
      frameRate,
      lowPerformanceMode,
      range,
      soundDots,
      soundEnabled,
      speed,
      throttledSetBoxShadowOpacity,
    }: {
      harmony: HarmonyOptions;
      filterFrequency: number;
      frameRate: 30 | 60;
      lowPerformanceMode: boolean;
      range: number;
      soundDots: SoundDot[];
      soundEnabled: boolean;
      speed: number;
      throttledSetBoxShadowOpacity: Dispatch<SetStateAction<number>>;
    }) => {
      // when harmony, range, or filter freq updates, update possible notes and color of each dot
      const { possibleNotes, colorPalette } = getNotesAndColor({
        newHarmony: harmony,
        newRange: range,
        filterFrequency,
      });
      soundDots.forEach((soundDot, index) => {
        const currentSynth = lowPerformanceMode
          ? monoSynths[index % monoSynths.length]
          : polySynth;
        soundDot.setSoundEnabled(soundEnabled);
        soundDot.setSynth(currentSynth);
        soundDot.setNewNoteAndColorProperties({ possibleNotes, colorPalette });
        soundDot.setSpeedAndFrameRate(speed, frameRate);
        soundDot.setThrottledSetBoxShadowOpacity(
          lowPerformanceMode ? undefined : throttledSetBoxShadowOpacity
        );
      });
    },
    []
  );

  useEffect(() => {
    const { density, harmony, filterFrequency, range, soundEnabled, speed } =
      formattedSketchConfig;
    if (soundDots.length > density) {
      // remove dots
      setSoundDots((prev) => prev.slice(0, density));
    }
    updateDots({
      soundDots,
      harmony,
      filterFrequency,
      frameRate,
      lowPerformanceMode,
      range,
      soundEnabled,
      speed,
      throttledSetBoxShadowOpacity,
    });
    if (density > soundDots.length) {
      const amountToAdd = density - soundDots.length;
      createNewDots({
        amountToAdd,
        filterFrequency,
        frameRate,
        harmony,
        lowPerformanceMode,
        range,
        sketchSize,
        soundEnabled,
        speed,
        throttledSetBoxShadowOpacity,
      });
    }
  }, [
    createNewDots,
    frameRate,
    lowPerformanceMode,
    formattedSketchConfig,
    sketchSize,
    soundDots,
    throttledSetBoxShadowOpacity,
    updateDots,
  ]);

  return { soundDots };
};