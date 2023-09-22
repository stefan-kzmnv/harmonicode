// Function to generate a new melody. It will take as
// input the melodic scale that the user has selected.
export function generateMelody(melodyKey) {
  // https://studiocode.dev/resources/midi-middle-c/
  // Link where the keys/notes can be found, usefil to use in report
  const melody = [];
  let start = 0;

  const maxNotes = Math.floor(Math.random() * 61) + 4; // Between 4 and 64 notes.
  const possibleNoteLengths = [1, 0.5, 0.25]; // Predetermined lengths for notes.
  const possibleSilenceLengths = [0, 0, 1, 0.5, 0.25, 0.125]; // Possible lengths for silences, with 0 repeated for higher probability.

  // The function will be biased to select pitches and lengths close to the previous ones.
  // This is done to give the melodies a little structure from the start.
  let previousLength =
    possibleNoteLengths[Math.floor(Math.random() * possibleNoteLengths.length)]; // Initialize with a random length.
  let previousPitch = melodyKey[Math.floor(Math.random() * melodyKey.length)]; // Initialize with a random pitch.

  // Loop as many times as the maxNotes random number.
  for (let i = 0; i < maxNotes; i++) {
    // Select a pitch, favoring pitches close to the previous pitch.
    const pitch = selectPitch(previousPitch, melodyKey);

    // Randomly select a velocity between 50 and 127.
    const velocity = Math.floor(Math.random() * 78) + 50;

    // Select a note length, favoring lengths close to the previous length.
    const length = selectLength(previousLength, possibleNoteLengths);

    // Select a silence length, favoring lengths close to the previous length.
    const silence = selectLength(length, possibleSilenceLengths);

    // Ensure that the melody does not exceed eight beats.
    if (start + length + silence > 8) break;

    // Create the note object.
    const note = {
      start: start,
      end: start + length,
      pitch: pitch,
      velocity: velocity,
    };

    // Add the note to the melody.
    melody.push(note);

    // Update the start time for the next note.
    start += length + silence;
    previousLength = length;
  }

  return melody;
}

export function selectLength(previousLength, possibleLengths) {
  // Favor selecting a length close to the previous length.
  const favoredLengths = possibleLengths.filter(
    (length) => Math.abs(length - previousLength) <= 1
  );
  return favoredLengths[Math.floor(Math.random() * favoredLengths.length)];
}

export function selectPitch(previousPitch, melodyKey) {
  // To favor selecting a pitch in a particular range of a previous
  // pitch, uncomment the "<= 6" and, if desired, change its value.
  const favoredPitches = melodyKey.filter(
    (pitch) => Math.abs(pitch - previousPitch) // <= 6
  );
  return (
    favoredPitches[Math.floor(Math.random() * favoredPitches.length)] ||
    previousPitch
  );
}
