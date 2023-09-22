import {
  extremePitchDifferenceRatio,
  directionOfMelody,
  changesInMelodyDirectionRatio,
  offBeatNotesRatio,
  lowestToHighestPitchRatio,
  uniquePitchRatio,
  consecutivePitchesRatio,
  uniqueRhythmRatio,
  absoluteRating,
  createMotifCollection,
  createMotifCollectionDict,
  filterAndFormatMotifDict,
  postProcess,
} from "@/tools/rating";

describe("Melody Rating Functions", () => {
  describe("extremePitchDifferenceRatio", () => {
    it("should return 0.8 when all five notes have a pitch difference of more than 17 in a 5 note melody", () => {
      const mockNotes = [
        { pitch: 38 },
        { pitch: 56 },
        { pitch: 75 },
        { pitch: 93 },
        { pitch: 56 },
      ];
      const result = extremePitchDifferenceRatio(mockNotes);
      expect(result).toBe(0.8); // 4/5 = 0.8
    });

    it("should return 0 when no notes have a pitch difference of more than 17", () => {
      const mockNotes = [
        { pitch: 60 },
        { pitch: 61 },
        { pitch: 62 },
        { pitch: 63 },
      ];
      const result = extremePitchDifferenceRatio(mockNotes);
      expect(result).toBe(0);
    });
  });

  describe("directionOfMelody", () => {
    it("should return 0.8 when all five notes in a five note melody are moving in an upward direction", () => {
      const mockNotes = [
        { pitch: 60 },
        { pitch: 61 },
        { pitch: 62 },
        { pitch: 63 },
        { pitch: 64 },
      ];
      const result = directionOfMelody(mockNotes);
      expect(result).toBe(0.8); // 4/5 = 0.8
    });

    it("should return 0 when all notes are moving in a downward direction", () => {
      const mockNotes = [
        { pitch: 63 },
        { pitch: 62 },
        { pitch: 61 },
        { pitch: 60 },
      ];
      const result = directionOfMelody(mockNotes);
      expect(result).toBe(0);
    });
  });

  describe("changesInMelodyDirectionRatio", () => {
    it("should return 0.75 when an eight note melody changes direction at every note", () => {
      const mockNotes = [
        { pitch: 60 },
        { pitch: 61 },
        { pitch: 60 },
        { pitch: 61 },
        { pitch: 60 },
        { pitch: 61 },
        { pitch: 60 },
        { pitch: 61 },
      ];
      const result = changesInMelodyDirectionRatio(mockNotes);
      expect(result).toBe(0.75);
    });

    it("should return 0 when the melody never changes direction", () => {
      const mockNotes = [
        { pitch: 60 },
        { pitch: 61 },
        { pitch: 62 },
        { pitch: 63 },
      ];
      const result = changesInMelodyDirectionRatio(mockNotes);
      expect(result).toBe(0);
    });
  });

  describe("offBeatNotesRatio", () => {
    it("should return 1 when all notes start on an off-beat", () => {
      const mockNotes = [
        { start: 0.125, pitch: 60 },
        { start: 0.375, pitch: 61 },
        { start: 0.625, pitch: 62 },
        { start: 0.875, pitch: 63 },
      ];
      const result = offBeatNotesRatio(mockNotes);
      expect(result).toBe(1);
    });

    it("should return 0 when all notes start on a strong or half time", () => {
      const mockNotes = [
        { start: 0, pitch: 60 },
        { start: 0.5, pitch: 61 },
        { start: 1, pitch: 62 },
        { start: 1.5, pitch: 63 },
      ];
      const result = offBeatNotesRatio(mockNotes);
      expect(result).toBe(0);
    });
  });

  describe("lowestToHighestPitchRatio", () => {
    it("should return 1 when melody contains just a single pitch", () => {
      const mockNotes = [
        { pitch: 60 },
        { pitch: 60 },
        { pitch: 60 },
        { pitch: 60 },
      ];
      const result = lowestToHighestPitchRatio(mockNotes);
      expect(result).toBe(1);
    });

    it("should return a value smaller than 1 when the melody has a wide range", () => {
      const mockNotes = [
        { pitch: 60 },
        { pitch: 72 },
        { pitch: 84 },
        { pitch: 96 },
      ];
      const result = lowestToHighestPitchRatio(mockNotes);
      expect(result).toBeCloseTo(0.625); // 60/96 = 0.625
    });
  });

  describe("uniquePitchRatio", () => {
    it("should return 1 when every note in the melody has a unique pitch", () => {
      const mockNotes = [
        { pitch: 60 },
        { pitch: 61 },
        { pitch: 62 },
        { pitch: 63 },
      ];
      const result = uniquePitchRatio(mockNotes);
      expect(result).toBe(1);
    });

    it("should return a value close to 0 when many notes have the same pitch", () => {
      const mockNotes = [
        { pitch: 60 },
        { pitch: 60 },
        { pitch: 60 },
        { pitch: 60 },
      ];
      const result = uniquePitchRatio(mockNotes);
      expect(result).toBe(0.25); // Only one unique pitch out of 4 notes
    });
  });

  describe("consecutivePitchesRatio", () => {
    it("should return 0.75 when all four notes in a four note melody have the same pitch as the preceding note", () => {
      const mockNotes = [
        { pitch: 60 },
        { pitch: 60 },
        { pitch: 60 },
        { pitch: 60 },
      ];
      const result = consecutivePitchesRatio(mockNotes);
      expect(result).toBe(0.75); // 3/4 = 0.75
    });

    it("should return 0 when no consecutive notes have the same pitch", () => {
      const mockNotes = [
        { pitch: 60 },
        { pitch: 61 },
        { pitch: 62 },
        { pitch: 63 },
      ];
      const result = consecutivePitchesRatio(mockNotes);
      expect(result).toBe(0);
    });
  });

  describe("uniqueRhythmRatio", () => {
    it("should return 1 when every note in the melody has a unique rhythm value", () => {
      const mockNotes = [
        { start: 0, end: 0.5 },
        { start: 0.5, end: 1.5 },
        { start: 1.5, end: 1.75 },
        { start: 1.75, end: 1.875 },
      ];
      const result = uniqueRhythmRatio(mockNotes);
      expect(result).toBe(1);
    });

    it("should return a value close to 0 when many notes have the same rhythm value", () => {
      const mockNotes = [
        { start: 0, end: 0.5 },
        { start: 0.5, end: 1 },
        { start: 1, end: 1.5 },
        { start: 1.5, end: 2 },
      ];
      const result = uniqueRhythmRatio(mockNotes);
      expect(result).toBe(0.25); // Only one unique rhythm value out of 4 notes
    });
  });

  describe("absoluteRating", () => {
    it("should return 1 when rating is equal to the sweetSpot", () => {
      const result = absoluteRating(0.8, 0.8);
      expect(result).toBe(1);
    });

    it("should return a value close to 0 when rating is far from the sweetSpot", () => {
      const result = absoluteRating(0, 0.8);
      expect(result).toBeCloseTo(0.2); // Absolute difference of 0.8 from the sweetSpot
    });
  });
});

describe("Motif Helper Functions", () => {
  describe("createMotifCollection", () => {
    const mockNotes = [
      { start: 0, end: 0.5, pitch: 60 },
      { start: 0.5, end: 1, pitch: 62 },
      { start: 1, end: 1.5, pitch: 64 },
      { start: 1.5, end: 2, pitch: 66 },
    ];

    it('should return pitch intervals for type "pitchIntervals"', () => {
      const result = createMotifCollection(mockNotes, "pitchIntervals");
      expect(result).toEqual([2, 2, 2]);
    });

    it('should return note durations for type "durations"', () => {
      const result = createMotifCollection(mockNotes, "durations");
      expect(result).toEqual([0.5, 0.5, 0.5, 0.5]);
    });

    it('should return pauses between notes for type "pauses"', () => {
      const result = createMotifCollection(mockNotes, "pauses");
      expect(result).toEqual([0, 0, 0]);
    });

    it("should return an empty array for an unrecognized type", () => {
      const result = createMotifCollection(mockNotes, "unrecognizedType");
      expect(result).toEqual([]);
    });
  });

  describe("createMotifCollectionDict", () => {
    it("should return a dictionary of sub-collections and their starting indices", () => {
      const mockCollection = [2, 2, 2, 3, 3, 2, 2];
      const result = createMotifCollectionDict(mockCollection);
      const expected = {
        "[2,2,2,3,3,2,2]": [0],
        "[2,2,2,3,3,2]": [0],
        "[2,2,2,3,3]": [0],
        "[2,2,2,3]": [0],
        "[2,2,2]": [0],
        "[2,2,3,3,2,2]": [1],
        "[2,2,3,3,2]": [1],
        "[2,2,3,3]": [1],
        "[2,2,3]": [1],
        "[2,2]": [0, 1, 5],
        "[2,3,3,2,2]": [2],
        "[2,3,3,2]": [2],
        "[2,3,3]": [2],
        "[2,3]": [2],
        "[3,2,2]": [4],
        "[3,2]": [4],
        "[3,3,2,2]": [3],
        "[3,3,2]": [3],
        "[3,3]": [3],
      };
      expect(result).toEqual(expected);
    });
  });

  describe("filterAndFormatMotifDict", () => {
    it("should filter and format a motif dictionary with mixed entries", () => {
      const mockDict = {
        "[2,2]": [0, 5],
        "[3,3]": [3],
        "[2,3]": [2, 7],
      };
      const result = filterAndFormatMotifDict(mockDict, "pitchIntervals");
      const expected = [
        { positions: [0, 5], pitchIntervals: [2, 2] },
        { positions: [2, 7], pitchIntervals: [2, 3] },
      ];
      expect(result).toEqual(expected);
    });

    it("should return an empty array for a motif dictionary with single position entries", () => {
      const mockDict = {
        "[2,2]": [0],
        "[3,3]": [3],
      };
      const result = filterAndFormatMotifDict(mockDict, "pitchIntervals");
      expect(result).toEqual([]);
    });
  });

  describe("postProcess", () => {
    it("should remove sub-collections and sort based on length", () => {
      const mockCollections = [
        { positions: [0, 5], pitchIntervals: [2, 2] },
        { positions: [2, 7], pitchIntervals: [2, 3, 2] },
        { positions: [1, 6], pitchIntervals: [2, 3] },
      ];
      const result = postProcess(mockCollections, "pitchIntervals");
      const expected = [
        { positions: [2, 7], pitchIntervals: [2, 3, 2] },
        { positions: [0, 5], pitchIntervals: [2, 2] },
      ];
      expect(result).toEqual(expected);
    });

    it("should filter out collections where all positions are consecutive", () => {
      const mockCollections = [
        { positions: [0, 1, 2], pitchIntervals: [2, 2, 2] },
        { positions: [3, 5], pitchIntervals: [3, 3] },
      ];
      const result = postProcess(mockCollections, "pitchIntervals");
      const expected = [{ positions: [3, 5], pitchIntervals: [3, 3] }];
      expect(result).toEqual(expected);
    });
  });
});
