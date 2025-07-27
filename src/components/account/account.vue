
<script setup lang="ts">
/**
 * Code to deal with a user who wants to change account details
 */

import { ref, onBeforeMount, onUpdated } from 'vue'
import {nameRules, emailRules, pwRules} from '../../utils/rules'
import { myFetch } from '../../utils/fetch'
import { apiMethods } from '../../../../membership-server/src/common/apimethods'
import { User } from '../../../../membership-server/src/common/user'
import { Alert, AlertError } from '../../utils/alert'
import { mdiEye } from '@mdi/js'
import { mdiEyeOff } from '@mdi/js'


const userName = ref('');
const email = ref('');
const password1 = ref('');
const password2 = ref('');
const showPass = ref(false);
const accountDialog = ref(false);
const accountForm = ref();
const emit = defineEmits(['doneAccount'])

const props = defineProps<{
  user : User
}>()

onBeforeMount(async() => {
        if (props.user != undefined) {

            userName.value = props.user.name;
            email.value = props.user.email;
            password1.value = '';
            password2.value = '';

        }

  })

  /**
   * submit the form for changing account details
   */
async function submit() {
  if (accountForm.value != null) {
  const {valid} = await accountForm.value.validate()

  if (valid) {
    let creds  = { 
      id: props.user?.id,
      // only send user and email if they have been changed
      name: props.user?.name === userName.value? '':userName.value,
      email: props.user?.email === email.value? '' : email.value,
      pw: password1.value,

    };
    myFetch(apiMethods.changeAccount,creds)
    .then(async (response) => {
      if (response != null) {
        if (response == 'OK') {
          await Alert('Registration', "Your details have been saved",'','info','OK');
          // close current page and re-open, in normal fashion (i.e.no attributes)
          let thisWindow = window.location.href;
          let qmark = thisWindow.indexOf('?');
          thisWindow = thisWindow.substring(0,qmark-1);
          window.open(thisWindow,"_self")
        }
        else {
          await AlertError('Registration',response);
        }
      }
      else {
        await AlertError( 'Update unsuccessful','Could not contact server');
      }
    })
  }
}
}
function cancel() {
    accountDialog.value = false;
    emit('doneAccount');
}

</script>

<template>
    
  <div class="d-flex align-center flex-column">
   <v-card >
      <v-card-title class="headline black" primary-title>
        TCC Membership / RideHub account
      </v-card-title>
      <v-card-text> Same username and password as used for RideHub</v-card-text>
      <v-card-text class="pa-1">
        <v-form @submit.prevent="submit" ref="accountForm">
          <v-row no-gutters>
            <v-col   class="pa-1" >
              <v-text-field v-model="userName"   autocapitalize="off" :rules="nameRules"  label="Username"
               :placeholder=userName >
              </v-text-field>
            </v-col>
            <v-col    class="pa-1">
              <v-text-field v-model="email"     :rules="emailRules" label="Email"
               :placeholder=email >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row  no-gutters>
            <v-col   class="pa-1"  >
              <v-text-field v-model="password1" :rules="pwRules" :append-inner-icon="showPass ? mdiEye : mdiEyeOff"
                @click:append-inner="showPass = !showPass"   :type="showPass ? 'text' : 'password'" 
                label="Password" placeholder="******"  
                hint="Leave blank if you don't want to change" persistent-hint>
              </v-text-field>
            </v-col>
            <v-col   class="pa-1"   >
              <v-text-field v-model="password2" :append-inner-icon="showPass ? mdiEye : mdiEyeOff"
                @click:append-inner="() => (showPass = !showPass)" :type="showPass ? 'text' : 'password'"
                label="Confirm password" placeholder="******"
                 hint="Leave blank if you don't want to change" persistent-hint>
              </v-text-field>
            </v-col>
          </v-row>

          
          
          <v-row >
            <v-col>
              <v-btn block color="green"  variant="outlined" @click="cancel()" class="mt-2">    Cancel       </v-btn>
            </v-col>

            <v-col>
              <v-btn block color="green" type="submit"  class="mt-2">   Update your account   </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>

  </template>
