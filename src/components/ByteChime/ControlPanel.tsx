import { ChangeEvent, Dispatch, SetStateAction } from "react";
import * as Tone from "tone";
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
import { ISketchConfigType } from "./ByteChime";

export interface IControlPanelProps {
  sketchConfig: ISketchConfigType;
  setSketchConfig: Dispatch<SetStateAction<ISketchConfigType>>;
}

export const ControlPanel = ({
  sketchConfig,
  setSketchConfig,
}: IControlPanelProps) => {
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
    const newHarmony = e.target.value as HarmonyOptions;
    setSketchConfig((prev) => ({
      ...prev,
      harmony: newHarmony,
    }));
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

  const exponentialVolumeToLinearSliderValue = convertLogVolumeToLinear(
    sketchConfig.volume
  );

  const exponentialFrequencyToLinearSliderValue =
    Math.log(sketchConfig.filterFrequency / 300) / Math.log(1.038);

  return (
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
            max={10}
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
            max={15}
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
  );
};
