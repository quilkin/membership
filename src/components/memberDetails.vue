<script setup lang="ts">
  import { ref , onMounted, onBeforeMount} from 'vue'
  import { Member } from '../../../membership-server/src/common/member'
   import { User, Roles } from '../../../membership-server/src/common/user'
  //import { User } from '../utils/user'
  import { Message } from '../utils/alert'
  import { mdiAccount } from '@mdi/js'

  const props = defineProps<{ 
    member : Member ,
    user: User

    }>();

  const emit = defineEmits(['logIn','detailsDone','editMember']);
  const detailsActive = ref(false);
  const member = props.member;
  

  // possible texts for the 'join' button
  const joinText = 'Join';
  let buttonText = joinText;

  onMounted(() => {

  });

  async function checkLogin() {
    if (props.user.role === Roles.None)
    {
        // not logged in, not allowed to see details or join a ride
        await Message('You need to sign in to continue');
        emit('logIn');
    }
    detailsActive.value = true;

  }

  function editMember() {
        emit('editMember',member);
        detailsActive.value = false;
  }
  function fullName(m : Member) : string {
    return member.fname + ' ' + member.name;
  }
 function sendEmail() {
  window.open('mailto:' + member.email)
 }
 function whatsApp() {
  let waString = '';
  if (member.waInfo>0) waString += 'Info, ';
  if (member.waChat>0) waString += 'Chat, ';
  if (member.waLeisure>0) waString += 'Leisure, ';
  if (waString.length == 0)
    waString = 'None';
  return waString;

 }
</script>

<template>
  <div class="text-center">
    <v-btn size="small"  variant='outlined'  color="green" :prepend-icon="mdiAccount" width="110" @click="checkLogin()">
        Details
    </v-btn>
    
      <v-dialog 
        
        v-if="detailsActive"
        activator="parent"
        
        content-class="details-dialog"
      >
      <v-card :title="fullName(member)" max-width="550">
        <v-card-text>    {{ member.address1 }} {{ member.address2 }} {{ member.address3}} {{ member.postcode }}   </v-card-text>
        <v-spacer></v-spacer>
        <v-row no-gutters>
            <v-col cols="6" class="text-right mt-n2"><v-chip >WhatsApp group(s)</v-chip></v-col>
            <v-col cols="6"><v-card-text class="mt-n4">{{whatsApp()}}</v-card-text></v-col>
        </v-row>

        <v-row no-gutters>
            <v-col cols="6"  class="text-right mt-n2"><v-chip class="mt-3">Telephone</v-chip></v-col>
            <v-col cols="6" class="mt-n2"><v-card-text> {{ member.telephone }}   </v-card-text></v-col>
        </v-row>
        <v-row no-gutters>
            <v-col cols="6" class="text-right mt-n2"><v-chip class="mt-3">Email</v-chip></v-col>
            <v-col cols="6" class="mt-n2"><v-card-text @click=sendEmail()> {{ member.email }}   </v-card-text></v-col>
        </v-row>
        <v-row no-gutters>
            <v-col cols="6" class="text-right mt-n2"><v-chip class="mt-3">Date Joined</v-chip></v-col>
            <v-col cols="6" class="mt-n2"><v-card-text> {{ member.joinedDate }}   </v-card-text></v-col>
        </v-row>
        <v-row no-gutters>
            <v-col cols="6" class="text-right mt-n2"><v-chip class="mt-3">Committee post(s)</v-chip></v-col>
            <v-col cols="6" class="mt-n2"><v-card-text> {{ member.committee }}   </v-card-text></v-col>
        </v-row>
        <v-row no-gutters>
            <v-col cols="6" class="text-right mt-n2"><v-chip class="mt-3">Subs</v-chip></v-col>
            <v-col cols="6" class="mt-n2"><v-card-text> £{{ member.subs}}   </v-card-text></v-col>
        </v-row>
        <v-row no-gutters>
            <v-col cols="6" class="text-right mt-n2"><v-chip class="mt-3">Date Last Paid</v-chip></v-col>
            <v-col cols="6" class="mt-n2"><v-card-text> {{ member.paidDate }}   </v-card-text></v-col>
        </v-row>

        <v-card-actions>
            <v-btn 
                variant="elevated" color="green" id="edit" @click="editMember()"
                > Edit</v-btn>

            <v-col class="text-right">
                <v-btn variant="outlined" text="OK" color="blue" @click="detailsActive = false"></v-btn>
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
