export function rateMelodies(melodiesToRate, desiredFitnessParameters) {
  const melodiesRatings = {};

  // Rate all melodies in a generation.
  for (const [ID, melody] of Object.entries(melodiesToRate)) {
    const singleMelodyRatings = {};

    singleMelodyRatings.extremePitchDifference = absoluteRating(
      extremePitchDifferenceRatio(melody),
      desiredFitnessParameters.extremePitchDifference
    );

    singleMelodyRatings.directionOfMelody = absoluteRating(
      directionOfMelody(melody),
      desiredFitnessParameters.directionOfMelody
    );

    singleMelodyRatings.directionalChangesRatio = absoluteRating(
      changesInMelodyDirectionRatio(melody),
      desiredFitnessParameters.directionalChangesRatio
    );

    singleMelodyRatings.offBeatNotesRatio = absoluteRating(
      offBeatNotesRatio(melody),
      desiredFitnessParameters.offBeatNotesRatio
    );

    singleMelodyRatings.lowestToHighestPitchRatio = absoluteRating(
      lowestToHighestPitchRatio(melody),
      desiredFitnessParameters.lowestToHighestPitchRatio
    );

    singleMelodyRatings.uniquePitchRatio = absoluteRating(
      uniquePitchRatio(melody),
      desiredFitnessParameters.uniquePitchRatio
    );

    singleMelodyRatings.consecutivePitchesRatio = absoluteRating(
      consecutivePitchesRatio(melody),
      desiredFitnessParameters.consecutivePitchesRatio
    );

    singleMelodyRatings.uniqueRhythmRatio = absoluteRating(
      uniqueRhythmRatio(melody),
      desiredFitnessParameters.uniqueRhythmRatio
    );

    // We will consider pitch interval motifs to be a little more
    // important and multiply their result by 2.
    singleMelodyRatings.pitchIntervalMotifs =
      calculateMotifsRatio(
        findCollections(melody, "pitchIntervals"),
        melody,
        "pitchIntervals"
      ) * 3;

    singleMelodyRatings.durationMotifs =
      calculateMotifsRatio(
        findCollections(melody, "durations"),
        melody,
        "durations"
      ) * 2;

    singleMelodyRatings.pauseMotifs =
      calculateMotifsRatio(
        findCollections(melody, "pauses"),
        melody,
        "pauses"
      ) * 2;

    melodiesRatings[ID] = singleMelodyRatings;
  }

  // Return the ratings of the entire generation.
  return melodiesRatings;
}

// This function is used to calculate the ratio of notes that have
// a difference of more than 17 pitches (octave + dominant) from
// the note before them. The ear does not perceive such jumps as
// pleasant and the presence of many such notes is not desired.
export function extremePitchDifferenceRatio(midiNotes) {
  let count = 0;
  for (let i = 1; i < midiNotes.length; i++) {
    const pitchDifference = Math.abs(
      midiNotes[i].pitch - midiNotes[i - 1].pitch
    );
    if (pitchDifference > 17) {
      count++;
    }
  }

  // Approaching 1 when all notes have a pitch difference
  // of more than 17 with the preceding note.
  // 0 means there are no such notes.
  return count / midiNotes.length;
}

// This function is used to determine whether the notes in a melody are
// generally moving in an upward, downward, or just parallel direction.
export function directionOfMelody(midiNotes) {
  let upwardCount = 0;
  for (let i = 1; i < midiNotes.length; i++) {
    if (midiNotes[i].pitch > midiNotes[i - 1].pitch) {
      upwardCount++;
    }
  }

  // Above 0.5 means melody has an upward direction.
  // Below 0.5 means it has a downward one.
  return upwardCount / midiNotes.length;
}

// This function is used to determine how many times the melody
// changes its direction. Frequent changes in direction contribute
// to a chaotic perception and are generally not desirable, however,
// a few can give the melody some variety.
export function changesInMelodyDirectionRatio(midiNotes) {
  let directionChanges = 0;
  // The currentDirection can be 'up', 'down', or null.
  let currentDirection = null;

  for (let i = 1; i < midiNotes.length; i++) {
    const pitchDifference = midiNotes[i].pitch - midiNotes[i - 1].pitch;

    if (pitchDifference > 0 && currentDirection !== "up") {
      currentDirection = "up";
      if (i !== 1) {
        // We don't count the first note's direction as a change.
        directionChanges++;
      }
    } else if (pitchDifference < 0 && currentDirection !== "down") {
      currentDirection = "down";
      if (i !== 1) {
        // We don't count the first note's direction as a change.
        directionChanges++;
      }
    }
  }

  // 0 if no direction changes at all.
  // Approaching 1, the more changes in direction there are.
  return directionChanges / midiNotes.length;
}

// This function is used to determine how many notes begin on a
// strong beat or a half time. Melodies that have a great many notes
// beginning at weak times require a great deal of precision to
// pull off, which is unlikely to happen in the current scenario.
export function offBeatNotesRatio(midiNotes) {
  let offBeatCount = 0;

  for (let note of midiNotes) {
    const isStrongBeat = note.start % 0.5 === 0;
    const isHalfBeat = note.start % 0.25 === 0 && !isStrongBeat;

    if (!isStrongBeat && !isHalfBeat) {
      offBeatCount++;
    }
  }

  // 0 means all notes start on a strong or half time.
  // 1 means all notes start on an off beat.
  return offBeatCount / midiNotes.length;
}

// This function is used to determine the ratio between
// the lowest and highest pitch in the melody. A melody that
// spans many octaves in a short time is unlikely to sound
// very pleasant.
export function lowestToHighestPitchRatio(midiNotes) {
  let highestPitch = midiNotes[0].pitch;
  let lowestPitch = midiNotes[0].pitch;

  for (let note of midiNotes) {
    if (note.pitch > highestPitch) {
      highestPitch = note.pitch;
    }
    if (note.pitch < lowestPitch) {
      lowestPitch = note.pitch;
    }
  }

  // A value close to 1 indicates that the melody has a narrow range.
  // 1 indicates the melody contains just a single pitch.
  // A value much smaller than 1 indicates that the melody has a wider range
  // and a significant difference between the lowest and highest pitches.
  return lowestPitch / highestPitch;
}

// This function is used to determine how many pitches in the melody
// are unique. Either extreme would be undesirable in a pleasant
// melody.
export function uniquePitchRatio(midiNotes) {
  // Sets let us store unique values of any type.
  const uniquePitches = new Set();

  for (let note of midiNotes) {
    uniquePitches.add(note.pitch);
  }

  // A value of 1 indicates that every note in the melody has a unique pitch.
  // A value close to 0 indicates that many notes have the same pitch.
  return uniquePitches.size / midiNotes.length;
}

// This function is used to detemine how many notes have the same pitch as
// the preceding note. Some repetition is desired, but too much
// would sound monotone and boring.
export function consecutivePitchesRatio(midiNotes) {
  let consecutiveCount = 0;

  for (let i = 1; i < midiNotes.length; i++) {
    if (midiNotes[i].pitch === midiNotes[i - 1].pitch) {
      consecutiveCount++;
    }
  }

  // A value close to 1 indicates more notes have the same pitch as the previous note.
  // A value of 0 indicates that no consecutive notes have the same pitch.
  return consecutiveCount / midiNotes.length;
}

// This function is used to determine how many notes have
// unique rhythm values. It is desired for a melody to feature
// somewhat similar rhythms in order to sound more coherent.
export function uniqueRhythmRatio(midiNotes) {
  // Sets let us store unique values of any type.
  const uniqueRhythms = new Set();

  for (let note of midiNotes) {
    const rhythmValue = note.end - note.start;
    uniqueRhythms.add(rhythmValue);
  }

  // A value of 1 indicates that every note in the melody has a unique rhythm value.
  // A value close to 0 indicates that many notes have the same rhythm value.
  return uniqueRhythms.size / midiNotes.length;
}

// Helper function that is used to calculate the absolute difference
// between the actual rating and the desired sweetSpot, (as selected by the user).
// The absolute difference will then be subtracted from 1, in order to get
// normalized values that can be aggregated into one absolute rating.
export function absoluteRating(rating, sweetSpot = 0.8) {
  // Calculate the absolute difference between the rating and the sweet spot.
  const difference = Math.abs(rating - sweetSpot);

  // Subtract the difference from 1 to get the final rating.
  const finalRating = 1 - difference;

  // Rounding the final rating to 3 decimal places with this technique.
  return Math.round(finalRating * 1000) / 1000;
}

// ***
// Below is the logic to try to detect recurrent motifs in melodies.
// We will calculate ratings based on 3 different characteristics.
// Velocity is left out, as it would not work with the current
// implementation, but it could be developed as an improvement (by
// playing the samples at different volumes).
// ***

// This helper function creates a collection of motifs based on the type specified.
// A motif is a short musical idea, recurring figure, musical fragment or succession of notes.
export function createMotifCollection(notes, type) {
  switch (type) {
    case "pitchIntervals":
      // If the type is "pitchIntervals", calculate the pitch intervals between consecutive notes.
      return notes
        .slice(0, -1) // Exclude the last note since there's no next note to compare with.
        .map((note, i) => notes[i + 1].pitch - note.pitch); // Calculate the difference in pitch between the current note and the next note.
    case "durations":
      // If the type is "durations", calculate the duration of each note.
      return notes.map(
        // Calculate the duration of the note by subtracting its start time from its end time.
        (note) => Math.round((note.end - note.start) * 1000) / 1000
      );
    case "pauses":
      // If the type is "pauses", calculate the pauses (silence) between consecutive notes.
      return notes
        .slice(0, -1) // Exclude the last note since there's no next note to compare with.
        .map(
          // Calculate the duration of the pause between the current note and the next note.
          (note, i) => Math.round((notes[i + 1].start - note.end) * 1000) / 1000
        );
    default:
      // If the type doesn't match any of the above, return an empty array.
      return [];
  }
}

// This helper function creates a dictionary (object in JS) where each key represents
// a sub-collection of the input collection and each value is an array of starting
// indices where that sub-collection appears in the input collection.
export function createMotifCollectionDict(collection) {
  let dict = {};
  // Any collection that is smaller than 2 elements should not be
  // deemed a collection, hence why we start the loop with a size of 2.
  for (let size = 2; size <= collection.length; size++) {
    // Loop through the collection to extract sub-collections of the current size.
    for (let i = 0; i <= collection.length - size; i++) {
      // Extract a sub-collection starting from index 'i' and of length 'size'.
      let subCollection = collection.slice(i, i + size);
      // Convert the sub-collection to a string to use as a key in the dictionary.
      let key = JSON.stringify(subCollection);
      if (dict[key]) {
        // If the key already exists in the dictionary, append the current
        // starting index 'i' to its value.
        dict[key].push(i);
      } else {
        // If the key doesn't exist, create a new entry in the dictionary with the key and set
        // its value to an array containing the current starting index 'i'.
        dict[key] = [i];
      }
    }
  }
  return dict;
}

// This helper function filters the input dictionary to retain only those entries where
// the value (an array) has more than one element.
// It then formats the filtered dictionary to an array of objects, where each object
// has a 'positions' property and another property named after the 'type' parameter.
// There should be a simpler, more straightforward way to do this.
export function filterAndFormatMotifDict(dict, type) {
  // Convert the dictionary into an array of [key, value] pairs.
  let entries = Object.entries(dict);

  // Filter the entries to retain only those where the value (an array of starting indices) has more than one element.
  let filteredEntries = entries.filter(([, v]) => v.length > 1);

  // Convert the filtered entries back into a dictionary.
  let filteredDict = Object.fromEntries(filteredEntries);

  // Initialize an empty array to store the formatted objects.
  let formattedArray = [];

  // Loop through the filtered dictionary to format each entry.
  for (let [subCollection, positions] of Object.entries(filteredDict)) {
    // Create a formatted object for the current entry.
    let formattedObject = {
      positions: positions, // The array of starting indices.
      [type]: JSON.parse(subCollection), // The sub-collection parsed from its string representation.
    };

    // Add the formatted object to the array.
    formattedArray.push(formattedObject);
  }

  return formattedArray;
}

// This function post-processes an array of collections by performing
// the following operations:
// 1. It sorts the collections based on their length in descending order.
// 2. It removes any collection that is a sub-collection of another.
// 3. It filters out collections where all positions are consecutive.
// The last point is needed because testing has revealed that this scenarion
// is indicative of the same collection at one place being
// inappropriately handled and listed twice.
export function postProcess(collections, type) {
  // 1. Sort the collections based on their length in descending order.
  collections.sort((a, b) => b[type].length - a[type].length);

  // 2. Remove any collection that is a sub-collection of another.
  let i = 0;
  while (i < collections.length - 1) {
    let j = i + 1;
    while (j < collections.length) {
      let collectionI = collections[i][type];
      let collectionJ = collections[j][type];
      let found = false;

      // Check if collectionJ is a sub-collection of collectionI.
      for (let k = 0; k <= collectionI.length - collectionJ.length; k++) {
        if (
          JSON.stringify(collectionI.slice(k, k + collectionJ.length)) ===
          JSON.stringify(collectionJ)
        ) {
          found = true;
          break;
        }
      }

      // If collectionJ is a sub-collection of collectionI, remove collectionJ.
      if (found) {
        collections.splice(j, 1);
      } else {
        j++;
      }
    }
    i++;
  }

  // 3. Filter out collections where all positions are consecutive.
  collections = collections.filter((collection) => {
    for (let i = 0; i < collection.positions.length - 1; i++) {
      if (collection.positions[i + 1] - collection.positions[i] !== 1) {
        // At least one non-consecutive position found.
        return true;
      }
    }
    // All positions are consecutive.
    return false;
  });

  return collections;
}

// Main function to find collections of entities with matching properties.
// This is what we will consider "motifs" and we will look at those
// properties separately, because a musical motif can take different forms.
// The properties we are looking for are matching pitch intervals, note durations,
// or pauses between notes. A motif can match in one, two, or all three of them.
// ***
// Velocity could also be considered in a similar way, but is outside of the current scope.
// ***
// The most straightforward motifs are ones in which all properties have matches.
// Such motifs are especially popular in modern music and looking at the properties
// separately allows us to give a higher rating and encourage the algorithm to pick
// the specific individual, if there is more than once match.
function findCollections(notes, type) {
  let collection = createMotifCollection(notes, type);
  let dict = createMotifCollectionDict(collection);
  let filteredAndFormatted = filterAndFormatMotifDict(dict, type);
  return postProcess(filteredAndFormatted, type);
}

// This function is used to calculate the ratio of collections found
// in a melody to the total number of notes.
// Possible values for "property" should be
// "pitchIntervals", "durations", and "pauses".
function calculateMotifsRatio(collections, notes, property) {
  // If there are no collections, return 0.
  if (collections.length === 0) {
    return 0;
  }

  // Find the largest collection.
  let largestCollectionLength = collections[0][property].length;
  let largestCollection = collections[0];
  for (let i = 1; i < collections.length; i++) {
    if (collections[i][property].length > largestCollectionLength) {
      largestCollectionLength = collections[i][property].length;
      largestCollection = collections[i];
    }
  }

  // Check if the positions in the largest collection are consecutive.
  let areConsecutive = true;
  let positions = largestCollection.positions;
  let expectedNextPosition = positions[0] + 1;
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] !== expectedNextPosition) {
      areConsecutive = false;
      break;
    }
    expectedNextPosition++;
  }

  // If the positions are consecutive, they must be referring to the
  // same collection, in which case we will not consider them.
  if (areConsecutive) {
    return 0;
  }

  // Calculate the number of items in the largest collection.
  let numberOfItemsInLargestCollection = largestCollectionLength;
  if (property == "pitchIntervals") {
    // Add 1 to account for the starting note of the interval.
    numberOfItemsInLargestCollection += 1;
  }

  // Calculate the ratio and return it. Due to the way we define
  // collections, the highest score possible would be 0.5, which
  // would mean the melody is essentially a collection that repeats
  // twice. We will multiply this by 2 to normalize it to the format
  // of all the other raters.
  let ratio = (numberOfItemsInLargestCollection / notes.length) * 2;
  // Rounding the final ratio to 3 decimal places with this technique.
  return Math.round(ratio * 1000) / 1000;
}
