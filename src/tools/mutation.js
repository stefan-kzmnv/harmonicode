import { selectPitch, selectLength } from "./generation";

export function mutate(
  incomingMelodies,
  selectedScaleNotes,
  mutationParameters
) {
  const evolvedMelodies = {};
  // Used to give IDs to melodies, starting at 1 and up to 10.
  let populationCount = 1;

  // For each of the two parents we will generate 5 children,
  // resulting in 10 melodies per generation.
  for (let i = 0; i < 5; i++) {
    for (const melody of Object.values(incomingMelodies)) {
      const mutatedAlteredPitches = mutateAlterPitches(
        melody,
        selectedScaleNotes,
        mutationParameters.alterPitchesProbability
      );
      const mutatedMovedNotes = mutateMoveNotes(
        mutatedAlteredPitches,
        mutationParameters.moveNotesProbability
      );
      const mutatedCopyPastedBeats = mutateCopyPasteBeats(
        mutatedMovedNotes,
        mutationParameters.copyPasteBeatProbability
      );
      evolvedMelodies[populationCount] = mutateAddOrRemoveNotes(
        mutatedCopyPastedBeats,
        selectedScaleNotes,
        mutationParameters.addOrRemoveNotesProbability
      );
      populationCount++;
    }
  }

  return evolvedMelodies;
}

// Pitch mutation function
export function mutateAlterPitches(notes, scale, probability) {
  // Create a deep copy of the melody array, so that we don't
  // end up just altering the original array with each function
  // call. This is needed, because JavaScript passes arrays by reference.
  const newNotes = JSON.parse(JSON.stringify(notes));

  // Iterate through each note in the newNotes array
  for (let i = 0; i < newNotes.length; i++) {
    // Generate a random number between 0 and 1.
    const randomNum = Math.random();

    // Check if the probability is equal to or larger than the random number.
    // If it is, we will alter the note's pitch.
    if (probability >= randomNum) {
      // Select a random pitch from the scale that was passed.
      let randomPitchIndex = Math.floor(Math.random() * scale.length);
      let newPitch = scale[randomPitchIndex];

      // Make sure the new pitch is different from the current pitch
      // and choose a new pitch if it is not.
      while (newPitch === newNotes[i].pitch) {
        randomPitchIndex = Math.floor(Math.random() * scale.length);
        newPitch = scale[randomPitchIndex];
      }

      // Finally, mutate the note's pitch.
      newNotes[i].pitch = newPitch;
    }
  }

  // Return a mutated melody, which will be a newly generated array.
  return newNotes;
}

export function mutateMoveNotes(notes, probability) {
  // Helper function to check if a note can be placed at a given start time.
  // It checks if there are other notes occupying the same time/space.
  function canPlace(note, startTime, newNotes) {
    const endTime = startTime + (note.end - note.start);
    for (let otherNote of newNotes) {
      // If the note is one and the same, skip comparison.
      if (otherNote === note) continue;
      // Compare the start and end times of the two notes.
      // If there is any overlap, return false.
      if (
        (startTime >= otherNote.start && startTime < otherNote.end) ||
        (endTime > otherNote.start && endTime <= otherNote.end) ||
        (startTime <= otherNote.start && endTime >= otherNote.end)
      ) {
        return false;
      }
    }
    // Return true only if the endtime is also below 8 seconds, false otherwise.
    // This will need to be adjusted if we implement a dynamic BPM value.
    return endTime <= 8;
  }

  // Create a deep copy of the melody array, so that we don't
  // end up just altering the original array with each function
  // call. This is needed, because JavaScript passes arrays by reference.
  const newNotes = JSON.parse(JSON.stringify(notes));

  // Iterate through each note in the newNotes array
  for (let note of newNotes) {
    // Check if the probability is equal to or larger than the random number.
    // If it is, we will move the note.
    if (Math.random() <= probability) {
      let potentialStartTimes = [];

      // Check how many empty places there are that would fit the note,
      // considering its length.
      for (let t = 0; t <= 8; t += 0.125) {
        // Increment by 1/8 of a beat.
        if (canPlace(note, t, newNotes)) {
          potentialStartTimes.push(t);
        }
      }

      // If any potential start times were found, we will place the
      // note at one of them.
      if (potentialStartTimes.length > 0) {
        // Randomly select a start time from the potential start times.
        const randomStartTime =
          potentialStartTimes[
            Math.floor(Math.random() * potentialStartTimes.length)
          ];
        note.end = randomStartTime + (note.end - note.start);
        note.start = randomStartTime;
      } else if (note.end - note.start > 0.125) {
        // If the note couldn't be moved and its length is
        // greater than 0.125, decrease its length by half.
        note.end = note.start + (note.end - note.start) / 2;
      }
    }
  }
  // Return a mutated melody, which will be a newly generated array.
  return newNotes;
}

export function mutateCopyPasteBeats(notes, probability) {
  // Create a deep copy of the melody array, so that we don't
  // end up just altering the original array with each function
  // call. This is needed, because JavaScript passes arrays by reference.
  const newNotes = JSON.parse(JSON.stringify(notes));

  // Generate a random number between 0 and 1.
  const randomNum = Math.random();

  // Check if the probability is equal to or larger than the random number.
  if (probability >= randomNum) {
    // Each beat is 0.5 seconds long since BPM is 120.
    const beatDuration = 0.5;

    // Randomly select a beat to extract notes from.
    const sourceBeatStart = Math.floor(Math.random() * 8) * beatDuration;
    const sourceBeatEnd = sourceBeatStart + beatDuration;

    // Randomly select another beat to overwrite. We will use a do-while
    // loop to ensure that the targetBeatStart is not the same as
    // sourceBeatStart. The loop continues to generate new random values
    // until the condition is met that the two start times are not identical.
    let targetBeatStart;
    do {
      targetBeatStart = Math.floor(Math.random() * 8) * beatDuration;
    } while (targetBeatStart === sourceBeatStart);
    const targetBeatEnd = targetBeatStart + beatDuration;

    // Extract notes from the source beat and handle notes stretching
    // into and out of the source beat.
    const extractedNotes = [];
    for (let i = 0; i < newNotes.length; i++) {
      const note = newNotes[i];
      if (note.start >= sourceBeatStart && note.start < sourceBeatEnd) {
        if (note.end > sourceBeatEnd) {
          // Cut the note at the end of the source beat if it stretches out.
          note.end = sourceBeatEnd;
        }
        extractedNotes.push({ ...note });
        newNotes.splice(i, 1);
        i--;
      } else if (note.start < sourceBeatStart && note.end > sourceBeatStart) {
        // If the note stretches into the beat, split it.
        const newNote = {
          ...note,
          start: sourceBeatStart,
          end: note.end,
        };
        // Cut the note at the start of the source beat.
        note.end = sourceBeatStart;
        extractedNotes.push(newNote);
      }
    }

    // Remove notes from the target beat and handle notes stretching into
    // the target beat the same way we did above.
    for (let i = 0; i < newNotes.length; i++) {
      const note = newNotes[i];
      if (note.start >= targetBeatStart && note.start < targetBeatEnd) {
        newNotes.splice(i, 1);
        i--;
      } else if (note.start < targetBeatStart && note.end > targetBeatStart) {
        // Split the note.
        note.end = targetBeatStart;
      } else if (note.start < targetBeatEnd && note.end > targetBeatEnd) {
        // Cut out the part of the note that stretches into the target beat.
        note.start = targetBeatEnd;
      }
    }

    // Adjust the start and end times of the extracted notes to fit the target beat.
    const timeShift = targetBeatStart - sourceBeatStart;
    for (const note of extractedNotes) {
      note.start += timeShift;
      note.end += timeShift;
    }

    // Insert the extracted notes into the newNotes array.
    newNotes.push(...extractedNotes);
    newNotes.sort((a, b) => a.start - b.start);
  }
  // Return a mutated melody, which will be a newly generated array.
  return newNotes;
}

export function mutateAddOrRemoveNotes(notes, melodyKey, probability) {
  // Create a deep copy of the melody array, so that we don't
  // end up just altering the original array with each function
  // call. This is needed, because JavaScript passes arrays by reference.
  const newMelody = JSON.parse(JSON.stringify(notes));

  // Generate a random number between 0 and 1.
  const randomNum1 = Math.random();

  // Check if the probability is greater than or equal to the random number.
  if (probability >= randomNum1) {
    // Generate a second random number to decide if we will add or remove notes.
    const randomNum2 = Math.random();

    // Make it more likely to add a note or to do nothing.
    if (randomNum2 >= 0.25) {
      // Use the selectLength function (from generation.js) to select the note's length.
      const possibleNoteLengths = [1, 0.5, 0.25]; // Possible lengths for notes
      const newNoteLength = selectLength(1, possibleNoteLengths);

      // Determine the start time for the new note ensuring it fits within the 8 beats.
      const newNoteStart = Math.random() * (8 - newNoteLength);

      // Find the note that comes right before the new note's start time.
      let previousNote = null;
      for (let i = newMelody.length - 1; i >= 0; i--) {
        if (newMelody[i].end <= newNoteStart) {
          previousNote = newMelody[i];
          break;
        }
      }

      // If there's no note before the new note's start time,
      // default to the first pitch of the melody.
      const previousPitch = previousNote
        ? previousNote.pitch
        : newMelody[0].pitch;

      // Use the pitch of the previous note to determine the new note's pitch,
      // using the selectPitch function (from generation.js).
      const newNotePitch = selectPitch(previousPitch, melodyKey);

      // Construct the new note.
      const newNote = {
        start: newNoteStart,
        end: newNoteStart + newNoteLength,
        pitch: newNotePitch,
        // Random velocity between 50 and 127.
        velocity: Math.floor(Math.random() * 78) + 50,
      };

      // Check if the new note overlaps with any existing notes.
      let hasOverlap = false;
      for (let note of newMelody) {
        if (note.start < newNote.end && note.end > newNote.start) {
          hasOverlap = true;
          break;
        }
      }

      // If there's no overlap, add the new note.
      // If there is, just do nothing.
      if (!hasOverlap) {
        newMelody.push(newNote);
      }
    } else {
      // Remove a random note if the melody has more than 4 notes.
      // If it has 4 or less, just do nothing.
      if (newMelody.length > 4) {
        newMelody.splice(Math.floor(Math.random() * newMelody.length), 1);
      }
    }
  }
  // Return a mutated melody, which will be a newly generated array.
  return newMelody;
}
