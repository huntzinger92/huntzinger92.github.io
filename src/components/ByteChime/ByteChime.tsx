import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import * as Tone from "tone";
import { SketchComponent } from "../Sketch/Sketch";
import {
  HarmonyOptions,
  SynthOscillatorTypeOptions,
  convertLinearVolumeToDb,
  convertLogVolumeToLinear,
  favoritesList,
  harmonyOptions,
  maxTrail,
  synthOscillatorTypeOptions,
} from "./ByteChime.constants";
import {
  Box,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import * as styles from "./ByteChime.styles";
import { throttle } from "lodash";

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
  // useCallback doesn't seem to know how to check for throttle dependencies, but we know an empty dep array is fine here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledSetBoxShadowColor = useCallback(
    // box shadow color is updated on border events
    // and invoked repeatedly to dim after border events
    // keep setState calls to 150ms frequency at maximum to try and keep this performant
    throttle(setBoxShadowColor, 150),
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

  const narrowNumberOrArrayToNum = (value: number | number[]) => {
    return typeof value === "number" ? value : value[0];
  };

  const handleSpeed = (newSpeed: number | number[]) => {
    setSketchConfig((prev) => ({
      ...prev,
      speed: narrowNumberOrArrayToNum(newSpeed),
    }));
  };

  const handleHarmony = (e: SelectChangeEvent<HarmonyOptions>) => {
    setSketchConfig((prev) => ({
      ...prev,
      harmony: e.target.value as HarmonyOptions,
    }));
    // set glow effect to transparent on harmony change
    throttledSetBoxShadowColor({ hue: 0, saturation: 0, light: 0 });
  };

  const handleWaveform = (e: SelectChangeEvent<SynthOscillatorTypeOptions>) => {
    setSketchConfig((prev) => ({
      ...prev,
      waveform: e.target.value as SynthOscillatorTypeOptions,
    }));
  };

  const handleRange = (newRange: number | number[]) => {
    setSketchConfig((prev) => ({
      ...prev,
      range: narrowNumberOrArrayToNum(newRange),
    }));
  };

  const handleDensity = (newDensity: number | number[]) => {
    setSketchConfig((prev) => ({
      ...prev,
      density: narrowNumberOrArrayToNum(newDensity),
    }));
  };

  const handleVolume = async (newVolume: number | number[]) => {
    if (!sketchConfig.soundEnabled) {
      await Tone.start();
    }
    const sliderVolume = narrowNumberOrArrayToNum(newVolume); // linear scale;
    const volumeInDb = convertLinearVolumeToDb(sliderVolume); // 1 => -100db, 5 => -30db, 10 => 0db
    setSketchConfig((prev) => ({
      ...prev,
      volume: volumeInDb,
      soundEnabled: true,
    }));
  };

  const handleTrail = (newTrail: number | number[]) => {
    const newTrailNumber = narrowNumberOrArrayToNum(newTrail);
    setSketchConfig((prev) => ({ ...prev, trail: newTrailNumber }));
  };

  const handleFilter = (newFilter: number | number[]) => {
    // convert linear based slider value to logarithmic frequency scale
    setSketchConfig((prev) => ({
      ...prev,
      filterFrequency: 1.038 ** narrowNumberOrArrayToNum(newFilter) * 250,
    }));
  };

  const handleFavorite = (e: ChangeEvent<HTMLInputElement>) => {
    const matchingConfig = favoritesList.find(
      (favorite) => favorite.name === e.target.value
    );
    if (matchingConfig) {
      setSketchConfig((prev) => ({
        ...prev,
        ...matchingConfig,
        soundEnabled: true,
      }));
    }
  };

  useEffect(() => {
    let timeout: number;
    if (boxShadowColor.light > 15) {
      timeout = setTimeout(
        () =>
          throttledSetBoxShadowColor((prev) => ({
            ...prev,
            light: prev.light - 5,
          })),
        300
      );
    }
    return () => {
      throttledSetBoxShadowColor.cancel();
      clearTimeout(timeout);
    };
  }, [boxShadowColor.light, throttledSetBoxShadowColor]);

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
        setBoxShadowColor={throttledSetBoxShadowColor}
        sketchConfig={formattedSketchConfig}
      />
    );
  }, [sketchConfig, throttledSetBoxShadowColor]);

  const { hue, saturation, light } = boxShadowColor;

  const sketchContainerStyle = {
    boxShadow: `0 0 25px hsl(${hue}, ${saturation}%, ${light}%)`,
    transition: "box-shadow 1s ease",
    display: "inline-flex",
  };

  const headerStyle = {
    textShadow: `0px 0px 20px hsl(${hue}, ${saturation}%, ${light - 5}%)`,
    color: `hsl(${hue}, ${light}%, ${60}%)`,
    transition: "all 1s ease",
    marginBottom: "20px",
  };

  const exponentialVolumeToLinearSliderValue = convertLogVolumeToLinear(
    sketchConfig.volume
  );

  const exponentialFrequencyToLinearSliderValue =
    Math.log(sketchConfig.filterFrequency / 300) / Math.log(1.038);

  return (
    <Box>
      <Typography sx={headerStyle} variant="h2">
        Byte Chime
      </Typography>
      <Box sx={sketchContainerStyle}>{memoizedSketch}</Box>
      <Box sx={styles.inputsContainer}>
        <Box sx={styles.selectContainer}>
          <Select
            value={sketchConfig.harmony}
            onChange={handleHarmony}
            sx={styles.select}
          >
            {Object.entries(harmonyOptions).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={sketchConfig.waveform}
            onChange={handleWaveform}
            sx={styles.select}
          >
            {Object.entries(synthOscillatorTypeOptions).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            ))}
          </Select>
          <TextField
            select
            variant="outlined"
            defaultValue={favoritesList[0].name}
            onChange={handleFavorite}
            sx={styles.select}
            label="Favorites"
          >
            {favoritesList.map((favoriteSetting) => (
              <MenuItem key={favoriteSetting.name} value={favoriteSetting.name}>
                {favoriteSetting.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={styles.inputsRow}>
          <Box sx={styles.sliderAndLabel}>
            <Typography>Density</Typography>
            <Slider
              min={1}
              max={12}
              value={sketchConfig.density}
              onChange={(_, value) => handleDensity(value)}
            />
          </Box>
          <Box sx={styles.sliderAndLabel}>
            <Typography>Volume</Typography>
            <Slider
              min={1}
              max={9}
              value={exponentialVolumeToLinearSliderValue}
              onChange={(_, value) => handleVolume(value)}
            />
          </Box>
          <Box sx={styles.sliderAndLabel}>
            <Typography>Filter</Typography>
            <Slider
              min={1}
              max={100}
              value={exponentialFrequencyToLinearSliderValue}
              onChange={(_, value) => handleFilter(value)}
            />
          </Box>
        </Box>
        <Box sx={styles.inputsRow}>
          <Box sx={styles.sliderAndLabel}>
            <Typography>Speed</Typography>
            <Slider
              min={0.1}
              max={25}
              value={sketchConfig.speed}
              onChange={(_, value) => handleSpeed(value)}
            />
          </Box>
          <Box sx={styles.sliderAndLabel}>
            <Typography>Range</Typography>
            <Slider
              min={0}
              max={6}
              value={sketchConfig.range}
              onChange={(_, value) => handleRange(value)}
            />
          </Box>
          <Box sx={styles.sliderAndLabel}>
            <Typography>Trail</Typography>
            <Slider
              min={maxTrail * -1}
              max={-1}
              value={sketchConfig.trail}
              onChange={(_, value) => handleTrail(value)}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
