import { useMemo, useState } from "react";
import { SketchComponent } from "../Sketch/Sketch";
import {
  HarmonyOptions,
  SynthOscillatorTypeOptions,
} from "./ByteChime.constants";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { harmonyColorLookup } from "../Sound/Sound.constants";
import { ControlPanel } from "./ControlPanel";
import { useSoundDots } from "../Sound/useSoundDots";

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

  const [highPerformanceMode, setHighPerformanceMode] = useState(false);
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

  const frameRate = highPerformanceMode ? 60 : 30;

  const { soundDots } = useSoundDots({
    frameRate,
    highPerformanceMode,
    sketchConfig,
    sketchSize,
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
    boxShadow: `0 0 20px hsl(${hue}, 50%, ${light}%)`,
    transition: "box-shadow .3s ease",
    display: "inline-flex",
  };

  const headerStyle = {
    color: `hsl(${hue}, ${light}%, 60%)`,
    transition: "all .3s ease",
    marginBottom: "20px",
  };

  return (
    <Box sx={{ maxWidth: sketchSize }}>
      <Typography sx={headerStyle} variant="h3">
        DotTune
      </Typography>
      <Box sx={sketchContainerStyle} className="sketchContainer">
        {memoizedSketch}
      </Box>
      <Box sx={{ maxWidth: sketchSize }}>
        <ControlPanel
          sketchConfig={sketchConfig}
          setSketchConfig={setSketchConfig}
          highPerformanceMode={highPerformanceMode}
          setHighPerformanceMode={setHighPerformanceMode}
        />
      </Box>
    </Box>
  );
};
