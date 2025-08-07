<script setup lang="ts">

  const props = defineProps<{ 
    title : string,
    info: string,

    }>();
const emit = defineEmits(['clicked']);
</script>

<template>
        <v-row no-gutters>
            <v-col cols="6" class="text-right mt-n4">
                <v-chip class="mt-3">{{title}}</v-chip>
            </v-col>
            <v-col cols="6" class="mt-n4">
                <v-card-text @click= "emit('clicked')" > {{info}}   </v-card-text>
            </v-col>
        </v-row>
</template>