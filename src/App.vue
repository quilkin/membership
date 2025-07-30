<script setup lang="ts">

/**
 * Main app file 
 * Create and control tabs, call child components
 */
import { ref, computed, type Ref } from 'vue'
import accountActions from './components/accountActions.vue'
import MemberEdit from './components/editMember.vue'
import MemberList from './components/memberlist.vue'
import Stats from './components/stats.vue'
import { myFetch } from '@/utils/fetch'
import { apiMethods } from '../../membership-server/src/common/apimethods'
import { Member} from '../../membership-server/src/common/member'
import { User, Roles} from '../../membership-server/src/common/user'
import { AlertError, Message } from './utils/alert'
import { Tabs } from './utils/tabs'
import { mdiAccountEdit ,mdiAccountPlus, mdiAccountMultiple, mdiFormatListNumberedRtl} from '@mdi/js'
import { Localise } from '@/utils/localise';

const currentTab = ref(Tabs.account);
const currentUser = ref(new User('',''));
const currentMember = ref(new Member());
const editing = ref(false);
const memberListChanged = ref(0);
const onCommittee = ref(true);
const editKey = ref(0);

import { useDisplay } from 'vuetify'
const { mobile } = useDisplay();

function switchTab(tab: Tabs) {
  currentTab.value = tab;
}
function logIn()
{
  switchTab(Tabs.account);
}
function editMember(member : Member)
{
  currentMember.value = member;
  switchTab(Tabs.newMember);
  editing.value = true;

}

/**
 * This may be redundant; users mow need to log in when app starts
 */
function checkLogIn()
{

  if (currentUser.value.role==Roles.None)
    {
        // not logged in, not allowed to see details or join a ride
        Message('You need to sign in to continue')
        logIn();
        return false;
    }
    return true;
}

/**
 * After successful login, regsiter current user and go to calendar page (rides list)
 * @param user 
 */
async function doneLogin(user : User) {
  if (user===null || user==undefined)
    return;

  currentUser.value = user;   // Ridehub username
  onCommittee.value = false;
  // find if user is on the committee
  const res = await myFetch(apiMethods.findMember,user.email);
  if (res.length > 1) {
         AlertError("error"," there is more than one member with this email.");
        return;
      }
  if (res.length == 1) {
    currentMember.value = res[0];
    const commttee = currentMember.value.committee.toLowerCase();
    if (commttee.includes('membership') || commttee.includes('chair'))
      onCommittee.value = true;
  }
  if (currentMember.value.number == 0) {
    AlertError("Member not found in database","Either you're not a paid-up TCC member, or the enmail used for RideHub is not the same as the one in the membership list. Please contact the membership secretary")
    return;
  }
  // now we definately know the member, force update of edit page 
  editKey.value += 1;

  if (onCommittee.value)
    // only these can see everything
    switchTab(Tabs.members);
  else // can just edit themselves 
  {
    editing.value = true;
    switchTab(Tabs.newMember);
  }

}

/**
 * After making changes to a user's account details
 * @param user 
 */
function doneAccount(user : User) {
  currentUser.value = user;
     switchTab(Tabs.members);
}
/**
 * called after password has been reset
 */
function logout()
{
  currentUser.value = new User('','');
  switchTab(Tabs.members);
}
function doneMemberEdit() {
  editing.value = false;
  ++memberListChanged.value;
  switchTab(Tabs.members);
}


function tabChanged() {

  if (currentTab.value === Tabs.exit) {
    //window.close();
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    
  }
  if (currentTab.value === Tabs.newMember) {

    currentMember.value = new Member();
    //currentMember.value.meetingAt = Localise.meetingPoint;

    editing.value = true;
  }
    
  if (currentTab.value === Tabs.members) {
    // force reload of data
    ++memberListChanged.value;
  }

  
}


function calendarClicked() {
  ++memberListChanged.value;
}

const tabWidth= computed(() => {
    return mobile.value? {'min-width': '20vw'} : {'min-width': '70px'} 
})

</script>

<template>
  <v-sheet >
    <v-row no-gutters>
    <v-col > 
      <v-tabs 
      v-model="currentTab"
      bg-color="green-lighten-4"
      center-active
      color="green"
      show-arrows
      stacked
      height="8vh"
      :grow="mobile===false"
      @update:model-value="tabChanged"
      >
      <v-tab v-if="onCommittee" :value=Tabs.members :style="{...tabWidth}" @click="calendarClicked">  <v-icon :icon="mdiAccountMultiple"/> Members</v-tab>
      <v-tab :value=Tabs.newMember :style="{...tabWidth}">   <v-icon :icon="mdiAccountPlus"/> Edit/New member</v-tab>
      <v-tab v-if="onCommittee" :value=Tabs.account :style="{...tabWidth}">    <v-icon :icon="mdiAccountEdit"/>  Account</v-tab>
      <v-tab v-if="onCommittee" :value=Tabs.stats :style="{...tabWidth}">    <v-icon :icon="mdiFormatListNumberedRtl"/>        Stats</v-tab>

    </v-tabs>

      <v-window v-model="currentTab">
        <v-window-item  v-if="onCommittee" :value=Tabs.members>
          <v-container >
                <MemberList
                 :key = "memberListChanged"
                 :user = "currentUser"

                 @log-in="logIn"
                 @edit-member="editMember"

                 >
                </MemberList>
            </v-container>
        </v-window-item>

        <v-window-item :value=Tabs.newMember>
          <v-container  class=" scrollable">
                <MemberEdit v-if="checkLogIn() && editing"
                :key = "editKey"
                :member="currentMember"
                :onCommittee="onCommittee"
                @log-in="logIn"
                @done-member-edit="doneMemberEdit"

                >
              </MemberEdit>
          </v-container>
        </v-window-item>
        

        <v-window-item  v-if="onCommittee" :value=Tabs.account>
          <v-container  class=" scrollable">
            <account-actions 
              :user="currentUser"
              @done-login="doneLogin"
              @done-account="doneAccount"
              @logout="logout"
             ></account-actions>
        </v-container>
        </v-window-item>

        <v-window-item  v-if="onCommittee":value=Tabs.stats>
          <v-container  class="">
            <Stats
            :user="currentUser"
            >
            </Stats>
          </v-container>
        </v-window-item>
      </v-window>
    </v-col>
    </v-row>
  </v-sheet>
</template>

<style>
  .scrollable {
   overflow-y: auto;
}
.v-btn--stacked.v-tab.v-btn {
    padding: 0 4px;
  }
.v-btn {
  text-transform: none;
  padding: 0;
}
</style>
