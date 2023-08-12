import { useCallback, useEffect, useMemo, useState } from "react";
import { SketchComponent } from "../Sketch/Sketch";
import {
  HarmonyOptions,
  SynthOscillatorTypeOptions,
  convertLinearVolumeToDb,
  convertLogVolumeToLinear,
} from "./ByteChime.constants";
import { Box, Typography } from "@mui/material";
import { throttle } from "lodash";
import { harmonyColorLookup } from "../Sketch/Sketch.constants";
import { ControlPanel } from "./ControlPanel";

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
   * how loud the dots are
   */
  volume: number;
  /**
   * the chosen waveform of the synth to be played (sine, square, etc.)
   */
  waveform: SynthOscillatorTypeOptions;
}

export const ByteChime = () => {
  const [boxShadowColor, setBoxShadowColor] = useState({
    hue: 0,
    saturation: 0,
    light: 0,
  });
  /**
   * on sound dot border event, we set opacity to 1
   * please note that opacity is much more performant to animate than box shadow
   */
  const [boxShadowOpacity, setBoxShadowOpacity] = useState(0);
  // useCallback doesn't seem to know how to check for throttle dependencies, but we know an empty dep array is fine here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledSetBoxShadowOpacity = useCallback(
    // box shadow color is updated on border events
    // and invoked repeatedly to dim after border events
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
    volume: -100,
    waveform: "fatsquare",
  });

  // change color of box shadow and header to match harmony color scheme
  useEffect(() => {
    const { hue, light } = harmonyColorLookup[sketchConfig.harmony];
    setBoxShadowColor({ hue, light, saturation: 50 });
  }, [sketchConfig.harmony]);

  // if opacity is high following sound dot border event, gradually lower it
  useEffect(() => {
    let timeout: number;
    if (boxShadowOpacity > 0.21) {
      timeout = setTimeout(
        () => throttledSetBoxShadowOpacity((prev) => prev - 0.1),
        400
      );
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [boxShadowOpacity, throttledSetBoxShadowOpacity]);

  useEffect(() => {
    const volumeHandler = (keydownEvent: KeyboardEvent) => {
      if (keydownEvent.code === "AudioVolumeUp") {
        setSketchConfig((prev) => ({
          ...prev,
          soundEnabled: true,
          volume: convertLinearVolumeToDb(
            convertLogVolumeToLinear(prev.volume) + 1 > 9
              ? 9
              : convertLogVolumeToLinear(prev.volume) + 1
          ),
        }));
      } else if (keydownEvent.code === "AudioVolumeDown") {
        setSketchConfig((prev) => ({
          ...prev,
          soundEnabled: true,
          volume: convertLinearVolumeToDb(
            convertLogVolumeToLinear(prev.volume) - 1 < 0
              ? 0
              : convertLogVolumeToLinear(prev.volume) - 1
          ),
        }));
      }
    };
    window.addEventListener("keydown", volumeHandler);
    return () => {
      window.removeEventListener("keydown", volumeHandler);
    };
  }, []);

  // memoizing the sketch allows us to update box shadow (glow effect) without rerendering sketch component
  const memoizedSketch = useMemo(() => {
    // we want to differ from the controlled input values a bit for convenience on the sketch component side
    const formattedSketchConfig = {
      ...sketchConfig,
      density: Math.ceil(sketchConfig.density),
      range: Math.ceil(sketchConfig.range),
      speed: Math.ceil(sketchConfig.speed),
      trail: Math.abs(sketchConfig.trail),
    };
    return (
      <SketchComponent
        throttledSetBoxShadowOpacity={throttledSetBoxShadowOpacity}
        sketchConfig={formattedSketchConfig}
      />
    );
  }, [sketchConfig, throttledSetBoxShadowOpacity]);

  const { hue, saturation, light } = boxShadowColor;

  const sketchContainerStyle = {
    boxShadow: `0 0 32px hsla(${hue}, ${saturation}%, ${light}%, ${boxShadowOpacity})`,
    transition: "box-shadow 1s ease",
    display: "inline-flex",
  };

  const headerStyle = {
    textShadow: `0px 0px 20px hsla(${hue}, ${saturation}%, ${
      light - 5
    }%, ${boxShadowOpacity})`,
    color: `hsl(${hue}, ${light}%, ${60}%)`,
    transition: "all 1s ease",
    marginBottom: "20px",
  };

  return (
    <Box>
      <Typography sx={headerStyle} variant="h2">
        Byte Chime
      </Typography>
      <Box sx={sketchContainerStyle}>{memoizedSketch}</Box>
      <ControlPanel
        sketchConfig={sketchConfig}
        setSketchConfig={setSketchConfig}
      />
    </Box>
  );
};
