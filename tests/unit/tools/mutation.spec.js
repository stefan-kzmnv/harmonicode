import {
  mutate,
  mutateAlterPitches,
  mutateMoveNotes,
  mutateCopyPasteBeats,
  mutateAddOrRemoveNotes,
} from "@/tools/mutation";

describe("Mutation Functions", () => {
  describe("mutate", () => {
    it("should generate 10 mutated melodies for 2 incoming melodies", () => {
      const mockIncomingMelodies = {
        1: [
          { start: 0, end: 1, pitch: 60 },
          { start: 0, end: 1, pitch: 62 },
          { start: 0, end: 1, pitch: 67 },
          { start: 0, end: 1, pitch: 71 },
        ],
        2: [
          { start: 0, end: 1, pitch: 62 },
          { start: 0, end: 1, pitch: 65 },
          { start: 0, end: 1, pitch: 60 },
          { start: 0, end: 1, pitch: 69 },
        ],
      };
      const mockSelectedScaleNotes = [60, 62, 64, 65, 67, 69, 71];
      const mockMutationParameters = {
        alterPitchesProbability: 0.5,
        moveNotesProbability: 0.5,
        copyPasteBeatProbability: 0.5,
        addOrRemoveNotesProbability: 0.5,
      };
      const result = mutate(
        mockIncomingMelodies,
        mockSelectedScaleNotes,
        mockMutationParameters
      );
      expect(Object.keys(result).length).toBe(10);
    });
  });

  describe("mutateAlterPitches", () => {
    it("should alter all pitches with probability 1", () => {
      const mockNotes = [{ start: 0, end: 1, pitch: 60 }];
      const mockScale = [60, 62, 64, 65, 67, 69, 71];
      const result = mutateAlterPitches(mockNotes, mockScale, 1);
      expect(result[0].pitch).not.toBe(60);
    });

    it("should not alter any pitches with probability 0", () => {
      const mockNotes = [{ start: 0, end: 1, pitch: 60 }];
      const mockScale = [60, 62, 64, 65, 67, 69, 71];
      const result = mutateAlterPitches(mockNotes, mockScale, 0);
      expect(result[0].pitch).toBe(60);
    });
  });

  describe("mutateMoveNotes", () => {
    it("should move all notes with probability 1", () => {
      const mockNotes = [
        { start: 0, end: 0.125, pitch: 60 },
        { start: 10, end: 10.125, pitch: 60 },
      ];
      const result = mutateMoveNotes(mockNotes, 1);
      expect(result[0].start).not.toBe(0);
      expect(result[0].end).not.toBe(0.125);
      expect(result[1].start).not.toBe(10);
      expect(result[1].end).not.toBe(10.125);
    });

    it("should not move any notes with probability 0", () => {
      const mockNotes = [{ start: 0, end: 1, pitch: 60 }];
      const result = mutateMoveNotes(mockNotes, 0);
      expect(result[0].start).toBe(0);
      expect(result[0].end).toBe(1);
    });
  });

  describe("mutateCopyPasteBeats", () => {
    it("should copy and paste beats with probability 1", () => {
      const mockNotes = [
        { start: 0, end: 1, pitch: 60 },
        { start: 1, end: 2, pitch: 62 },
      ];
      const result = mutateCopyPasteBeats(mockNotes, 1);
      expect(result).not.toEqual(mockNotes);
    });

    it("should not copy and paste beats with probability 0", () => {
      const mockNotes = [{ start: 0, end: 1, pitch: 60 }];
      const result = mutateCopyPasteBeats(mockNotes, 0);
      expect(result).toEqual(mockNotes);
    });
  });

  describe("mutateAddOrRemoveNotes", () => {
    // This first test should run a few times, because there is inherent randomness
    // within this function. We can then check if some cases are correct.
    it("should add or remove notes with probability 1", () => {
      const mockNotes = [
        { start: 0, end: 1, pitch: 60 },
        { start: 1, end: 2, pitch: 62 },
        { start: 2, end: 3, pitch: 64 },
        { start: 3, end: 4, pitch: 65 },
      ];
      const mockMelodyKey = [60, 62, 64, 65, 67, 69, 71];

      const numberOfRuns = 100; // Number of times to run the function.
      let mutationCount = 0;

      for (let i = 0; i < numberOfRuns; i++) {
        const result = mutateAddOrRemoveNotes(mockNotes, mockMelodyKey, 1);
        if (result.length !== mockNotes.length) {
          mutationCount++;
        }
      }

      // Check if mutations indeed occurred in some cases.
      expect(mutationCount).toBeGreaterThan(numberOfRuns / 4);
    });

    it("should not add or remove notes with probability 0", () => {
      const mockNotes = [{ start: 0, end: 1, pitch: 60 }];
      const mockMelodyKey = [60, 62, 64, 65, 67, 69, 71];
      const result = mutateAddOrRemoveNotes(mockNotes, mockMelodyKey, 0);
      expect(result).toEqual(mockNotes);
    });
  });
});
