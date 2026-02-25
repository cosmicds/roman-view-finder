import Vue, { createApp, type Plugin } from "vue";

import { FundingAcknowledgement, IconButton, CreditLogos } from "@cosmicds/vue-toolkit";
import RomanFov from "./RomanFov.vue";

import vuetify from "../plugins/vuetify";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { WWTComponent, wwtPinia } from "@wwtelescope/engine-pinia";

import SimbadResolver from './SimbadResolver.vue';

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faShareNodes,
  faInfo,
  faChevronUp,
  faSliders,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import "@mdi/font/css/materialdesignicons.css";

library.add(faShareNodes);
library.add(faInfo);
library.add(faChevronUp);
library.add(faSliders);
library.add(faTimes);

/** v-hide directive taken from https://www.ryansouthgate.com/2020/01/30/vue-js-v-hide-element-whilst-keeping-occupied-space/ */
// Extract the function out, up here, so I'm not writing it twice
const update = (el: HTMLElement, binding: Vue.DirectiveBinding) => el.style.visibility = (binding.value) ? "hidden" : "";

createApp(RomanFov, {
  wwtNamespace: "roman-fov"
})
 
  // Plugins
  .use(wwtPinia as unknown as Plugin<[]>)
  .use(vuetify)

  // Directives
  .directive(
    /**
    * Hides an HTML element, keeping the space it would have used if it were visible (css: Visibility)
    */
    "hide", {
      // Run on initialisation (first render) of the directive on the element
      beforeMount(el, binding, _vnode, _prevVnode) {
        update(el, binding);
      },
      // Run on subsequent updates to the value supplied to the directive
      updated(el, binding, _vnode, _prevVnode) {
        update(el, binding);
      }
    })

  // Components
  .component("WorldWideTelescope", WWTComponent)
  .component('font-awesome-icon', FontAwesomeIcon)
  .component('icon-button', IconButton)
  .component('funding-acknowledgement', FundingAcknowledgement)
  .component('credit-logos', CreditLogos)
  .component('simbad-resolver', SimbadResolver)

  // Mount
  .mount("#app");
