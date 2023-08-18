import { useEffect, useMemo, useState } from "react";
import * as Tone from "tone";
import { SketchComponent } from "../Sketch/Sketch";
import {
  HarmonyOptions,
  SynthOscillatorTypeOptions,
} from "./ByteChime.constants";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { harmonyColorLookup } from "../Sound/Sound.constants";
import { ControlPanel } from "./ControlPanel";
import { useSoundDots } from "../Sound/useSoundDots";
import "./ByteChime.css";

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
    volume: 0.4,
    waveform: "amsquare",
  });

  useEffect(() => {
    const startTone = async () => {
      if (!sketchConfig.soundEnabled) {
        await Tone.start();
      }
      setSketchConfig((prev) => ({ ...prev, soundEnabled: true }));
    };
    startTone();
  }, [sketchConfig.soundEnabled]);

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
  };

  // make header color's lightness be dependent on user set filter frequency
  const headerColorLightFromFilterFrequency =
    7 * Math.log(sketchConfig.filterFrequency);

  const header1Style = {
    color: `hsl(${hue}, ${light}%, ${headerColorLightFromFilterFrequency}%)`,
    textShadow: `0 0 26px hsl(${hue}, ${light}%, 55%), 0 0 35px hsl(${hue}, ${light}%, 35%)`,
    transition: "inherit",
  };

  // note that the hue of the second header ("Dot") is shifted
  const header2Style = {
    color: `hsl(${
      hue + 25
    }, ${light}%, ${headerColorLightFromFilterFrequency}%)`,
    textShadow: `0 0 26px hsl(${hue}, ${light}%, 55%), 0 0 35px hsl(${hue}, ${light}%, 35%)`,
    transition: "inherit",
  };

  return (
    <Box sx={{ maxWidth: sketchSize }}>
      <Typography id="sketchHeader" variant="h3">
        <span style={header1Style}>Sound</span>
        <span style={header2Style}>Dot</span>
      </Typography>
      <Box sx={sketchContainerStyle} id="sketchContainer">
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
