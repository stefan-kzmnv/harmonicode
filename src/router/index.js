import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/evolution-settings",
    name: "EvolutionSettings",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "EvolutionSettings" */ "../views/EvolutionSettings.vue"
      ),
  },
  {
    path: "/initialize-evolution",
    name: "InitializeEvolution",
    component: () =>
      import(
        /* webpackChunkName: "InitializeEvolution" */ "../views/InitializeEvolution.vue"
      ),
  },
  {
    path: "/generation/:generationID",
    name: "GenerationOfMelodies",
    component: () =>
      import(
        /* webpackChunkName: "GenerationOfMelodies" */ "../views/GenerationOfMelodies.vue"
      ),
    props: true,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
