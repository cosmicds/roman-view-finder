<template>
  <div id="simbad-resolver">
  <v-text-field
    v-model="name"
    class="simbad-resolver-text-field"
    style="pointer-events: auto;"
    label="Object name"
    density="compact"
    bg-color="black"
    variant="outlined"
    :error-messages="errorMessage"
    persistent-hint
    hint="Press [Enter] to search"
    @keyup.enter="resolveName"
    @keydown.stop
    autocorrect="off"
  >     
  </v-text-field>
  <v-btn
    v-if="button"
    @click="() => resolveName()"
    :loading="searching"
    :color="buttonColor"
    text="Search"
    type="Submit"
    density="comfortable"
    class="mt-1"
  ></v-btn>
</div>
</template>
<style lang="css">
#simbad-resolver {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1em;
}
</style>
<script lang="ts" setup>
import {ref} from 'vue';
import { simbadNameResolver, ResolvedObject} from './simbad_resolvers';
import { sesameNameResolver } from './sesame_resolver';
import { engineStore } from '@wwtelescope/engine-pinia';
import { D2R } from "@wwtelescope/astro";

const store = engineStore();

interface SesameResolverComonentProps {
  goto?: boolean,
  button?: boolean,
  buttonColor?: string
}
const props = withDefaults(defineProps<SesameResolverComonentProps>(),{goto: false, button: false, buttonColor: 'on-surface'});

const emits = defineEmits<{
  resolved: [value: ResolvedObject]
}>();

  
const name = ref<string | null>(null);
const details = ref<ResolvedObject | null>(null);
const errorMessage = ref('');

const resolver: 'sesame' | 'simbad' | 'fallback' = 'fallback';
const searching = ref(false);
function simbadWithSesameFallback(name) {
  return simbadNameResolver(name).catch(() => sesameNameResolver(name));
}
const resolvers = {
  'sesame': sesameNameResolver,
  'simbad': simbadNameResolver,
  'fallback': simbadWithSesameFallback,
};

function goTo(object: ResolvedObject) {
  if (object?.raDeg && object?.decDeg) {
    console.log(`Going to ${object.raDeg}d ${object.decDeg}d`);
    store.gotoRADecZoom({
      raRad: object.raDeg * D2R,
      decRad: object.decDeg * D2R,
      zoomDeg: 30,
      instant: false,
    });
  }
}


function resolveName() {
  console.log(`resolving ${name.value}`);
  errorMessage.value = '';
  if (name.value) {
    searching.value = true;
    (resolvers[resolver])(name.value)
      .then(d => {
        details.value = d;
        emits('resolved', d);
        searching.value = false;
        if (props.goto) {
          goTo(d);
        }
      })
      .catch((e) => {
        console.log(e);
        searching.value = false;
        errorMessage.value = 'Could not find object';
      });
  }
}
</script>