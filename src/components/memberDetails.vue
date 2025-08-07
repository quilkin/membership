<script setup lang="ts">
  import { ref , onMounted, onBeforeMount} from 'vue'
  import { Member } from '../../../membership-server/src/common/member'
   import { User, Roles } from '../../../membership-server/src/common/user'
  //import { User } from '../utils/user'
  import { AlertError, Message } from '../utils/alert'
  import { mdiAccount } from '@mdi/js'
  import { myFetch } from '@/utils/fetch'
  import detailsLine from './detailsLine.vue'
import { apiMethods } from '../../../membership-server/src/common/apimethods'

  const props = defineProps<{ 
    member : Member ,
     }>();

  const emit = defineEmits(['detailsDone','editMember']);
  const detailsActive = ref(false);
  const member = props.member;
  const rideHubLogin = ref('');
  const loginColour = ref('black');
 
/**
 *  find the ridehub login name 
 */
  async function getLogIn() {
    detailsActive.value = true;
    const logins: User[]   = await myFetch(apiMethods.findLoginName,member.email);
    let login0: User= logins[0];
    if (login0 == undefined) {
       rideHubLogin.value = `Email mismatch? Member's email (${member.email}) not found in RideHub database`;
       loginColour.value = 'red';
     //  alert(`Email mismatch? Member's email (${member.email}) not found in RideHub database`);
     //   await AlertError('Email mismatch?',`Member's email (${member.email}) not found in RideHub database`);

    }
    else
      rideHubLogin.value = login0.name;


  }

  function editMember() {
        emit('editMember',member);
        closeDetails();
  }
  function fullName() : string {

    return member.fname + ' ' + member.surname;
  }
 function sendEmail() {
  window.open('mailto:' + member.email)
 }
 function whatsAppList() {
  let waString = '';
  if (member.waInfo>0) waString += 'Info, ';
  if (member.waChat>0) waString += 'Chat, ';
  if (member.waLeisure>0) waString += 'Leisure, ';
  if (waString.length == 0)
    waString = 'None';
  return waString;
 }

 function committeeList() : string {
  if (member.commArray != undefined)
    return member.committee;
  return 'no';
 }

 function closeDetails() {
    detailsActive.value = false;
 }


</script>

<template>
  <div class="text-center">
    <v-btn size="small"  variant='outlined'  color="green" :prepend-icon="mdiAccount" width="110" @click="getLogIn()">
        Details
    </v-btn>
    
      <v-dialog 
        
        v-if="detailsActive"
        activator="parent"
        
        content-class="details-dialog"
      >
      <v-card :title="fullName()" max-width="550">
        <v-card-text  class="mt-3">    {{ member.address1 }} {{ member.address2 }} {{ member.address3}} {{ member.postcode }}   </v-card-text>
        <v-spacer></v-spacer>

        <detailsLine title = 'RideHub login'      :info= "rideHubLogin"  /> 
        <detailsLine title = 'Telephone'          :info= "member.phone"  /> 
        <detailsLine title = 'Email'              :info= "member.email" @clicked="sendEmail()"  /> 
        <detailsLine title = 'Date Joined<'       :info= "new Date(member.joinedDate).toDateString()"  /> 
        <detailsLine title = 'Committee post(s)'  :info= "committeeList()"  /> 
        <detailsLine title = 'WhatsApp group(s)'  :info= "whatsAppList()"  /> 
        <detailsLine title = 'Subs'               :info= "'£' + member.subs.toString()"  />
        <detailsLine title = 'Date Last Paid'     :info= "new Date(member.paidDate).toDateString()"  />
        <detailsLine title = 'Emergency contact'  :info= "member.nextOfKin"  />
        <detailsLine title = 'Contact phone'      :info= "member.nokPhone"  />


         <v-card-actions>
            <v-btn 
                variant="elevated" color="green" id="edit" @click="editMember()" @done-member-edit = "closeDetails()"
                > Edit</v-btn>

            <v-col class="text-right">
                <v-btn variant="outlined" text="OK" color="blue" @click="closeDetails()"></v-btn>
            </v-col>
        </v-card-actions>
    </v-card>
      </v-dialog>
   
  </div>
</template>
  
<style scoped>
.v-list-item {
  min-height: 10px !important;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
