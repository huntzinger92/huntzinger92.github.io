import {
  IFavoriteSetting,
  maxDensityLowPerformance,
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
  let validatedDensity = density;
  if (lowPerformanceMode) {
    validatedDensity =
      density > maxDensityLowPerformance ? maxDensityLowPerformance : density;
  }
  let validatedSpeed = speed;
  if (lowPerformanceMode && name !== `Blaze's Two Brain Cells`) {
    validatedSpeed =
      speed > maxSpeedLowPerformance ? maxSpeedLowPerformance : speed;
  }
  return {
    ...newConfig,
    density: validatedDensity,
    speed: validatedSpeed,
  };
};
