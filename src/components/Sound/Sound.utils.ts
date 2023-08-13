import { harmonyColorLookup, harmonyLookup } from "./Sound.constants";

/**
 * generates a series of wider octave ranges, going "middle out" from 4
 */
export const createOctaves = (chosenRange: number) => {
  const octaves: number[] = [];
  const centerOctave = 4;
  for (let i = 0; i <= chosenRange; i++) {
    if (i % 2 === 0) {
      octaves.push(centerOctave + Math.ceil(i / 2));
    } else {
      octaves.push(centerOctave - Math.ceil(i / 2));
    }
  }
  return octaves.map((num) => num.toString());
};

/**
 * get notes and base color for sound dot given harmony, range, and filterFrequency
 */
export const getNotesAndColor = ({
  newHarmony,
  newRange,
  filterFrequency,
}: {
  newHarmony: keyof typeof harmonyLookup;
  newRange: number;
  filterFrequency: number;
}) => {
  const possibleHarmony = harmonyLookup[newHarmony];
  const octaves = createOctaves(newRange);
  // only include notes from specified octaves
  const possibleNotes = possibleHarmony.filter((note) =>
    octaves.some((octave) => note.indexOf(octave) >= 0)
  );
  // a range of -15 to +22 depending on filter frequency knob setting
  const adjustLightAmountFromFrequency = Math.floor(
    Math.log(filterFrequency) * 10 - 70
  );
  // do a deep copy so adjusting light doesn't affect "true" harmonyColorLookup const
  const colorPalette = { ...harmonyColorLookup[newHarmony] };
  // make lightness of color dependent on filter frequency
  colorPalette.light += adjustLightAmountFromFrequency;
  return {
    possibleNotes,
    colorPalette,
  };
};
