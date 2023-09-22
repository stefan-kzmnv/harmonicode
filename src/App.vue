<template>
  <nav>
    <div class="logo-container">
      <img src="@/assets/harmonicode_logo.png" alt="" />
    </div>
    <router-link to="/">Home</router-link>
    <router-link to="/evolution-settings">Settings</router-link>
    <router-link to="/initialize-evolution">Initialize</router-link>
    <router-link
      v-for="(generation, key) in generations"
      :key="key"
      :to="`/generation/${key}`"
    >
      Generation {{ key }}
    </router-link>
  </nav>
  <!--
      Binding a key to the path below, so Vue doesn't
      reuse the same component in multiple instances
  -->
  <router-view :key="$route.path" />
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState({
      generations(state) {
        // Filter out the first generation, it is already part of the navigation.
        return Object.fromEntries(
          Object.entries(state.generations).filter(([key]) => key !== "1")
        );
      },
    }),
  },
};
</script>
<style lang="scss">
body {
  margin: 0;
  min-height: 100vh;
}

#app {
  display: flex;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  overflow: auto;
  line-height: 1.5;
}

nav {
  width: 150px;
  padding: 10px 0 10px 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
  z-index: 1;

  .logo-container {
    height: 40px;
    margin: 0 5px 25px 0;

    img {
      width: 100%;
    }
  }

  a {
    height: 40px;
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    color: #2c3e50;
    text-decoration: none;
    box-shadow: -1px 1px 3px rgba(0, 0, 0, 0.5);
    border-radius: 10px 0 0 10px;

    &.router-link-exact-active {
      position: relative;
      width: 155px;
      color: #42b983;
      background-color: #fff;
      box-shadow: -3px 1px 2px rgba(0, 0, 0, 0.5);
    }
  }
}
</style>
