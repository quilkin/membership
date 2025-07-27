
<script setup lang="ts">

/**
 * Create a new ride or edit an existing one
 */
import { ref, type Ref, onBeforeMount, onMounted, onBeforeUpdate} from 'vue'
import { nameRules, genderRules, subsRules, emailRules,addressRules } from '../utils/rules'
import { myFetch } from '@/utils/fetch'
import { apiMethods } from '../../../membership-server/src/common/apimethods'
import { Member } from '../../../membership-server/src/common/member'
import { User, Roles  } from '../../../membership-server/src/common/user'
import { Alert, Message, YesNo, AlertError } from '../utils/alert'
import DateSelector  from './dateSelector.vue'
import { ca } from 'vuetify/locale'

// values that can be edited
const commArray= ref(['']);
const fname = ref('');
const name = ref('');
const subs = ref(20);
const paidDate = ref(new Date());
const dateChanged = ref(false);
const gender = ref('');
const address1 = ref ('');
const address2 = ref ('');
const address3 = ref ('');
const postcode = ref ('');
const telephone = ref ('');
const email = ref(' ');
const waChat = ref(false);
const waInfo = ref(false);
const waLeisure = ref(false);
const nextOfKin = ref('');
const nokPhone = ref('');


// controls
const showDate = ref(0);
const calendarShown = ref(false);

let newMember = true;     // false for editing an existing one

let thisMember : Member;

const memberDialog = ref(false);
/* possible outcomes of this edit */
const emit = defineEmits(['doneMemberEdit','logIn']);
const memberForm = ref();
const date = ref(new Date());
const fullEdit = ref(false);

const props = defineProps<{
  member : Member
  user : User
}>()

onBeforeMount(async() => {

  if (props.member.number> 0) {
    // editing existing member

    newMember = false;

  }
  if (props.member.committee.length > 0)
    fullEdit.value = true;
  update();
  thisMember = props.member;
})

onBeforeUpdate(async() => {

  update();
  
  if (props.member.number> 0) {
    // editing existing ride

    newMember = false;
  }
})

/**
 * update the page with new values
 */
function update() {
    if (props.user === undefined || props.member === undefined)
    {
        AlertError('Internal error','invalid user or ride data');
        return;
    } 

    thisMember = props.member;
   ++showDate.value;
   address1.value = thisMember.address1;
   address2.value = thisMember.address2;
   address3.value = thisMember.address3;
   postcode.value = thisMember.postcode;
   commArray.value = thisMember.commArray;
    fname.value = thisMember.fname;
    name.value = thisMember.name;
   gender.value = thisMember.gender;
    paidDate.value = thisMember.paidDate;
    subs.value = thisMember.subs;
    telephone.value = thisMember.phone;
    email.value = thisMember.email;
    waChat.value = thisMember.waChat>0;
    waInfo.value = thisMember.waInfo>0;
    waLeisure.value = thisMember.waLeisure>0;
    nextOfKin.value = thisMember.nextOfKin;
    nokPhone.value = thisMember.nokPhone;



   
}
function cancel() {
    memberDialog.value = false;
    emit('doneMemberEdit');
}


async function deleteMember()
{
  await YesNo('Delete this member, are you sure?', async ()=> {
    
    const res = await myFetch(apiMethods.deleteMember,thisMember);
    if (res != null) {
      if (res == 'OK') {
        await Alert('You have deleted this member','Notifications will be sent to the member','','info','OK');
      }
      else {
        await AlertError(res,'Member may not be deleted');
      }
    }
    emit('doneMemberEdit');

  })
}

/**
 * Submit the new data for validation
 */
async function submit() {
  if (memberForm.value == null) 
    return;
  const {valid} = await memberForm.value.validate()
  if (!valid ) {
    await Alert('Missing info','Please complete highlighted items','','info','OK');
    return;
  }

  await YesNo('Save this member, are you sure?', async ()=> {

   

      thisMember.address1 = address1.value ;
      thisMember.address2 = address2.value ;
      thisMember.address3 = address3.value  ;
      thisMember.postcode = postcode.value ;
      thisMember.fname = fname.value ;
      thisMember.name = name.value ;
      thisMember.gender = gender.value  ;
      if (dateChanged.value)
        thisMember.paidDate = paidDate.value;
      thisMember.subs = subs.value;
      thisMember.phone = telephone.value ;
      thisMember.email = email.value ;
      thisMember.waChat = waChat.value ? 1:0;
      thisMember.waInfo = waInfo.value ? 1:0; 
      thisMember.waLeisure = waLeisure.value ? 1:0 ;
      thisMember.nextOfKin = nextOfKin.value;
      thisMember.nokPhone = nokPhone.value;
      let commString = '';
      if (commArray.value != undefined) {
        // convert committeee array back to a string for database
        if (commArray.value.length > 0) {
            for (const p of commArray.value) {
                commString += p;
                commString += ' ';
            }
           thisMember.committee= commString;
          }
      }
      

     if (newMember) {
      thisMember.joinedDate = new Date();
      const res = await myFetch(apiMethods.saveMember,thisMember);
      if (res === null) 
        return;   // ??? is this correct ???
      const id = parseInt(res);
      if (Number.isInteger(id)) {
        await Message('Member has been saved: new member number is ' + id);
      }
      else {
        await AlertError('Save Member Error',res);
        return;
      }
    }
    else {
      const res = await myFetch(apiMethods.editMember,thisMember);
      if (res === null) 
        return;
      if (res=="OK") {
        await Message('Edited member has been saved');
      }
      else {
        await AlertError('Save Member Error',res);
        return;
      }
    }
    memberDialog.value = false;
    emit('doneMemberEdit');
  })

}

function newDate(newDate : Date) {
  paidDate.value = newDate;
  dateChanged.value = true;
}
</script>

<template>
    
    <v-card class="pa-3" >
    
      <v-card-title class="headline black" primary-title>
        {{newMember? 'Add a new TCC Member':'Edit an existing TCC Member'}}
      </v-card-title>

      <v-card-subtitle>
        These details can only be seen by you and the club membership secretary.
      </v-card-subtitle>
      <v-card-subtitle>
         Next-of-kin details can also be seen by other members that are on a ride that you are on, in case of an accident - but only on the day of that ride.
      </v-card-subtitle>
      <v-card-text class="pa-3">
        <v-form @submit.prevent="submit"  ref="memberForm">
      
          <div   >
            <v-row >
              <v-col cols="5"   >
                  <v-text-field density="compact" variant="outlined" :label=" 'First Name'" 
                    v-model="fname"
                    :rules="nameRules"
                    hint=''/>
              </v-col>
              <v-col cols="5"  >
                  <v-text-field density="compact"   variant="outlined" label="Surname" 
                   v-model="name"
                   :rules="nameRules"
                   hint=""/>
              </v-col>
              <v-col cols="2"  >
                  <v-text-field density="compact"   variant="outlined" label="Gender" 
                   v-model="gender"
                   :rules="genderRules"
                   hint=""/>
              </v-col>
            </v-row>
            <v-row >
              <v-col cols="5"  class="ml-3 mr-3" >
                <v-row>
                  <v-text-field density="compact"  :rules="addressRules" variant="outlined" label="Address1"   v-model= "address1"/>
                </v-row>
                <v-row>
                  <v-text-field density="compact"  :rules="addressRules"  variant="outlined" label="Address2"   v-model= "address2"/>
                </v-row>
                <v-row>
                  <v-text-field density="compact"   variant="outlined" label="Address3"   v-model= "address3"/>
                </v-row>
                <v-row>
                  <v-text-field density="compact"  :rules="addressRules"  variant="outlined" label="Postcode"   v-model= "postcode"/>
                </v-row>
                <v-row>
                  <v-text-field density="compact"   variant="outlined" label="Telephone"   v-model= "telephone"/>
                </v-row>
                <v-row>
                  <v-text-field density="compact"   :rules="emailRules"  variant="outlined" label="Email"   v-model= "email"/>
                </v-row>
              </v-col>
              <v-col cols="5" class="ml-3 mr-3" >
 
                <v-row v-if="fullEdit">                  Committee position(s):</v-row>
                <v-row v-if="fullEdit">
                  <v-col cols="6">
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Secretary" value="secretary"></v-checkbox>
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Chair" value="chair"></v-checkbox>
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Membership" value="membership"></v-checkbox>
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Social" value="social"></v-checkbox>
                  </v-col>
                  <v-col cols="6">
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Racing" value="racing"></v-checkbox>
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Kit" value="kit"></v-checkbox>
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Marketing" value="marketing"></v-checkbox>
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Non-Exec" value="nonexec"></v-checkbox>
                  </v-col>
                </v-row>
                <v-row>
                  <v-text-field density="compact"   variant="outlined" label="Next of kin"  v-model= "nextOfKin"/>
                </v-row>
                <v-row>
                  <v-text-field density="compact"   variant="outlined" label="next-of-kin Phone" v-model= "nokPhone"/>
                </v-row>
              </v-col>
            </v-row>

          <v-row  v-if="fullEdit">
            <v-col cols="6">
              WhatsApp groups (Committee group defined by committee position):
            </v-col>
           
            <v-col>
              <v-checkbox  v-model="waChat" label ='Chat group' hide-details/>
            </v-col>
            <v-col>
              <v-checkbox  v-model="waInfo" label ='Info group' hide-details/>
            </v-col>
            <v-col>
              <v-checkbox  v-model="waLeisure" label ='Leisure group' hide-details/>
            </v-col>
            
          </v-row>

          <v-row  v-if="fullEdit">
              <v-col cols="3"   >
                  <v-text-field density="compact" variant="outlined" label="Subscription amount (£)" 
                    v-model="subs"
                    :rules="subsRules"
                    hint='Annual subs in £'/>
              </v-col>
              <!-- <v-col cols="1" offset = 2  v-if="calendarShown">
                Paid date
              </v-col> -->
              <v-col cols="2" >
                <v-btn  color="green"   @click="calendarShown=!calendarShown">Edit paydate</v-btn>
              </v-col>

              <v-col cols="2" v-if="calendarShown">
                    <DateSelector :icon="false" 
                    :key="showDate"
                      :text="date.toDateString()"
                      :date="date"
                      @new-date="newDate"   />
              </v-col>
              <v-col cols="5"></v-col>
            </v-row>
          <!-- </v-container> -->
          </div>
  
          <v-row >
            <v-col  v-if="!newMember && fullEdit">
              <v-btn  block color="green"    @click="deleteMember()">Delete Member</v-btn>
            </v-col>
            <v-col>
              <v-btn block color="green"  variant="outlined" @click="cancel()" >Cancel Edit</v-btn>
            </v-col>
            <v-col >
              <v-btn block color="green" type="submit"  >Save Member</v-btn>
            </v-col>

          </v-row>
        </v-form>
      </v-card-text>
  
    </v-card>
  <!-- </div> -->
  
  </template>
<style>
  .scrollable {
   overflow-y: scroll;
   }
   .v-btn__content {
    white-space: normal;
    flex: auto;
  }

</style>

