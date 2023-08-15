import { useCallback, useEffect, useMemo, useState } from "react";
import { SketchComponent } from "../Sketch/Sketch";
import {
  HarmonyOptions,
  SynthOscillatorTypeOptions,
} from "./ByteChime.constants";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { throttle } from "lodash";
import { harmonyColorLookup } from "../Sound/Sound.constants";
import { ControlPanel } from "./ControlPanel";
import { useSoundDots } from "../Sound/useSoundDots";
import { master } from "../Sound/SoundInstances";

export interface ISketchConfigType {
  /**
   * the amount of sound dots to render
   */
  density: number;
  /**
   * the frequency of the filter, in logarithmic scale
   */
  filterFrequency: number;
  /**
   * the chosen harmony to pull notes from (major, minor, chromatic, etc.)
   */
  harmony: HarmonyOptions;
  /**
   * how wide of a range the notes will be chosen from
   */
  range: number;
  /**
   * whether or not the sound is enabled (audiocontext api requires this to be set to true after user action)
   */
  soundEnabled: boolean;
  /**
   * how fast the dots move (note: individual dot speed is randomized to be around this)
   */
  speed: number;
  /**
   * how much trail each dot has (in practice, how transparent each canvas render is)
   */
  trail: number;
  /**
   * how loud the dots are, in normal range
   */
  volume: number;
  /**
   * the chosen waveform of the synth to be played (sine, square, etc.)
   */
  waveform: SynthOscillatorTypeOptions;
}

export const ByteChime = () => {
  const theme = useTheme();
  const miniMode = useMediaQuery(theme.breakpoints.down("md"));
  const sketchSize = miniMode ? 250 : 500;

  const [lowPerformanceMode, setLowPerformanceMode] = useState(miniMode);
  /**
   * on sound dot border event, we set opacity to 1
   */
  const [boxShadowOpacity, setBoxShadowOpacity] = useState(1);
  // useCallback doesn't seem to know how to check for throttle dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledSetBoxShadowOpacity = useCallback(
    // box shadow color is updated on border events
    // and invoked repeatedly to dim after border events when not in lowPerformanceMode
    // keep setState calls to 400ms frequency at maximum to try and keep this performant
    throttle(setBoxShadowOpacity, 400),
    []
  );
  const [sketchConfig, setSketchConfig] = useState<ISketchConfigType>({
    density: 3,
    filterFrequency: 750,
    harmony: "majorPentatonic",
    range: 0,
    soundEnabled: false,
    speed: 1,
    trail: -55,
    volume: 0,
    waveform: "amsquare",
  });

  useEffect(() => {
    // hook up sound on mount
    master.toDestination();
    return () => {
      // fade out sound on unmount (prevents pops and crackles when navigating away)
      master.gain.rampTo(0, 0.1);
      master.disconnect();
    };
  }, []);

  // TO DO: this fading of box shadow following border event is really cool
  // but have sacrificed it for now to free up cpu for sound
  // if opacity is high following sound dot border event, gradually lower it at slow speeds
  // useEffect(() => {
  //   let timeout: number;
  //   if (
  //     !lowPerformanceMode &&
  //     boxShadowOpacity > 0.21 &&
  //     sketchConfig.speed < 4
  //   ) {
  //     timeout = setTimeout(
  //       () => throttledSetBoxShadowOpacity((prev) => prev - 0.1),
  //       400
  //     );
  //   }
  //   return () => {
  //     clearTimeout(timeout);
  //   };
  // }, [
  //   boxShadowOpacity,
  //   lowPerformanceMode,
  //   sketchConfig.speed,
  //   throttledSetBoxShadowOpacity,
  // ]);

  const frameRate = lowPerformanceMode ? 30 : 60;

  const { soundDots } = useSoundDots({
    frameRate,
    lowPerformanceMode,
    sketchConfig,
    sketchSize,
    throttledSetBoxShadowOpacity,
  });

  // memoizing the sketch allows us to update box shadow (glow effect) without rerendering sketch component
  const memoizedSketch = useMemo(() => {
    return (
      <SketchComponent
        frameRate={frameRate}
        sketchSize={sketchSize}
        soundDots={soundDots}
        trail={Math.abs(sketchConfig.trail)}
      />
    );
  }, [frameRate, sketchConfig, sketchSize, soundDots]);

  const { hue, light } = harmonyColorLookup[sketchConfig.harmony];

  const sketchContainerStyle = {
    boxShadow: `0 0 20px hsla(${hue}, 50%, ${light}%, ${boxShadowOpacity})`,
    transition: "box-shadow .5s ease",
    display: "inline-flex",
  };

  const headerStyle = {
    color: `hsla(${hue}, ${light}%, 60%, ${Math.max(boxShadowOpacity, 0.65)})`,
    transition: "all .5s ease",
    marginBottom: "20px",
  };

  return (
    <Box sx={{ maxWidth: sketchSize }}>
      <Typography sx={headerStyle} variant="h3">
        Byte Chime
      </Typography>
      <Box sx={sketchContainerStyle}>{memoizedSketch}</Box>
      <Box sx={{ maxWidth: sketchSize }}>
        <ControlPanel
          sketchConfig={sketchConfig}
          setSketchConfig={setSketchConfig}
          lowPerformanceMode={lowPerformanceMode}
          setLowPerformanceMode={setLowPerformanceMode}
        />
      </Box>
    </Box>
  );
};
