<template>
  <v-app id="app" :style="cssVars">
    <div id="main-content">
      <WorldWideTelescope :wwt-namespace="wwtNamespace"></WorldWideTelescope>

      <canvas id="shadow"></canvas>

      <transition name="fade">
        <div class="modal" id="modal-loading" v-show="isLoading">
          <div class="container">
            <div class="spinner"></div>
            <p>Loading …</p>
          </div>
        </div>
      </transition>


      <!-- This block contains the elements (e.g. icon buttons displayed at/near the top of the screen -->
      
      <v-menu
        activator="#position-search-button"
        :close-on-content-click="false"
        ref="positionSearch"
      >
        <template #default="{ isActive }">
          <v-card
            id="position-search"
          >
            <v-card-title>Go to position</v-card-title>
            <v-form @submit.prevent>
              <v-text-field
                @keydown.stop
                v-model="positionSearchRA"
                label="RA (deg)"
                density="compact"
                hide-details
                class="pt-2"
              ></v-text-field>
              <v-text-field
                @keydown.stop
                v-model="positionSearchDec"
                label="Dec (deg)"
                density="compact"
                hide-details
                class="pt-2"
              ></v-text-field>
              <v-alert
                v-if="positionSearchError"
                :text="positionSearchError"
                type="error"
                density="compact"
                class="pt-2"
              >
              </v-alert>
              <v-btn
                @click="() => tryGoToSearchPosition(isActive)"
                :loading="moving"
                :color="accentColor"
                :disabled="!(positionSearchRA && positionSearchDec)"
                class="mt-2"
                text="Go"
                type="Submit"
                block
              ></v-btn>
            </v-form>
          </v-card>
        </template>
      </v-menu>


      <!-- This block contains the elements (e.g. the project icons) displayed along the bottom of the screen -->
      
    <div id="top-content">
      <div id="left-buttons">
        <div id="coordinates" class="info-box">
          <pre>{{ coordinates }}</pre>
        </div>
        <icon-button
          id="position-search"
          fa-icon="magnifying-glass-location"
          :color="accentColor"
          tooltip-text="Go to location"
          tooltip-location="end"
        >
        </icon-button>
      </div>
      <div id="center-content">
      </div>
      <div id="right-buttons">
        <div id="controls" class="info-box">
          <details open>
            <summary></summary>
            <v-select
              id="bg-select"
              width="200"
              v-model="backgroundImagesetName"
              label="Select Background"
              :items="backgroundImagesets"
              :list-props="{bgColor: backgroundColorDarkest}"
              variant="solo-filled"
              item-title="displayName"
              item-value="imagesetName"
              :bg-color="backgroundColor"
              :item-color="textColor"
              density="compact"
              hide-details
            >
            </v-select>
            <div class="centered-content pt-4 pb-3 pl-1">
              <label
                for="footprint-color"
              >
                Footprint Color:
              </label>
              <input
                id="footprint-color"
                class="bordered"
                type="color"
                v-model="footprintColorString"
              />
            </div>
            <div id="crosshairs-row" class="centered-content">
              <v-checkbox
                v-model="crosshairs"
                label="Show crosshairs"
                density="compact"
                hide-details
              ></v-checkbox>
              <input
                v-show="crosshairs"
                id="crosshairs-color"
                class="bordered"
                type="color"
                v-model="crosshairsColor"
                :disabled="!crosshairs"
              />
            </div>
            <div id="fill-row" class="centered-content">
              <v-checkbox
                v-model="fill"
                label="Fill"
                density="compact"
                hide-details
              ></v-checkbox>
              <v-slider
                v-model="fillOpacity"
                :min="0"
                :max="1"
                :step="0.01"
                :disabled="!fill"
                :color="footprintColorString"
                density="compact"
                hide-details
              />
            </div>
            <v-checkbox
              v-model="decimalCoordinates"
              label="Show decimal coordinates"
              density="compact"
              hide-details
            ></v-checkbox>
            <v-checkbox
              v-model="galactic"
              label="Galactic mode"
              density="compact"
              hide-details
            ></v-checkbox>
          </details>
        </div>
      </div>
    </div>

    <!-- This block contains the elements (e.g. the project icons) displayed along the bottom of the screen -->
      
      <div id="bottom-content">
        <div id="body-logos" v-if="!smallSize">
          <credit-logos />
        </div>
      </div>


      <!-- This dialog contains the video that is displayed when the video icon is clicked -->

      <v-dialog id="video-container" v-model="showVideoSheet" transition="slide-y-transition" fullscreen>
        <div class="video-wrapper">
          <font-awesome-icon id="video-close-icon" class="close-icon" icon="times" size="lg"
            @click="showVideoSheet = false" @keyup.enter="showVideoSheet = false" tabindex="0"></font-awesome-icon>
          <video controls id="info-video">
            <source src="" type="video/mp4">
          </video>
        </div>
      </v-dialog>


      <!-- This dialog contains the informational content that is displayed when the book icon is clicked -->

      <v-dialog :style="cssVars" :class="['info-sheet', `info-sheet-${infoSheetLocation}`]" id="text-info-sheet"
        hide-overlay persistent no-click-animation absolute :scrim="false" location="bottom" v-model="showTextSheet"
        :transition="infoSheetTransition">
        <v-card height="100%">
          <v-tabs v-model="tab" height="32px" :color="accentColor" :slider-color="accentColor" id="tabs" dense>
            <v-tab class="info-tabs" tabindex="0">
              <h3>Information</h3>
            </v-tab>
            <v-tab class="info-tabs" tabindex="0">
              <h3>Using WWT</h3>
            </v-tab>
          </v-tabs>
          <font-awesome-icon id="close-text-icon" class="control-icon" icon="times" size="lg"
            @click="showTextSheet = false" @keyup.enter="showTextSheet = false" tabindex="0"></font-awesome-icon>
          <v-window v-model="tab" id="tab-items" class="pb-2 no-bottom-border-radius">
            <v-window-item>
              <v-card class="no-bottom-border-radius scrollable">
                <v-card-text class="info-text no-bottom-border-radius">
                  Information goes here
                  <v-spacer class="end-spacer"></v-spacer>
                </v-card-text>
              </v-card>
            </v-window-item>
            <v-window-item>
              <v-card class="no-bottom-border-radius scrollable">
                <v-card-text class="info-text no-bottom-border-radius">
                  <v-container>
                    <v-row align="center">
                      <v-col cols="4">
                        <v-chip label outlined>
                          Pan
                        </v-chip>
                      </v-col>
                      <v-col cols="8" class="pt-1">
                        <strong>{{ touchscreen ? "press + drag" : "click + drag" }}</strong> {{ touchscreen ? ":" : "or"
                        }} <strong>{{ touchscreen ? ":" : "W-A-S-D" }}</strong> {{ touchscreen ? ":" : "keys" }}<br>
                      </v-col>
                    </v-row>
                    <v-row align="center">
                      <v-col cols="4">
                        <v-chip label outlined>
                          Zoom
                        </v-chip>
                      </v-col>
                      <v-col cols="8" class="pt-1">
                        <strong>{{ touchscreen ? "pinch in and out" : "scroll in and out" }}</strong> {{ touchscreen ? ":"
                          : "or" }} <strong>{{ touchscreen ? ":" : "I-O" }}</strong> {{ touchscreen ? ":" : "keys" }}<br>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12">
                        <div class="credits">
                          <h3>Credits:</h3>
                          <h4><a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank"
                              rel="noopener noreferrer">CosmicDS</a> Vue Data Stories Team:</h4>
                          John Lewis<br>
                          Jon Carifio<br>
                          Pat Udomprasert<br>
                          Alyssa Goodman<br>
                          Mary Dussault<br>
                          Harry Houghton<br>
                          Anna Nolin<br>
                          Evaluator: Sue Sunbury<br>
                          <br>
                          <h4>WorldWide Telescope Team:</h4>
                          Peter Williams<br>
                          A. David Weigel<br>
                          Jon Carifio<br>
                        </div>
                        <v-spacer class="end-spacer"></v-spacer>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <funding-acknowledgement />
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-window-item>
          </v-window>
        </v-card>
      </v-dialog>

    </div>
  </v-app>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick, type Ref } from "vue";
import { fmtDegLat, fmtHours, D2R, R2D } from "@wwtelescope/astro";
import { Color, Coordinates, Settings, WWTControl } from "@wwtelescope/engine";
import { GotoRADecZoomParams, engineStore } from "@wwtelescope/engine-pinia";
import { BackgroundImageset, supportsTouchscreen, blurActiveElement, useWWTKeyboardControls } from "@cosmicds/vue-toolkit";
import { useDisplay } from "vuetify";
import { VMenu } from "vuetify/components";
import { storeToRefs } from "pinia";

import * as wwtlib from "@wwtelescope/engine";

import { drawFootprint } from "./footprint";
import { renderOneFrame, splitString } from "./wwt-hacks";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error `Util.splitString` is defined
wwtlib.Util.splitString = splitString;

type SheetType = "text" | "video";
type CameraParams = Omit<GotoRADecZoomParams, "instant">;
export interface RomanFovProps {
  wwtNamespace?: string;
  initialCameraParams?: CameraParams;
}

const store = engineStore();

const {
  backgroundImageset,
  decRad,
  raRad,
} = storeToRefs(store);

const backgroundImagesetName = computed({
  get(): string | undefined {
    return backgroundImageset.value?.get_name();
  },
  set(name: string) {
    store.setBackgroundImageByName(name);
  }
});

useWWTKeyboardControls(store);

const touchscreen = supportsTouchscreen();
const { smAndDown } = useDisplay();

const props = withDefaults(defineProps<RomanFovProps>(), {
  wwtNamespace: "roman-fov",
  initialCameraParams: () => {
    return {
      raRad: 1.4612,
      decRad: -0.09646,
      zoomDeg: 60
    };
  }
});

const backgroundImagesets = reactive<BackgroundImageset[]>([
  new BackgroundImageset("DSS", "Digitized Sky Survey (Color)"),
  new BackgroundImageset("2MASS", "2Mass: Imagery (Infrared)"),
  new BackgroundImageset("SDSS", "SDSS: Sloan Digital Sky Survey (Optical) [DR7]"),
]);
const sheet = ref<SheetType | null>(null);
const layersLoaded = ref(false);
const positionSet = ref(false);

const positionSearchRA = ref<string | null>(null);
const positionSearchDec = ref<string | null>(null);
const positionSearchError = ref<string | null>(null);


// Color palette generated by Claude from https://assets.science.nasa.gov/dynamicimage/assets/science/missions/rst/spacecraft-illustrations/Roman_Title_1.jpg 
// (with some adjustments by me)
// Deep Space Purple #502752(Background)
// Cosmic Violet #632B7D (Background)
// ISM Indigo #8B5FB6 (Call to Action, with Stardust White text)
// pick one accent
// Nebula Magenta #C77FB3 (Accents)
// Stellar Amber #FFB86C (Accents / Contrast)
// Electric Cyan #00F0FF (Accents)
// Soft Lavender #B8A5D4  (Borders)
// Stardust White #F5F0FF  (Background / text on dark)
// Space Black #0A0515  (text on light)
// https://contrast-grid.eightshapes.com/?version=1.1.0&background-colors=&foreground-colors=%23FFFFFF%2C%20white%0D%0A%23502762%2C%20Deep%20Space%20Purple%0D%0A%23632b7d%2C%20Cosmic%20Violet%0D%0A%238B5FB6%2C%20ISM%20Indigo%0D%0A%23C77FB3%2C%20Nebula%20Magenta%0D%0A%23FFB86C%2C%20Stellar%20Amber%0D%0A%2300F0FF%2C%20Electric%20Cyan%0D%0A%23B8A5D4%2C%20Soft%20Lavender%0D%0A%23F5F0FF%2C%20Stardust%20White%0D%0A%230A0515%2C%20Space%20Black%0D%0A%23000000%2C%20black&es-color-form__tile-size=compact&es-color-form__show-contrast=aaa&es-color-form__show-contrast=aa&es-color-form__show-contrast=aa18&es-color-form__show-contrast=dnp

const backgroundColorDarkest = ref("#502752");
const backgroundColor = ref("#632B7D");
const borderColor = ref("#B8A5D4");
const accentColor = ref("#C77FB3");
const textColor = ref("#F5F0FF");
const tab = ref(0);
const footprintColorString = ref("#00F0FF"); // #ff00b7
const footprintColor = computed(() => Color.load(footprintColorString.value));

const decimalCoordinates = ref(false);
const coordinates = computed(() => {
  return decimalCoordinates.value ? 
    `RA: ${(raRad.value * R2D).toFixed(6)}  Dec: ${(decRad.value * R2D).toFixed(6)}` :
    `RA: ${fmtHours(raRad.value, 'h', 'm', 0, 's')}  Dec: ${fmtDegLat(decRad.value)}`;
});
const galactic = ref(false);
const crosshairs = ref(false);
const crosshairsColor = ref("#ffffff");
const fill = ref(false);
const fillOpacity = ref(0.5);
const moving = ref(false);

const settings = Settings.get_active();

onMounted(() => {
  store.waitForReady().then(async () => {

    settings.set_galacticMode(galactic.value);
    settings.set_showCrosshairs(crosshairs.value);
    settings.set_crosshairsColor(crosshairsColor.value);

    const control = WWTControl.singleton;
    control.renderOneFrame();
    control.renderOneFrame = renderOneFrame.bind(control);

    store.gotoRADecZoom({
      ...props.initialCameraParams,
      instant: true
    }).then(() => positionSet.value = true);

    // control._drawCrosshairs = (_renderContext: RenderContext) => { drawFootprint(WWTControl.singleton); };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    control.renderFrameCallback = function (wwt: WWTControl) {
      drawFootprint(wwt, {
        color: footprintColor.value,
        fill: fill.value,
        fillOpacity: fillOpacity.value,
      });
    };

    await store.loadImageCollection({ url: "unwise.wtml", loadChildFolders: false }).then(_folder => {
      backgroundImagesets.push(new BackgroundImageset("unWISE", "unWISE color, from W2 and W1 bands"));
    });

    // If there are layers to set up, do that here!
    layersLoaded.value = true;
  });
});

const ready = computed(() => layersLoaded.value && positionSet.value);

/* `isLoading` is a bit redundant here, but it could potentially have independent logic */
const isLoading = computed(() => !ready.value);

/* Properties related to device/screen characteristics */
const smallSize = computed(() => smAndDown.value);

/** Values related to setting the info sheet size and position */
const infoFraction = 34;
const tall = computed(() => smAndDown.value);
const widescreenInfoLocation = ref<"right" | "bottom">("right");
const infoSheetLocation = computed(() => tall.value || widescreenInfoLocation.value === "bottom" ? "bottom" : "right");
const infoSheetHeight = computed(() => infoSheetLocation.value === "bottom" ? `${infoFraction}%` : "100%");
const infoSheetWidth = computed(() => infoSheetLocation.value === "bottom" ? "100%" : `${infoFraction}%`);
const infoTextHeight = computed(() => infoSheetLocation.value === "bottom" ? `calc(${infoFraction}vh - 25px)` : "calc(100vh - 25px)");
const infoSheetTransition = computed(() => infoSheetLocation.value === "bottom" ? "dialog-bottom-transition" : "tab-reverse-transition");

/* This lets us inject component data into element CSS */
const cssVars = computed(() => {
  return {
    "--accent-color": accentColor.value,
    "--background-color-darkest": backgroundColorDarkest.value,
    "--background-color": backgroundColor.value,
    "--border-color": borderColor.value,
    "--text-color": textColor.value,
    "--app-content-height": showTextSheet.value && infoSheetLocation.value === "bottom" ? `${100 - infoFraction}%` : "100%",
    "--app-content-width": showTextSheet.value && infoSheetLocation.value === "right" ? `${100 - infoFraction}%` : "100%",
    "--info-sheet-width": infoSheetWidth.value,
    "--info-sheet-height": infoSheetHeight.value,
    "--info-text-height": infoTextHeight.value,
  };
});


/**
  Computed flags that control whether the relevant dialogs display.
  The `sheet` data member stores which sheet is open, so these are just
  computed wrappers around modifying/querying that which can be used as
  dialog v-model values
*/
const showTextSheet = computed({
  get() {
    return sheet.value === "text";
  },
  set(_value: boolean) {
    selectSheet("text");
  }
});

const showVideoSheet = computed({
  get() {
    return sheet.value === "video";
  },
  set(value: boolean) {
    selectSheet("video");
    if (!value) {
      const video = document.querySelector("#info-video") as HTMLVideoElement;
      video.pause();
    }
  }
});

function selectSheet(sheetType: SheetType | null) {
  if (sheet.value === sheetType) {
    sheet.value = null;
    nextTick(() => {
      blurActiveElement();
    });
  } else {
    sheet.value = sheetType;
  }
}

function tryGoToSearchPosition(menuOpen: Ref<boolean>, instant: boolean = false) {
  positionSearchError.value = null;

  const ra = Coordinates.parseRA(positionSearchRA.value);
  const dec = Coordinates.parseDec(positionSearchDec.value);

  const raValid = !isNaN(ra);
  const decValid = !isNaN(dec);

  if (raValid && decValid) {
    store.gotoRADecZoom({
      raRad: ra * D2R,
      decRad: dec * D2R,
      zoomDeg: 20,
      instant,
    });
    menuOpen.value = false;
    return;
  }

  const invalid: string[] = [];
  if (!raValid) {
    invalid.push("right ascension");
  }
  if (!decValid) {
    invalid.push("declination");
  }

  const multiple = invalid.length > 1;
  const isAre = multiple ? "are" : "is";
  positionSearchError.value = `Your value${multiple ? 's' : ''} for ${invalid.join(' and ')} ${isAre} invalid`;
}

watch(galactic, (gal: boolean) => {
  const raRad = store.raRad;
  const decRad = store.decRad;
  settings.set_galacticMode(gal);
  store.gotoRADecZoom({
    raRad,
    decRad,
    zoomDeg: store.zoomDeg,
    instant: true,
  });
});
watch(crosshairs, (show: boolean) => settings.set_showCrosshairs(show));
watch(crosshairsColor, (color: string) => settings.set_crosshairsColor(color));
</script>

<style lang="less">
@font-face {
  font-family: "Highway Gothic Narrow";
  src: url("./assets/HighwayGothicNarrow.ttf");
}

:root {
  --default-font-size: clamp(0.7rem, min(1.7vh, 1.7vw), 1.1rem);
  --default-line-height: clamp(1rem, min(2.2vh, 2.2vw), 1.6rem);
}

html {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #000;
  overflow: hidden;


  -ms-overflow-style: none;
  // scrollbar-width: none;
}

body {
  position: fixed;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;

  font-family: Verdana, Arial, Helvetica, sans-serif;
}

#main-content {
  position: fixed;
  width: var(--app-content-width);
  height: var(--app-content-height);
  overflow: hidden;

  transition: height 0.1s ease-in-out;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  font-size: 11pt;

  .wwtelescope-component {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    border-style: none;
    border-width: 0;
    margin: 0;
    padding: 0;
  }
}

#shadow {
  width: 100%;
  height: 100%;
  pointer-events: none;
  position: static;
  opacity: 0;
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.modal {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 100;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

#modal-loading {
  background-color: #000;

  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    .spinner {
      background-image: url("https://projects.cosmicds.cfa.harvard.edu/cds-website/misc/lunar_loader.gif");
      background-repeat: no-repeat;
      background-size: contain;
      width: 3rem;
      height: 3rem;
    }

    p {
      margin: 0 0 0 1rem;
      padding: 0;
      font-size: 150%;
    }
  }
}

#top-content {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

#left-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

#right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  height: auto;
}

#bottom-content {
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  align-items: center;
  gap: 5px;
}

#body-logos {
  position: absolute;
  right: 0.5em;
  bottom: 0.5em;
}

// From Sara Soueidan (https://www.sarasoueidan.com/blog/focus-indicators/) & Erik Kroes (https://www.erikkroes.nl/blog/the-universal-focus-state/)
:focus-visible,
button:focus-visible,
.focus-visible,
.v-selection-control--focus-visible .v-selection-control__input {
  outline: 9px double white !important;
  box-shadow: 0 0 0 6px black !important;
  border-radius: .125rem;
}

.video-wrapper {
  height: 100%;
  background: black;
  text-align: center;
  z-index: 1000;

  #video-close-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 15;

    &:hover {
      cursor: pointer;
    }

    &:focus {
      color: white;
      border: 2px solid white;
    }
  }
}

video {
  height: 100%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

#info-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 0px;
  z-index: 10;
}

.info-sheet {
  .v-overlay__content {
    align-self: flex-end;
    padding: 0;
    margin: 0 !important;
    max-width: 100% !important;
    height: var(--info-sheet-height) !important;
    width: var(--info-sheet-width) !important;
  }

  &.info-sheet-right .v-overlay__content {
    position: absolute;
    top: 0;
    right: 0;
    max-height: 100%;

    & .v-card,
    & .v-card .v-window {
      height: 100%;
    }

    & .info-tabs h3 {
      font-size: 10pt;
    }
  }

  #tabs {
    width: calc(100% - 3em);
    align-self: left;
  }

  .info-text {
    height: var(--info-text-height);
    padding-bottom: 25px;

    & a {
      text-decoration: none;
    }
  }

  .close-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 15;

    &:hover {
      cursor: pointer;
    }

    &:focus {
      color: white;
      border: 2px solid white;
    }
  }

  .scrollable {
    overflow-y: auto;
  }

  #tab-items {
    // padding-bottom: 2px !important;

    .v-card-text {
      font-size: ~"max(14px, calc(0.7em + 0.3vw))";
      padding-top: ~"max(2vw, 16px)";
      padding-left: ~"max(4vw, 16px)";
      padding-right: ~"max(4vw, 16px)";

      .end-spacer {
        height: 25px;
      }
    }

  }

  #close-text-icon {
    position: absolute;
    top: 0.25em;
    right: calc((3em - 0.6875em) / 3); // font-awesome-icons have width 0.6875em
    color: white;
  }

  // This prevents the tabs from having some extra space to the left when the screen is small
  // (around 400px or less)
  .v-tabs:not(.v-tabs--vertical).v-tabs--right>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__next,
  .v-tabs:not(.v-tabs--vertical):not(.v-tabs--right)>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__prev {
    display: none;
  }
}

#bg-select {
  pointer-events: auto;

  &:hover {
    color: var(--accent-color);
    cursor: pointer;
  }
}
.info-box{
  font-size: 0.9rem;
  color: white;
  background: rgba(10, 5, 21, 0.7);
  border: 1px solid;
  border-radius: 5px;
  padding: 0.5rem;
  pointer-events: auto;
  border-color: var(--border-color);
  width: 100%;  
}

.bordered {
  border: 1px solid #bbbbbb;
  padding-inline: 2px;
  border-radius: 4px;
}

.centered-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

#position-search-button {
  width: fit-content;
  padding: 10px;
}
</style>
