<template>
  <div class="initialization">
    <h1>Choose initialization melodies</h1>
    <div class="instructions">
      <p>
        You have two melody slots. These melodies will be used as parents of the
        first generation. For each slot you can generate random melodies until
        you are happy with them. Remember they are only the starting point.
      </p>
      <p>
        Use the buttons below the slots to play, stop, download, or generate a
        melody.
      </p>
      <p>
        To begin the evolution, click the "<b>Evolve once!</b>" button below.
      </p>
      <div v-if="!subsequentGenerations" class="button-row">
        <button class="evolve" @click="evolve">Evolve once!</button>
      </div>
      <div v-else class="button-row warning">
        <p>
          Continue evolution from the latest generation. This generation has
          been locked.
        </p>
      </div>
    </div>
    <div class="melody-slots-container">
      <MelodySlot
        :generationID="'1'"
        :ID="'1'"
        :enableGeneration="!subsequentGenerations"
      />
      <MelodySlot
        :generationID="'1'"
        :ID="'2'"
        :enableGeneration="!subsequentGenerations"
      />
    </div>
  </div>
</template>
<script>
import MelodySlot from "@/components/MelodySlot.vue";

export default {
  name: "InitializeEvolution",
  components: {
    MelodySlot,
  },
  computed: {
    subsequentGenerations() {
      return Object.keys(this.$store.state.generations).length > 1;
    },
  },
  methods: {
    async evolve() {
      // When initializing, there should be only one
      // generation with the initial two melodies in it.
      await this.$store.dispatch("mutateLatestGeneration", {
        generationID: 1,
        melodyIDs: [1, 2],
      });
    },
  },
};
</script>
<style scoped>
.initialization {
  margin: 50px 0 0 30px;
  text-align: left;
  min-height: 100vh;
}
.instructions {
  max-width: 620px;
  padding-bottom: 20px;

  .button-row {
    display: flex;
    justify-content: space-between;
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
}
</style>
