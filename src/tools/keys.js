// Function to easily generate the scales for all octaves
// present on a piano.
function generateScale(root, pattern) {
  let scale = [];

  // A piano has 7 octaves, with three additional keys
  // belonging to a lower octave, so loop at most 8 times.
  for (let i = 0; i <= 7; i++) {
    for (let j = 0; j < pattern.length; j++) {
      let note = root + 12 * i + pattern[j];
      if (note >= 21 && note <= 108) {
        scale.push(note);
      }
    }
  }
  return scale;
}

// Major and minor scale patterns.
const majorPattern = [0, 2, 4, 5, 7, 9, 11];
const minorPattern = [0, 2, 3, 5, 7, 8, 10];

// Scales object.
export const scales = {
  CMajor: generateScale(24, majorPattern),
  CMinor: generateScale(24, minorPattern),
  CSharpMajor: generateScale(25, majorPattern),
  CSharpMinor: generateScale(25, minorPattern),
  DMajor: generateScale(26, majorPattern),
  DMinor: generateScale(26, minorPattern),
  DSharpMajor: generateScale(27, majorPattern),
  DSharpMinor: generateScale(27, minorPattern),
  EMajor: generateScale(28, majorPattern),
  EMinor: generateScale(28, minorPattern),
  FMajor: generateScale(29, majorPattern),
  FMinor: generateScale(29, minorPattern),
  FSharpMajor: generateScale(30, majorPattern),
  FSharpMinor: generateScale(30, minorPattern),
  GMajor: generateScale(31, majorPattern),
  GMinor: generateScale(31, minorPattern),
  GSharpMajor: generateScale(32, majorPattern),
  GSharpMinor: generateScale(32, minorPattern),
  AMajor: generateScale(21, majorPattern), // Starts from A0
  AMinor: generateScale(21, minorPattern), // Starts from A0
  ASharpMajor: generateScale(22, majorPattern), // Starts from A#0
  ASharpMinor: generateScale(22, minorPattern), // Starts from A#0
  BMajor: generateScale(23, majorPattern), // Starts from B0
  BMinor: generateScale(23, minorPattern), // Starts from B0
};

// This object is used to map the scale display names
// to the internal names.
export const scaleNamesToInternalEnum = {
  "C Major": "CMajor",
  "C Minor": "CMinor",
  "C# Major": "CSharpMajor",
  "C# Minor": "CSharpMinor",
  "D Major": "DMajor",
  "D Minor": "DMinor",
  "D# Major": "DSharpMajor",
  "D# Minor": "DSharpMinor",
  "E Major": "EMajor",
  "E Minor": "EMinor",
  "F Major": "FMajor",
  "F Minor": "FMinor",
  "F# Major": "FSharpMajor",
  "F# Minor": "FSharpMinor",
  "G Major": "GMajor",
  "G Minor": "GMinor",
  "G# Major": "GSharpMajor",
  "G# Minor": "GSharpMinor",
  "A Major": "AMajor",
  "A Minor": "AMinor",
  "A# Major": "ASharpMajor",
  "A# Minor": "ASharpMinor",
  "B Major": "BMajor",
  "B Minor": "BMinor",
};
