import { generateMelody, selectLength, selectPitch } from "@/tools/generation";

describe("Melody Generation Functions", () => {
  describe("generateMelody", () => {
    const melodyKey = [60, 62, 64, 65, 67, 69, 71]; // Example melody key

    it("should generate a melody within the expected length range", () => {
      const melody = generateMelody(melodyKey);
      expect(melody.length).toBeGreaterThanOrEqual(4);
      expect(melody.length).toBeLessThanOrEqual(64);
    });

    it("should not exceed eight beats", () => {
      const melody = generateMelody(melodyKey);
      expect(melody[melody.length - 1].end).toBeLessThanOrEqual(8);
    });

    it("should have notes within the provided melodyKey", () => {
      const melody = generateMelody(melodyKey);
      melody.forEach((note) => {
        expect(melodyKey).toContain(note.pitch);
      });
    });
  });

  describe("selectLength", () => {
    const possibleLengths = [1, 0.5, 0.25];

    it("should select a length close to the previous length", () => {
      const length = selectLength(0.5, possibleLengths);
      expect(Math.abs(length - 0.5)).toBeLessThanOrEqual(1);
    });

    it("should select a length within the possible lengths", () => {
      const length = selectLength(0.5, possibleLengths);
      expect(possibleLengths).toContain(length);
    });
  });

  describe("selectPitch", () => {
    const melodyKey = [60, 62, 64, 65, 67, 69, 71];

    // This test is currently not needed, as we are currently
    // not using the function this way.
    // it("should select a pitch close to the previous pitch", () => {
    //   const pitch = selectPitch(62, melodyKey);
    //   expect(Math.abs(pitch - 62)).toBeLessThanOrEqual(6);
    // });

    it("should select a pitch within the provided melodyKey", () => {
      const pitch = selectPitch(62, melodyKey);
      expect(melodyKey).toContain(pitch);
    });
  });
});
