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
import { AlertError, Message, YesNo } from '../utils/alert'
import '@vuepic/vue-datepicker/dist/main.css';
import { useDisplay } from 'vuetify'
import { mdiDownload} from '@mdi/js'
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
const surname = ref() as Ref<string[]>;
const paidDate = ref() as Ref<string[]>;
const orderBy = ref('number');

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
  surname.value =   [] as string[];
  paidDate.value =[] as string[];

}


/**
 * Get the member list from the database
 */
async function getData() {

  const memberIDs: number[] = [];
 
  try {
     members.value   = await myFetch(apiMethods.getMembers,orderBy.value);
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
        if (member.nextOfKin == null) member.nextOfKin = 'unknown';
        if (member.nokPhone == null) member.nokPhone = '?';


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

  if (diff > 1000 * 60 *60 * 24 * 365)  //more than a year
    return 'orange';
  if (diff > 1000 * 60 *60 * 24 * 455)  //more than a year and 3 months
    return 'red';
  return 'black';

}
async function payment(i: number) {
    await YesNo('Update payment, Payment made today?', async ()=> {
     const now = new Date();
     const m: Member = members.value[i];
     m.paidDate = now;
     const res = await myFetch(apiMethods.payment,m);
      if (res === null) 
        return;
      if (res=="OK") {
        await Message("payment updated");
      }
      else {
        await AlertError('payment not updated',res);
        return;
      }

  })
}
async function changeOrder(order: string) {
  orderBy.value = order;
  await getData();
}

function download() {
  let csvContent = "data:text/csv;charset=utf-8,";
  
  members.value.forEach(function(member: Member) {
      const values=Object.values(member);
      // don't want commas in csv file

      for (let i = 0; i < values.length; i++) {
        const val = values[i];
        if (typeof val === 'string' && val.includes(','))
          values[i] = val.replace(/,/gi, " ");
      }

      let row = values.join(",");
      csvContent += row + "\r\n";
  });
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  let filename = "TCC members ";
  filename += new Date().toDateString();
  filename += ".csv";
  link.setAttribute("download", filename);
  document.body.appendChild(link); // Required for FF

  link.click(); // This will download the data file.
}

</script>

<template>
      <v-row no-gutters>
        <v-col cols="2">
          <v-card-text>Order member list by: </v-card-text>
        </v-col>
        <v-col cols="8">
          <v-radio-group class="pa-1" inline v-model="orderBy">
            <v-radio label='Number' value="number" @click="changeOrder('number')" />
            <v-radio label='First Name' value="fname" @click="changeOrder('fname')"  />
            <v-radio label='Surname' value="surname" @click="changeOrder('surname')"  />
            <v-radio label='Paid date' value="paidDate" @click="changeOrder('paidDate')"  />
          </v-radio-group>
        </v-col>
        <v-col cols = "2">
          <v-btn block   @click="download()" :prepend-icon="mdiDownload"> 
                Download CSV list</v-btn>
        </v-col>
    </v-row>
  <v-container >
  <v-list   density="compact" class="pa-0" border="sm">

    <v-list-item class="pl-0 pr-0 mt-n1 mb-n3" v-for="(member, i) in members" :key="i"  >

      <v-row  no-gutters class="ma1">

        <v-col cols="1"  title="Number"> &nbsp;{{ member.number }}   </v-col>
        <v-col cols="3"  title="First Name"> &nbsp;{{ member.fname }}   </v-col>
        <v-col cols="3"  title="Last Name"> &nbsp;{{ member.surname }}   </v-col>
        <v-col cols="2" title = "Update Payment Date">
          <v-chip
           size="small"
           :color=dateColour(i)
           variant="outlined"
           @click = payment(i)>
           {{  new Date(member.paidDate).toDateString() }}</v-chip> 
        </v-col>

        <v-col  cols="3" sm="2">
          <MemberDetails
            :member=member 
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