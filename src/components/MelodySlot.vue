<template>
  <div class="slot-container">
    <div v-if="!notes" class="empty-slot">
      <div>Melody Slot #1</div>
    </div>
    <div
      v-else
      class="melody-slot"
      :class="selected ? 'selected' : ''"
      @click="toggleSelectMelody"
    >
      <SmallPianoRoll :notes="notes" />
    </div>
    <div class="slot-controls">
      <div class="button-row">
        <input
          ref="uploadInput"
          type="file"
          @change="processFile($event)"
          v-show="false"
        />
        <button @click="playMelody">
          <img src="@/assets/play.svg" alt="" />
        </button>
        <button @click="stopMelody">
          <img src="@/assets/square.svg" alt="" />
        </button>
        <button @click="downloadMIDI">
          <img src="@/assets/download.svg" alt="" />
        </button>
        <button v-if="enableGeneration" @click="generateMelody">
          <img src="@/assets/tool.svg" alt="" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Midi } from "@tonejs/midi";
import { mapState, mapActions } from "vuex";
import SmallPianoRoll from "@/components/SmallPianoRoll.vue";

export default {
  components: {
    SmallPianoRoll,
  },
  props: {
    generationID: {
      type: String,
      required: true,
    },
    ID: {
      type: String,
      required: true,
    },
    enableGeneration: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      audioContext: new (window.AudioContext || window.webkitAudioContext)(),
      activeNotes: [],
    };
  },
  computed: {
    ...mapState({
      // Gets the melody with the proper ID from the generations object.
      notes(state) {
        return state.generations[this.generationID]
          ? state.generations[this.generationID][this.ID]
          : undefined;
      },
      // Check if this particular melody in its generation has been selected.
      selected(state) {
        if (
          state.selectedMelodies[this.generationID] &&
          state.selectedMelodies[this.generationID].indexOf(this.ID) !== -1
        ) {
          return true;
        }
        return false;
      },
    }),
  },
  // https://stackoverflow.com/questions/47313165/how-to-reference-static-assets-within-vue-javascript
  // https://theremin.music.uiowa.edu/MISpiano.html
  // https://sound.stackexchange.com/questions/22769/are-there-free-records-of-separate-piano-notes-in-wav-files-for-instance
  // ffmpeg -i Piano.ff.Gb7.aiff -af loudnorm,silenceremove=start_periods=1:start_silence=0.05:start_threshold=-40dB,afade=out:st=3:d=1.5,afade=in:st=0:d=0.05 -to 4.5 out.m4a
  // https://www.npmjs.com/package/webaudiofont
  // It seems aiff is just not supported, convert to m4a.

  // https://www.schoolofcomposition.com/what-is-tension-and-release-in-music/
  // https://www.youtube.com/watch?v=hXeX031w-6Q
  methods: {
    ...mapActions(["generateNewMelody"]),
    generateMelody() {
      this.generateNewMelody({
        melodyGenerationID: this.generationID,
        melodyID: this.ID,
      });
    },
    midiToNoteName(midi) {
      const notes = [
        "C",
        "Db",
        "D",
        "Eb",
        "E",
        "F",
        "Gb",
        "G",
        "Ab",
        "A",
        "Bb",
        "B",
      ];
      const octave = Math.floor(midi / 12) - 1;
      const noteIndex = midi % 12;
      return notes[noteIndex] + octave;
    },
    async playNote(note, start, end) {
      // Convert the pitches to note names to be able to play
      // the appropriate sample files for each note.
      const noteName = this.midiToNoteName(note.pitch);
      const soundURL = `piano_note_samples/Piano.mf.${noteName}.m4a`;

      // Fetch the sample from the URL.
      const response = await fetch(soundURL);
      // Convert the fetched audio response to an array buffer.
      const arrayBuffer = await response.arrayBuffer();
      // Decode the array buffer to get the audio data.
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Create a new audio source from the decoded audio data.
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create a gainNode for volume control and
      // connect the source to the gainNode.
      const gainNode = this.audioContext.createGain();
      source.connect(gainNode);

      // Create a ConvolverNode to apply a reverb effect.
      const convolver = this.audioContext.createConvolver();
      // Load the impulse response file.
      // The method for this is further below.
      convolver.buffer = await this.loadImpulseResponse();

      // Create separate gainNodes for the dry and wet signals.
      const dryGain = this.audioContext.createGain();
      const wetGain = this.audioContext.createGain();

      // Set the gain values.
      dryGain.gain.value = 0.5; // Higher value means more direct signal.
      wetGain.gain.value = 0.5; // Higher value means more reverb.

      // Connect the nodes, including the convolver node.
      gainNode.connect(dryGain);
      gainNode.connect(convolver);
      convolver.connect(wetGain);

      // Connect both dry and wet gains to the audio output.
      dryGain.connect(this.audioContext.destination);
      wetGain.connect(this.audioContext.destination);

      // Start the note and push it to the activeNotes array.
      // This is to enable us to stop all notes at the same time.
      source.start(this.audioContext.currentTime + start);
      this.activeNotes.push(source);

      // Set a short fade-out effect to prevent the clipping of sound when notes end.
      const fadeOutDuration = 0.03;
      gainNode.gain.setValueAtTime(
        1,
        this.audioContext.currentTime + end - fadeOutDuration
      );
      gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + end
      );

      // Stop a note after its duration.
      source.stop(this.audioContext.currentTime + end);
      // Once a note has ended, remove it from the activeNotes array.
      source.onended = () => {
        const index = this.activeNotes.indexOf(source);
        if (index > -1) {
          this.activeNotes.splice(index, 1);
        }
      };
    },
    playMelody() {
      // Method that plays each note one by one at its appropriate time.
      this.notes.forEach((note) => {
        this.playNote(note, note.start, note.end);
      });
    },
    stopMelody() {
      // Method to stop all notes from a melody by emptying the activeNotes array.
      this.activeNotes.forEach((note) => {
        try {
          note.stop();
        } catch (error) {
          // Log any errors that might occur when stopping the note.
          console.error("Error stopping note:", error);
        }
      });
      // Clear the activeNotes array.
      this.activeNotes = [];
    },
    async loadImpulseResponse() {
      // Load the impulse response file to create some reverb.
      const irURL = "big_hall_E001_M2S.wav";
      const response = await fetch(irURL);
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arrayBuffer);
    },
    toggleSelectMelody() {
      if (!this.selected) {
        this.$store.dispatch("selectMelody", {
          generationID: this.generationID,
          ID: this.ID,
        });
      } else {
        this.$store.dispatch("deselectMelody", {
          generationID: this.generationID,
          ID: this.ID,
        });
      }
    },
    downloadMIDI() {
      if (this.notes) {
        const midi = new Midi();

        // Create a track.
        const track = midi.addTrack();

        // Sample notes array.
        const notesArray = this.notes;

        // Add notes to the track.
        notesArray.forEach((note) => {
          track.addNote({
            midi: note.pitch,
            time: note.start,
            duration: note.end - note.start,
            velocity: note.velocity / 127,
          });
        });

        // Convert the MIDI instance to a binary blob.
        const blob = new Blob([new Uint8Array(midi.toArray())], {
          type: "audio/midi",
        });

        // Create a link element to download the blob, click it,
        // and then remove it after download has started.
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "output.mid";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.slot-container {
  width: 300px;
  height: 150px;
  margin: 0 20px 60px 0;
  position: relative;
}
.empty-slot {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: #fff;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  z-index: 10;
}
.slot-controls {
  width: 100%;
  padding-top: 5px;
  position: relative;
  top: -5px;
  display: flex;
  justify-content: center;
  background-color: #333;
  border-radius: 0 0 10px 10px;

  .button-row {
    display: flex;
  }

  button,
  a {
    position: relative;
    padding: 4px 6px 4px 6px;
    display: flex;
    align-items: center;
    color: #fff;
    background-color: #444;
    border: 0;
    cursor: pointer;

    &:hover {
      transform: scale(95%);
    }
  }
}
.melody-slot {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #fff;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  cursor: pointer;
  z-index: 10;
}
.selected {
  box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.5);
  border: 3px solid green;
  top: -3px;
  left: -3px;

  + .slot-controls {
    top: -11px;
  }
}
</style>
