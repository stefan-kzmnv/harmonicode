<template>
  <div class="home">
    <h1>Home</h1>
    <p>Welcome to Harmonicode!</p>
    <p>This is a tool to generate melodies in an algorithmic way.</p>
    <p>
      In the <b>"Initialize"</b> tab you will find two melody slots that you can
      generate random melodies in until you get two that you are happy with.
      These two initial melodies will serve as parents to a second generation
      and be mutated to a set of 10 new melodies.
    </p>
    <p>
      From that second generation on is where the real fun begins! You are able
      to either select 2 of those 10 melodies to become the parents of the
      subsequent generation, or skip a desired number of generations, whereby
      the algorithm will automatically rate the melodies according to a set of
      desired characteristics, determine which 2 are the best, and use those as
      the parents. You can repeat this process for as many generations as you
      like.
    </p>
    <p>You can also play/stop or download any melody at any point.</p>
    <p>
      In the <b>"Settings"</b> tab you can choose the desired melodic scale, but
      you will also find various fitness parameters that you can adjust to your
      liking. These parameters will be used to rate melodies when you choose to
      skip generations.
    </p>
    <p>
      You will also find mutation parameters. These are used to influence the
      rate at which mutations occur.
    </p>
    <p>
      <b>Tip:</b> A combined approach, where you alternate between skipping many
      generations and then nudging the direction by choosing melodies manually
      for a generation or two might work best.
    </p>
    <p>
      <b>Note:</b> For now, all melodies have a length of 8 bars and are in 120
      BPM.
    </p>
  </div>
</template>

<script>
export default {
  name: "HomeView",
};
</script>
<style scoped>
.home {
  min-height: 100vh;
  max-width: 720px;
  margin: 50px 0 0 30px;
  text-align: left;
}
</style>
