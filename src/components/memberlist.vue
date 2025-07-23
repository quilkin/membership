<script setup  lang="ts">

/**
 * Display a list of rides for the next two months
 */
import { ref, onBeforeMount, computed, type Ref } from 'vue'
import { myFetch } from '@/utils/fetch'
import { apiMethods } from '../../../membership-server/src/common/apimethods'
import { Member } from '../../../membership-server/src/common/member'
import { User, Roles } from '../../../membership-server/src/common/user'
import MemberDetails from './memberDetails.vue'
import { AlertError, Message } from '../utils/alert'
import '@vuepic/vue-datepicker/dist/main.css';
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay();

const props = defineProps<{

  user : User
}>()

const emit = defineEmits(['getMembers','logIn','editMember','updateRideIndex','newDate']);
const showTooltips = ref(true);

const members = ref() as Ref<Member[]>

// data to be shown for each member in main table

const id = ref() as Ref<number[]>;
const fname = ref() as Ref<string[]>;
const name = ref() as Ref<string[]>;
const paidDate = ref() as Ref<string[]>;

let currentRideIndex = 0;


onBeforeMount(async() => {

  initialiseArrays();
  await getData();
  if (members.value.length == 0)
    return;

 
});

function initialiseArrays() {
  members.value =         [] as Member[];
  id.value =   [] as number[];
  fname.value =   [] as string[];
  name.value =   [] as string[];
  paidDate.value =[] as string[];

}


/**
 * Get the member list from the database
 */
async function getData() {

  const memberIDs: number[] = [];
 
  try {
     members.value   = await myFetch(apiMethods.getMembers,0);
    if (!members.value  )  throw new Error(`Cannot get member list`);

    if (members.value.length == 0)
    {
      await Message('No members found ');
      return;
    }

    members.value.forEach((member) => {
      
        // convert 'committee' string into an array of committee positions
        if (member.committee.length > 0) {
          let memArray = [];
          const positions = member.committee.split(' ');
          if (positions.length > 0) {
            for (const p of positions) {
                memArray.push(p);
            }
            member.commArray= memArray;
          }
        }

    });

     
   

  }
  catch (e) {
    const err = e as Error;
   await  AlertError('Unsuccessful',err.message);
  }
}



/**
 * variations for phone (mobile) / PC screen displays
 */
const listHeight= computed(() => {
  return mobile.value ? '40vh':'80vh';
})
const listItemLines= computed(() => {

  return mobile.value ? 'two':'three';
})

/**
 * decide on showing red for out-of-date subs payments
 * @param i index of member in list
 */
function dateColour(i: number) {
  const now = new Date();
  const m: Member = members.value[i];
  const then = new Date(m.paidDate);
  const diff = now.valueOf() - then.valueOf();
  if (diff > 1000 * 60 *60 * 24 * 365)
    return 'red';
  return 'black';

}



</script>

<template>

  <v-container >
  <v-list   density="compact" class="pa-0">
    <!-- <v-list-item >
      <v-row  no-gutters>
        <v-col cols="1" > num </v-col>
        <v-col cols="3" >first name</v-col>
        <v-col cols="3" >surname</v-col>
        <v-col cols="2" >last paid</v-col>
   
      </v-row>
      
    </v-list-item> -->
    <v-list-item class="pl-0 pr-0 mt-n1 mb-n3" v-for="(member, i) in members" :key="i"  >

      <v-row  no-gutters class="ma1">

        <v-col cols="1"  title="Number"> &nbsp;{{ member.number }}   </v-col>
        <v-col cols="3"  title="First Name"> &nbsp;{{ member.fname }}   </v-col>
        <v-col cols="3"  title="Last Name"> &nbsp;{{ member.name }}   </v-col>
        <v-col cols="2" >
          <v-chip size="small" :color=dateColour(i) variant="outlined">{{  new Date(member.paidDate).toDateString() }}</v-chip> 
        </v-col>

        <v-col  cols="3" sm="2">
          <MemberDetails
            :member="member" 
            :user="props.user"
            @log-in="$emit('logIn')"
            @edit-member="emit('editMember',member)"
          > </MemberDetails>

        </v-col>
      </v-row>
     
    </v-list-item>
  </v-list>
  </v-container>
</template>

<style>

.v-container {
    padding: 1vh 1vw;
  }

</style>