<template>
  <div class="generation">
    <h1>This is generation {{ generationID }}</h1>
    <div class="instructions">
      <p>
        On this page, you can select the two melodies which will become the
        parents of the next generation. Select a melody by clicking on its box.
      </p>
      <p>
        You can also skip generation iterations, whereby the algorithm will
        automatically select the two melodies that have the best fitness,
        according to the settings you have chosen in the
        <b>"Settings"</b> window.
      </p>
      <p>
        Use the buttons below the melody slots to play, stop, download, or
        generate a melody.
      </p>
      <p>
        To continue the evolution with your selection of melodies, click the "<b
          >Evolve once!</b
        >" button. To skip generations, put the number of desired generations to
        skip in the input field below and click "<b>Skip</b>". You can skip
        between 1 and 50 generations at once.
      </p>
      <div v-if="latestGeneration" class="button-row">
        <button class="evolve" @click="evolve">Evolve once!</button>
        <div class="input-box">
          <input
            class="skip-input"
            type="text"
            v-model="skipGensInput"
            @keydown="validateInput($event)"
            placeholder="1 to 50"
          />
          <button class="evolve" @click="skipGens">Skip!</button>
        </div>
      </div>
      <div v-else class="button-row warning">
        <p>
          Continue evolution from the latest generation. This generation has
          been locked.
        </p>
      </div>
      <div v-if="noSelectedMelodiesWarning" class="warning">
        You must select two melodies to proceed with.
      </div>
    </div>
    <div class="melody-slots-container">
      <MelodySlot
        v-for="(melody, melody_id) in generation"
        :key="melody.id"
        :generationID="generationID"
        :ID="melody_id"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import MelodySlot from "@/components/MelodySlot.vue";

export default {
  name: "GenerationOfMelodies",
  components: {
    MelodySlot,
  },
  props: {
    generationID: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      skipGensInput: "",
      noSelectedMelodiesWarning: false,
    };
  },
  computed: {
    ...mapState({
      // Gets the melody with the proper ID from the generations object.
      generation(state) {
        return state.generations[this.generationID]
          ? state.generations[this.generationID]
          : undefined;
      },
      selectedMelodies(state) {
        return state.selectedMelodies;
      },
      latestGeneration(state) {
        return (
          Object.keys(state.generations)
            .sort((a, b) => a - b)
            .pop() === this.generationID
        );
      },
    }),
  },
  methods: {
    validateInput(event) {
      const value = event.target.value;
      const key = event.key;
      // Allowed keys: Backspace, End, Home, Left, Up, Right, Down, Delete.
      const additionalValidKeys = [8, 35, 36, 37, 38, 39, 40, 46, 13, 108];

      // Prevent default behavior if the user is trying to type "0"
      // as their first character, if they're trying to type a third
      // character, or if the key is not a number or one of the allowed.
      if (
        (value.length === 0 && key === "0") ||
        (value.length >= 2 && key.match(/[0-9]/)) ||
        (!additionalValidKeys.includes(event.keyCode) && !key.match(/[0-9]/))
      ) {
        event.preventDefault();
      }

      if (event.key === "Enter") {
        if (this.skipGensInput) {
          this.skipGens();
        }
      }
    },
    async evolve() {
      if (
        !this.selectedMelodies[this.generationID] ||
        this.selectedMelodies[this.generationID].length != 2
      ) {
        this.noSelectedMelodiesWarning = true;
      } else {
        this.noSelectedMelodiesWarning = false;
        await this.$store.dispatch("mutateLatestGeneration", {
          generationID: this.generationID,
          melodyIDs: Object.values(this.selectedMelodies[this.generationID]),
        });
      }
    },
    async skipGens() {
      await this.$store.dispatch("skipGenerations", {
        generationID: this.generationID,
        generationsToSkip: this.skipGensInput,
      });
    },
  },
  watch: {
    skipGensInput(newVal) {
      // If the user tries to type a number larger than 50
      // or smaller than 0, default to 50 or 0, respectively.
      if (Number(newVal) > 50) {
        this.skipGensInput = 50;
      } else if (Number(newVal) < 0) {
        this.skipGensInput = 0;
      }
    },
  },
};
</script>

<style scoped>
.generation {
  min-height: 100vh;
  margin: 50px 0 0 30px;
  text-align: left;
}
.instructions {
  max-width: 620px;
  padding-bottom: 20px;

  .button-row {
    display: flex;
    justify-content: space-between;

    .skip-input {
      width: 50px;
      margin-right: 10px;
      padding: 12px 12px;
      font-size: 16px;
      border: none;
      border-radius: 10px;
      box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.5);
      outline: none;
    }
  }

  .evolve {
    position: relative;
    display: inline-block;
    padding: 12px 48px;
    margin: 5px 0 10px 0;
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    background-image: linear-gradient(to bottom, #ff7d50, #ff4f70);
    box-shadow: 1px 1px 1px 0px rgba(0, 0, 0, 0.5);

    &:hover {
      top: 1px;
      left: 1px;
      background-image: linear-gradient(to bottom, #ff4f70, #ff7d50);
      box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.5);
    }
  }
}

.warning {
  color: red;
}

.melody-slots-container {
  display: flex;
  flex-wrap: wrap;
  max-width: 1600px;
}
</style>
