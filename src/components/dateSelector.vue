<script setup lang="ts">

/**
 * Select a date using vuepic/vue-datepicker library 
 */
import { ref, type Ref } from 'vue'
import DatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
  
  const props = defineProps<{
    date : Date,
    text : string,
    icon: boolean ,

    }>()
  const emit = defineEmits(['newDate']);
  const workingDate = ref(props.date);
 
  function newDate() {
      emit("newDate",workingDate.value);
  }

 
  const format = (date : Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}


</script>

<template>
  <div class="text-center">
        <DatePicker
           locale="en-UK"
           auto-apply
           :enable-time-picker="false"
           :format="format"
           :teleport="true"
           v-model="workingDate"
           no-hours-overlay
           no-minutes-overlay
           :clearable="false"
           @update:modelValue="newDate" 
           :min-date="new Date()"
           :six-weeks="true"   />
  </div>
</template>
  
