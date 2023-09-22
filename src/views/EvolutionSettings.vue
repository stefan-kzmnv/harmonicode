<template>
  <div class="settings">
    <h1>Settings</h1>
    <h3>Key</h3>
    <div class="select-container">
      <select class="select-input" v-model="selectedScaleInternal">
        <option
          v-for="displayName in scaleDisplayNames"
          :key="displayName"
          :value="scaleNameToInternal(displayName)"
        >
          {{ displayName }}
        </option>
      </select>
    </div>
    <h3>Fitness parameters</h3>
    <div
      class="input-row"
      v-for="(value, key) in desiredFitnessParameters"
      :key="key"
    >
      <label :for="key">{{ formatKey(key) }}</label>
      <div class="input-container">
        <input
          class="settings-input"
          :id="key"
          type="text"
          :value="value"
          @input="processValue(key, $event)"
          @keydown="preventInvalidCharacters($event)"
        />
        <button class="adjust-input" @click="adjustValue(key, -0.001)">
          -
        </button>
        <button class="adjust-input" @click="adjustValue(key, 0.001)">+</button>
      </div>
    </div>
    <h3>Evolution parameters</h3>
    <div
      class="input-row"
      v-for="(value, key) in desiredMutationParameters"
      :key="key"
    >
      <label :for="key">{{ formatKey(key) }}</label>
      <div class="input-container">
        <input
          class="settings-input"
          :id="key"
          type="text"
          :value="value"
          @input="processValue(key, $event)"
          @keydown="preventInvalidCharacters($event)"
        />
        <button class="adjust-input" @click="adjustValue(key, -0.001)">
          -
        </button>
        <button class="adjust-input" @click="adjustValue(key, 0.001)">+</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { scaleNamesToInternalEnum } from "@/tools/keys";

export default {
  data() {
    return {
      selectedScaleInternal: "CMajor", // Default selected scale (internal name)
      keyMapping: {
        fitnessParameters: {
          extremePitchDifference: "Extreme Pitch Difference",
          directionOfMelody: "Direction of Melody",
          directionalChangesRatio: "Directional Changes Ratio",
          offBeatNotesRatio: "Off-Beat Notes Ratio",
          lowestToHighestPitchRatio: "Lowest to Highest Pitch Ratio",
          uniquePitchRatio: "Unique Pitch Ratio",
          consecutivePitchesRatio: "Consecutive Pitches Ratio",
          uniqueRhythmRatio: "Unique Rhythm Ratio",
        },
        mutationParameters: {
          alterPitchesProbability: "Probability to Alter the Pitch of a Note",
          moveNotesProbability: "Probability to Move a Note",
          copyPasteBeatProbability:
            "Probability to Replace a Beat with Another Beat",
          addOrRemoveNotesProbability: "Probability to Add or Remove Notes",
        },
      },
    };
  },
  computed: {
    ...mapGetters([
      "selectedKey",
      "desiredFitnessParameters",
      "desiredMutationParameters",
    ]),
    scaleDisplayNames() {
      return Object.keys(scaleNamesToInternalEnum);
    },
  },
  methods: {
    ...mapActions([
      "updateKey",
      "updateDesiredFitnessParameters",
      "updateDesiredMutationParameters",
    ]),
    scaleNameToInternal(displayName) {
      return scaleNamesToInternalEnum[displayName];
    },
    formatKey(incomingKey) {
      if (incomingKey in this.desiredFitnessParameters) {
        return this.keyMapping.fitnessParameters[incomingKey] || incomingKey;
      } else if (incomingKey in this.desiredMutationParameters) {
        return this.keyMapping.mutationParameters[incomingKey] || incomingKey;
      }
    },
    processValue(key, event) {
      let value = event.target.value;

      // If the value is "0.", allow it as an intermediate state.
      if (value === "0.") {
        return;
      }

      // Check for more than three digits after the decimal point.
      const parts = value.split(".");
      if (parts[1] && parts[1].length > 3) {
        value = parts[0] + "." + parts[1].substr(0, 3);
        event.target.value = value;
      }

      // Cast the value to float.
      const floatValue = parseFloat(value);

      // Check if value is NaN, contains 'e', or is out of range.
      if (
        isNaN(floatValue) ||
        value.includes("e") ||
        value.includes("E") ||
        floatValue < 0 ||
        floatValue > 1
      ) {
        // Reset the value to the last valid value from the Vuex state.
        if (key in this.desiredFitnessParameters) {
          event.target.value = this.desiredFitnessParameters[key] || "0";
        } else if (key in this.desiredMutationParameters) {
          event.target.value = this.desiredMutationParameters[key] || "0";
        }
      } else {
        // Update the Vuex state with the valid value.
        this.updateParameters(key, floatValue);
      }
    },
    preventInvalidCharacters(event) {
      const value = event.target.value;
      const key = event.key;

      const invalidChars = ["e", "E", "+", "-"];

      // If the key is an invalid character, prevent pressing.
      if (invalidChars.includes(key)) {
        event.preventDefault();
      }

      // If the value is "0" and the key is not "." or a number, prevent pressing.
      if (value === "0" && key !== "." && !key.match(/[0-9]/)) {
        event.preventDefault();
      }
    },
    adjustValue(key, adjustment) {
      // First, take the current value from the store, or 0.
      let currentValue;
      if (key in this.desiredFitnessParameters) {
        currentValue = parseFloat(this.desiredFitnessParameters[key] || 0);
      } else if (key in this.desiredMutationParameters) {
        currentValue = parseFloat(this.desiredMutationParameters[key] || 0);
      }
      // Set a new value to equal the latest valid value plus the incoming
      // value, rounded to three decimal values.
      let newValue = (currentValue + adjustment).toFixed(3);

      // Ensure the value remains within the range [0, 1].
      if (newValue < 0) {
        newValue = 0;
      } else if (newValue > 1) {
        newValue = 1;
      }

      this.updateParameters(key, parseFloat(newValue));
    },
    updateParameters(key, value) {
      if (key in this.desiredFitnessParameters) {
        this.updateDesiredFitnessParameters({ key, value });
      } else if (key in this.desiredMutationParameters) {
        this.updateDesiredMutationParameters({ key, value });
      }
    },
  },
  watch: {
    selectedScaleInternal(newScaleInternal) {
      this.updateKey(newScaleInternal);
    },
  },
};
</script>

<style scoped>
.settings {
  width: 620px;
  min-height: 100vh;
  margin: 50px 0 50px 30px;
  text-align: left;

  .select-container {
    position: relative;
    width: 100%;
    margin-bottom: 10px;

    .select-input {
      width: 100%;
      padding: 16px 15px 15px 10px;
      border: none;
      border-radius: 10px;
      appearance: none;
      outline: none;
      background: linear-gradient(145deg, #f0f0f0, #c4c4c4);
      box-shadow: 1px 1px 1px #b8b8b8, -5px -5px 10px #ffffff;
      font-size: 16px;
      color: #333;
      cursor: pointer;

      &:hover {
        box-shadow: inset 1px 1px 3px #b8b8b8, -5px -5px 10px #ffffff;
        background: linear-gradient(145deg, #c4c4c4, #f0f0f0);
      }

      &:focus {
        background: linear-gradient(145deg, #e0e0e0, #d4d4d4);
      }
    }

    /* Arrow styling for the select element */
    &::after {
      content: "▼";
      position: absolute;
      top: 50%;
      right: 15px;
      transform: translateY(-50%);
      color: #666;
      pointer-events: none; /* Pass click events through */
    }
  }

  .input-row {
    margin-bottom: 10px;
    padding: 3px 4px 3px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #dbfff8;
    border-radius: 10px;

    .input-container {
      .settings-input {
        width: 50px;
        margin-right: 15px;
        padding: 12px 12px;
        font-size: 16px;
        border: none;
        border-radius: 10px;
        box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.5);
        outline: none;
      }

      .adjust-input {
        position: relative;
        width: 42px;
        height: 42px;
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        border: none;
        border-radius: 10px;
        background-image: linear-gradient(to bottom, #ff7d50, #ff4f70);
        box-shadow: 1px 1px 1px 0px rgba(0, 0, 0, 0.5);

        &:hover {
          top: 1px;
          left: 1px;
          background-image: linear-gradient(to bottom, #ff4f70, #ff7d50);
          box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.5);
          cursor: pointer;
        }

        &:last-child {
          margin-left: 5px;
        }
      }
    }
  }
}
</style>
