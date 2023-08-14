import {
  IFavoriteSetting,
  maxDensityHighPerformance,
  maxDensityLowPerformance,
  maxSpeedHighPerformance,
  maxSpeedLowPerformance,
} from "./ByteChime.constants";
/**
 * validate sketch setting favorites to make sure they are limited by lowPerformance limits
 */
export const validateSketchConfigFavorite = (
  newConfig: IFavoriteSetting,
  lowPerformanceMode: boolean
) => {
  const { density = 1, name, speed = 1 } = newConfig;
  const currentMaxDensity = lowPerformanceMode
    ? maxDensityLowPerformance
    : maxDensityHighPerformance;
  const validatedDensity = Math.min(density, currentMaxDensity);

  const currentMaxSpeed = lowPerformanceMode
    ? maxSpeedLowPerformance
    : maxSpeedHighPerformance;
  let validatedSpeed = speed;
  // easter egg to escape speed limitations of UI in honor of our special, zoomy boy
  if (name !== `Blaze's Two Brain Cells`) {
    validatedSpeed = Math.min(speed, currentMaxSpeed);
  }
  return {
    ...newConfig,
    density: validatedDensity,
    speed: validatedSpeed,
  };
};
