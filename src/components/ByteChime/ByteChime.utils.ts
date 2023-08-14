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
  const { density, name, speed } = newConfig;
  const currentMaxDensity = lowPerformanceMode
    ? maxDensityLowPerformance
    : maxDensityHighPerformance;
  const validatedDensity =
    typeof density === "number"
      ? Math.min(density, currentMaxDensity)
      : density;

  const currentMaxSpeed = lowPerformanceMode
    ? maxSpeedLowPerformance
    : maxSpeedHighPerformance;
  let validatedSpeed = speed;
  // easter egg to escape speed limitations of UI in honor of our special, zoomy boy
  if (name !== `Blaze's Two Brain Cells`) {
    validatedSpeed =
      typeof speed === "number" ? Math.min(speed, currentMaxSpeed) : speed;
  }
  return {
    ...newConfig,
    density: validatedDensity,
    speed: validatedSpeed,
  };
};
