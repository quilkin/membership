
<script setup lang="ts">

/**
 * Create a new member or edit an existing one
 */
import { ref, type Ref, onBeforeMount, onMounted, onBeforeUpdate} from 'vue'
import { nameRules, genderRules, subsRules, emailRules,addressRules, phoneRules } from '../utils/rules'
import { myFetch } from '@/utils/fetch'
import { apiMethods } from '../../../membership-server/src/common/apimethods'
import { Member } from '../../../membership-server/src/common/member'
import { Alert, Message, YesNo, AlertError } from '../utils/alert'
import DateSelector  from './dateSelector.vue'

// values that can be edited
const commArray= ref(['']);
const fname = ref('');
const surname = ref('');
const subs = ref(20);
const paidDate = ref(new Date());
const nowDate = ref(new Date());
const joinedDate = ref(new Date());
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
const PayCalendarShown = ref(false);
const joinCalendarShown = ref(false);

let newMember = true;     // false for editing an existing one

let thisMember : Member;

const memberDialog = ref(false);

const emit = defineEmits(['doneMemberEdit','logIn']);
const memberForm = ref();

const fullEdit = ref(false);

const props = defineProps<{
  member : Member
  onCommittee : boolean
}>()

onBeforeMount(async() => {

  if (props.member.number> 0) {
    // editing existing member
    newMember = false;
  }
  if (props.onCommittee == false) {
        // editing user's own profile
    newMember = false;
  }
  if (props.onCommittee)
    fullEdit.value = true;
 // console.log('OnBeforeMount: '+props.member.email);
  update();
  thisMember = props.member;
})

onBeforeUpdate(async() => {

  if (props.onCommittee)
    fullEdit.value = true;
  // console.log('OnBeforeUpdate: '+props.member.committee);
  update();
    thisMember = props.member;
  if (props.member.number> 0) {
    // editing existing ride
    newMember = false;
  }
  else
    newMember = true;
})

/**
 * update the page with new values
 */
function update() {
    if (props.member === undefined)
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
    surname.value = thisMember.surname;
   gender.value = thisMember.gender;
    paidDate.value = thisMember.paidDate;
     joinedDate.value = thisMember.joinedDate;
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
      thisMember.surname = surname.value ;
      thisMember.gender = gender.value  ;
      if (dateChanged.value)
        thisMember.paidDate = paidDate.value;
      thisMember.joinedDate = joinedDate.value;
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
           
          }
      }
      thisMember.committee= commString;

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
        if (props.onCommittee==false) {
          // close wwindow so that ridehub appears again
          window.close();
        }
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

function newPayDate(newDate : Date) {
  paidDate.value = newDate;
  dateChanged.value = true;
}
function newJoinDate(newDate : Date) {
  joinedDate.value = newDate;

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
                   v-model="surname"
                   :rules="nameRules"
                   hint=""/>
              </v-col>
              <v-col  v-if="fullEdit" cols="2"  >
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
                  <v-text-field density="compact"    variant="outlined" label="Address2"   v-model= "address2"/>
                </v-row>
                <v-row>
                  <v-text-field density="compact"   variant="outlined" label="Address3"   v-model= "address3"/>
                </v-row>
              </v-col>
              <v-col cols="5"  class="ml-3 mr-3" >
                <v-row>
                  <v-text-field density="compact"  :rules="addressRules"  variant="outlined" label="Postcode"   v-model= "postcode"/>
                </v-row>
                <v-row>
                  <v-text-field density="compact"   :rules="phoneRules" variant="outlined" label="Telephone"   v-model= "telephone"/>
                </v-row>
                <v-row>
                  <v-text-field density="compact"   :rules="emailRules"  variant="outlined" label="Email"   v-model= "email"/>
                </v-row>
              </v-col>
            </v-row>
            <v-row v-if="fullEdit">                  Committee position(s):</v-row>
            <v-row v-if="fullEdit">
                  <v-col cols="6">
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Secretary" value="secretary"></v-checkbox>
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Chair" value="chair"></v-checkbox>
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Membership" value="membership"></v-checkbox>
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Social" value="social"></v-checkbox>
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Edit Members?" value="memberlist"></v-checkbox>
                  </v-col>
                  <v-col cols="6">
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Racing" value="racing"></v-checkbox>
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Kit" value="kit"></v-checkbox>
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Marketing" value="marketing"></v-checkbox>
                    <v-checkbox class="mt-n6" v-model="commArray" hide-details label="Non-Exec" value="nonexec"></v-checkbox>
                  </v-col>
            </v-row>
            <v-row>
                  <v-card-subtitle>
                     Emergency contact details can also be seen by other
                  </v-card-subtitle>
                  <v-card-subtitle>
                      members that are on a ride that you are on, in case 
                  </v-card-subtitle>
                  <v-card-subtitle>
                     of an accident - <b>but only on the day of that ride.</b>
                  </v-card-subtitle>
            </v-row>
            <v-row>
                <v-col cols="6">
                  <v-text-field density="compact"   variant="outlined" label="Emergency contact"  v-model= "nextOfKin"/>
                </v-col>
                <v-col cols="6">
                  <v-text-field density="compact"   variant="outlined" label="Contact's phone" v-model= "nokPhone"/>
                </v-col>
             
            </v-row>

          <v-row  v-if="fullEdit">
            <v-card-subtitle>
              WhatsApp groups :
            </v-card-subtitle>
          </v-row>
          <v-row v-if="fullEdit">
            <v-col cols="4">
              <v-checkbox  v-model="waChat" label ='Chat group' hide-details/>
            </v-col>
            <v-col cols="4">
              <v-checkbox  v-model="waInfo" label ='Info group' hide-details/>
            </v-col>
            <v-col cols="4">
              <v-checkbox  v-model="waLeisure" label ='Leisure group' hide-details/>
            </v-col>
          </v-row>

          <v-row  v-if="fullEdit">
              <v-col cols="4"   >
                  <v-text-field density="compact" variant="outlined" label="Subs paid(£)" 
                    v-model="subs"
                    :rules="subsRules"
                    hint='Annual subs in £'/>
              </v-col>

              <v-col cols="3" >
                <v-btn  color="green"   @click="PayCalendarShown=!PayCalendarShown">Edit paydate</v-btn>
              </v-col>

              <v-col cols="5" v-if="PayCalendarShown">
                    <DateSelector :icon="false" 
                      :key="showDate"
                      :text="nowDate.toDateString()"
                      :date="nowDate"
                      @new-date="newPayDate"   />
              </v-col>
            </v-row>
            <v-row v-if="fullEdit">
              <v-col cols="3"></v-col>
              <v-col cols="3">
                <v-btn  color="green"   @click="joinCalendarShown=!joinCalendarShown">Edit joining date</v-btn>
              </v-col>
              <v-col cols="5"  v-if="joinCalendarShown">
                    <DateSelector :icon="false" 
                    :key="showDate"
                      :text="nowDate.toDateString()"
                      :date="nowDate"
                      @new-date="newJoinDate"   />
              </v-col>
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
              <v-btn v-if="thisMember.email.length > 0" block color="green" type="submit"  >Save Details</v-btn>
              <v-btn v-if="thisMember.email.length == 0" block color="green" type="submit"  >Save Member</v-btn>
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

