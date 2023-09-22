<template>
  <div
    class="piano-roll"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <svg :height="height" :width="width">
      <rect
        v-for="note in notes"
        :key="note.id"
        :x="(note.start * width) / 8"
        :y="getNoteYPosition(note.pitch)"
        :width="((note.end - note.start) * width) / 8"
        :height="getNoteHeight()"
        fill="blue"
      />
    </svg>
  </div>
</template>

<script>
export default {
  props: {
    notes: {
      type: Array,
      required: true,
    },
    width: {
      type: Number,
      default: 290,
    },
    height: {
      type: Number,
      default: 140,
    },
  },
  watch: {
    notes(newNotes) {
      return newNotes;
    },
  },
  computed: {
    adjustedMinPitch() {
      // Calculate the minimum pitch in the melody.
      return Math.min(...this.notes.map((note) => note.pitch));
    },
    adjustedMaxPitch() {
      // Calculate the maximum pitch in the melody.
      return Math.max(...this.notes.map((note) => note.pitch));
    },
  },
  methods: {
    getNoteColor(pitch) {
      // Function to determine the color of each note.
      // We could use different colors for different pitch ranges.
      // For now, we will use a single color for all notes.
      if (pitch) {
        return "blue";
      }
    },
    getNoteYPosition(pitch) {
      // Calculate the Y position of each note rectangle based on its pitch.
      const pitchRange = this.adjustedMaxPitch - this.adjustedMinPitch + 1;
      const scalingFactor = this.height / pitchRange;
      return this.height - (pitch - this.adjustedMinPitch + 1) * scalingFactor;
    },
    getNoteHeight() {
      // Calculate the height of each note based on the scaling factor.
      const pitchRange = this.adjustedMaxPitch - this.adjustedMinPitch + 1;
      return this.height / pitchRange;
    },
  },
};
</script>

<style>
.piano-roll {
  padding: 5px;
}
</style>
