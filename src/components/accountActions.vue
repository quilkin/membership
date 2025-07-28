<script setup lang="ts">

/**
 * Controlling the four sub-views under ./account
 */
import { ref, onMounted, onUpdated,  onBeforeMount } from 'vue'
import login from './account/login.vue'
import account from './account/account.vue'
import { myFetch } from '../utils/fetch'
import { apiMethods} from '../../../membership-server/src/common/apimethods'
import { User, Roles} from '../../../membership-server/src/common/user'
import { Message, AlertError } from '../utils/alert'

const props = defineProps<{
  user : User
}>()

// todo: i don't think we need this
enum Status {
        loggingIn,
        loggedIn,
        signingUp,
        reqPassword,
        acccountPage
}

const status = ref(Status.loggingIn);
// used to transfer from RideHub
const userEmail = ref('');
let currentUser : User;

let updated = false;

onBeforeMount( () => {
          // check for (and act on) any URL params for being called from RideHub to edit personal details
  
   let urlParams = new URLSearchParams(window.location.search);
   const email = urlParams.get('email');
   if (email != null) {
        userEmail.value = email;
   }
})

onMounted(async() => {

  currentUser = props.user;


  })
  onUpdated(() => {
        if (updated) 
                return;
        if (props.user != undefined && props.user.id>0)
        {
                currentUser = props.user;
                if (status.value != Status.reqPassword && status.value != Status.signingUp)
                        status.value =  props.user.role>Roles.None ? Status.loggedIn : Status.loggingIn;
        }
        updated = true;
  })
  
const emit = defineEmits(['doneLogin','doneAccount','logout'])

function loggedIn(user : User) {
        emit('doneLogin',user);
}
function doneAccount() {
        emit('doneAccount',props.user);
}


</script>

<template>
    <login  v-if="status===Status.loggingIn"
        :useremail="userEmail"
            @logged-in="loggedIn"
            ></login>

    <account v-else
            :user="currentUser"
            @done-account="doneAccount"
            @logout="emit('logout')"
    ></account>
</template>

