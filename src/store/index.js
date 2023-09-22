import { createStore } from "vuex";
import { generateMelody } from "@/tools/generation";
import { mutate } from "@/tools/mutation.js";
import { scales } from "@/tools/keys";
import { rateMelodies } from "@/tools/rating";

export default createStore({
  state: {
    settings: {
      key: "CMajor", // Default key.
      desiredFitnessParameters: {
        extremePitchDifference: 0.1,
        directionOfMelody: 0.5,
        directionalChangesRatio: 0.2,
        offBeatNotesRatio: 0.4,
        lowestToHighestPitchRatio: 0.72,
        uniquePitchRatio: 0.4,
        consecutivePitchesRatio: 0.3,
        uniqueRhythmRatio: 0.3,
      },
      desiredMutationParameters: {
        alterPitchesProbability: 0.1,
        moveNotesProbability: 0.1,
        copyPasteBeatProbability: 0.1,
        addOrRemoveNotesProbability: 0.1,
      },
    },
    generations: {},
    selectedMelodies: {},
    ratingsForMelodies: {},
  },
  getters: {
    selectedKey: (state) => state.settings.key,
    selectedScaleNotes: (state) => {
      return scales[state.settings.key];
    },
    desiredFitnessParameters: (state) =>
      state.settings.desiredFitnessParameters,
    desiredMutationParameters: (state) =>
      state.settings.desiredMutationParameters,
  },
  mutations: {
    setKey(state, newKey) {
      state.settings.key = newKey;
    },
    setDesiredFitnessParameters(state, payload) {
      state.settings.desiredFitnessParameters = {
        ...state.settings.desiredFitnessParameters,
        [payload.key]: payload.value,
      };
    },
    setDesiredMutationParameters(state, payload) {
      state.settings.desiredMutationParameters = {
        ...state.settings.desiredMutationParameters,
        [payload.key]: payload.value,
      };
    },
    updateGenerations(state, { generationID, ID, notes }) {
      if (!state.generations[generationID]) {
        state.generations = {
          ...state.generations,
          [generationID]: {},
        };
      }
      // payload should be an object with three properties: generation, ID and notes
      state.generations[generationID][ID] = notes;
    },
    updateRatings(state, { generationID, ID, ratings }) {
      // console.log(ratings);
      if (!state.ratingsForMelodies[generationID]) {
        state.ratingsForMelodies = {
          ...state.ratingsForMelodies,
          [generationID]: {},
        };
      }
      // payload should be an object with three properties: generation, ID and ratings
      state.ratingsForMelodies[generationID][ID] = ratings;
    },
    addMelodyIDToSelectedMelodies(state, { generationID, ID }) {
      state.selectedMelodies[generationID].push(ID);
    },
    removeMelodyIDFromSelectedMelodies(state, { generationID, IDindex }) {
      state.selectedMelodies[generationID].splice(IDindex, 1);
    },
    addNewGeneractionOfSelectedMelodies(state, generationID) {
      state.selectedMelodies = {
        ...state.selectedMelodies,
        [generationID]: [],
      };
    },
  },
  actions: {
    updateKey({ commit }, newKey) {
      commit("setKey", newKey);
    },
    updateDesiredFitnessParameters({ commit }, payload) {
      commit("setDesiredFitnessParameters", payload);
    },
    updateDesiredMutationParameters({ commit }, payload) {
      commit("setDesiredMutationParameters", payload);
    },
    generateNewMelody({ commit, getters }, { melodyGenerationID, melodyID }) {
      const melody = generateMelody(getters.selectedScaleNotes);

      commit("updateGenerations", {
        generationID: melodyGenerationID,
        ID: melodyID,
        notes: melody,
      });
    },
    mutateLatestGeneration(
      { state, getters, commit },
      { generationID, melodyIDs }
    ) {
      // The function name refers to mutation as part of evolution, not to Vuex mutations.
      // Get the proper generationID from the state.
      const generation = state.generations[generationID];
      // Get what the next generationID should be.
      const nextGenerationID = Number(generationID) + 1;
      const melodies = {};

      // Get the melodies from the current generation into the melodies object.
      for (const currentMelody of melodyIDs) {
        const melody = generation[currentMelody];
        melodies[currentMelody] = melody;
      }

      // Perform mutation on the melodies. The function works with an entire generation.
      const mutatedMelodies = mutate(
        melodies,
        getters.selectedScaleNotes,
        getters.desiredMutationParameters
      );
      // Calculate the fitness ratings of the new melodies.
      // This function also works with an entire generation.
      const melodiesRatings = rateMelodies(
        mutatedMelodies,
        state.settings.desiredFitnessParameters
      );

      // Update the generations and ratings objects in the state.
      for (const [ID, melody] of Object.entries(mutatedMelodies)) {
        commit("updateGenerations", {
          generationID: nextGenerationID,
          ID: ID,
          notes: melody,
        });
      }
      for (const [ID, ratings] of Object.entries(melodiesRatings)) {
        commit("updateRatings", {
          generationID: nextGenerationID,
          ID: ID,
          ratings: ratings,
        });
      }

      // Return the mutated generation.
      return mutatedMelodies;
    },
    skipGenerations(
      { state, getters, commit },
      { generationID, generationsToSkip }
    ) {
      // Get the last generation of melodies.
      const lastGen = state.generations[generationID];
      // Get its melody ratings.
      const lastGenerationIndividualRatings =
        state.ratingsForMelodies[generationID];

      // Create two objects that will hold the intermediary generations
      // and their ratings. They will not be returned anywhere and hence,
      // will be "skipped". JS will disassemble them with the rest of the
      // scope context, after the function finishes execution.
      let intermediateGens = {};
      let intermediateGensRatings = {};

      // The last generation in the state will become the zeroth
      // intermediate generation. Its ratings will become the zeroth ratings.
      intermediateGens["0"] = lastGen;
      intermediateGensRatings["0"] = lastGenerationIndividualRatings;

      // The automated evolution will skip as many generations
      // as the user has typed in, hence we will use the loop below.
      for (let i = 0; i < generationsToSkip; i++) {
        // We need to create an empty object that will hold the aggregate ratings
        // for the generation we are attempting to mutate further, which will
        // always be the last one.
        const lastGenerationAggregateRatings = {};

        // With the inner loop below we are calculating the aggregate ratings for
        // each of the melodies in the generation we are mutating. Then we are
        // inserting the individual ratings into the lastGenerationAggregateRatings object.
        for (let ratingsForASingleMelody in intermediateGensRatings[i]) {
          let ratingAggregate = 0;

          for (let rating in intermediateGensRatings[i][
            ratingsForASingleMelody
          ]) {
            ratingAggregate +=
              intermediateGensRatings[i][ratingsForASingleMelody][rating];
          }

          lastGenerationAggregateRatings[ratingsForASingleMelody] = {
            ratingAggregate,
          };
        }

        // Using the keys of the lastGenerationAggregateRatings object, create an array
        // of melodyIDs, so that we can later refer to the correct melody in a generation.
        const melodyIDs = Object.keys(lastGenerationAggregateRatings);
        // Sort the melodyIDs based on their ratingAggregate values in descending order.
        melodyIDs.sort(
          (a, b) =>
            lastGenerationAggregateRatings[b].ratingAggregate -
            lastGenerationAggregateRatings[a].ratingAggregate
        );

        // Extract the first two melodyIDs from the sorted array, which will have the
        // highest ratings. This is a good method, because it automatically handles
        // melodies with equal ratings and we do not need to worry about having more
        // than 2 melodies with the same top ratings.
        const topTwoMelodyIDs = [melodyIDs[0], melodyIDs[1]];

        // Next, we get the ID of the current generation and the generation to-be.
        // The process from here on out is very similar to the user-controlled evolution.
        const genToMutate = intermediateGens[i];
        const nextGenKey = i + 1;
        const melodies = {};

        // Get the melodies from the generation to mutate into the melodies object.
        for (const currentMelody of topTwoMelodyIDs) {
          const melody = genToMutate[currentMelody];
          melodies[currentMelody] = melody;
        }

        // Perform mutation on the melodies. The function works with an entire generation.
        const mutatedMelodies = mutate(
          melodies,
          getters.selectedScaleNotes,
          getters.desiredMutationParameters
        );
        // Calculate the fitness ratings of the new melodies.
        // This function also works with an entire generation.
        const melodiesRatings = rateMelodies(
          mutatedMelodies,
          state.settings.desiredFitnessParameters
        );

        for (const [ID, melody] of Object.entries(mutatedMelodies)) {
          // Looping over the mutated melodies, check if this is the final
          // intermediate generation and if it is, update the state to include it.
          if (i + 1 == generationsToSkip) {
            commit("updateGenerations", {
              generationID: Number(generationID) + 1,
              ID: ID,
              notes: melody,
            });
          } else {
            // If this is not the final intermediate generation,
            // check if the ID of the next generation exists. If it does not,
            // create it and add the melody to it. If it does, just add the melody.
            if (!intermediateGens[nextGenKey]) {
              intermediateGens = {
                ...intermediateGens,
                [nextGenKey]: {},
              };
            }
            intermediateGens[nextGenKey][ID] = melody;
          }
        }
        for (const [ID, ratings] of Object.entries(melodiesRatings)) {
          // Looping over the ratings of the mutated melodies, check if this is the final
          // intermediate generation and if it is, update the state to include its ratings.
          if (i + 1 == generationsToSkip) {
            commit("updateRatings", {
              generationID: Number(generationID) + 1,
              ID: ID,
              ratings: ratings,
            });
          } else {
            // If this is not the final intermediate generation,
            // check if the ID of the next generation's ratings exists. If it does not,
            // create it and add the rating to it. If it does, just add the ratings.
            if (!intermediateGensRatings[nextGenKey]) {
              intermediateGensRatings = {
                ...intermediateGensRatings,
                [nextGenKey]: {},
              };
            }
            intermediateGensRatings[nextGenKey][ID] = ratings;
          }
        }
      }
    },
    selectMelody({ commit, state }, payload) {
      // If this generation does not have its ID in the "selectedMelodies" list, add it.
      if (!state.selectedMelodies[payload.generationID]) {
        commit("addNewGeneractionOfSelectedMelodies", payload.generationID);
      }

      // If the selected melody is not already in the list, add it.
      if (!state.selectedMelodies[payload.generationID].includes(payload.ID)) {
        commit("addMelodyIDToSelectedMelodies", payload);
      }
    },
    deselectMelody({ commit, state }, payload) {
      // Look for the index of the deselected melody.
      const IDindex = state.selectedMelodies[payload.generationID].indexOf(
        payload.ID
      );

      // If the selected melody was found within the list, remove it.
      if (IDindex !== -1) {
        commit("removeMelodyIDFromSelectedMelodies", {
          generationID: payload.generationID,
          IDindex,
        });
      }
    },
  },
  modules: {},
});
