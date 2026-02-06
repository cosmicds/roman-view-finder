<template>
  <div>
  <v-text-field
    v-model="name"
    class="simbad-resolver-text-field"
    style="pointer-events: auto;"
    label="Object name"
    variant="solo-filled"
    :error-messages="errorMessage"
    persistent-hint
    hint="Press [Enter] to search"
    @keyup.enter="resolveName"
  >
    <template #prepend>
      Go to:
    </template>      
  </v-text-field>
  <v-snackbar v-model="showError" color="error" location="top">
    Object name could not be resolved
    <template v-slot:actions>
      <v-btn
        color="black"
        variant="text"
        @click="showError = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</div>
</template>
<script lang="ts" setup>
import {ref, watch} from 'vue';
import { simbadNameResolver, ResolvedObject } from './simbad_resolvers';
import { sesameNameResolver } from './sesame_resolver';
import { engineStore } from '@wwtelescope/engine-pinia';
import { D2R } from "@wwtelescope/astro";

const store = engineStore();

interface SesameResolverComonentProps {
  goto?: boolean
}
const props = withDefaults(defineProps<SesameResolverComonentProps>(),{goto: false});

const emits = defineEmits<{
  resolved: [value: ResolvedObject]
}>();

  
const name = ref<string | null>(null);
const details = ref<ResolvedObject | null>(null);
const errorMessage = ref('');
const showError = ref(false);
const timeout = 2000;
function timeoutError()  {
  setTimeout(()=>{
    showError.value = false;
  }, timeout);
}
watch(errorMessage, (_msg) => {
  showError.value = true;
  timeoutError();
});

const resolver: 'sesame' | 'simbad' = 'simbad';

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
    (resolver === 'simbad' ? simbadNameResolver: sesameNameResolver)(name.value)
      .then(d => {
        details.value = d;
        emits('resolved', d);
        console.log(d);
        if (props.goto) {
          goTo(d);
        }
      })
      .catch(() => {
        errorMessage.value = 'Could not find object';
      });
  }
}
</script>