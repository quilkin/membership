<script setup lang="ts">
  import { ref , onMounted, onUpdated} from 'vue'
  import { Member } from '../../../membership-server/src/common/member'
   import { User, Roles } from '../../../membership-server/src/common/user'
  import { Email } from '../../../membership-server/src/common/email'
  import { AlertError, Message } from '../utils/alert'
  import { mdiEmailPlus, mdiEmailEdit } from '@mdi/js'
   import { myFetch } from '@/utils/fetch'
import { apiMethods } from '../../../membership-server/src/common/apimethods'

  const props = defineProps<{ 
    user : User,   }>();

  const emit = defineEmits(['detailsDone','editMember']);
  const emailActive = ref(true);
  const groupChosen = ref(0);
  const subject = ref ('');
  const body = ref('');
  const attach = ref(null);
  const to = ref('');

   let user = props.user;

  onUpdated(() => {

    user = props.user
  })
 


 function closeDetails() {
    emailActive.value = false;
 }

function chosen() {
  switch (groupChosen.value) {
    case 0: default: to.value = ''; return ''; 
    case 1: to.value = user.email; return user.email;
    case 2: to.value = 'committee'; return 'Every committee member';
    case 3: to.value = 'all'; return 'Every club member';
  }
}

async function prepareEmail()
{
  // const upload = multer({ dest: 'uploads/' });
  const mail = new Email();
  mail.to = to.value;
  mail.body = body.value;
  mail.subject = subject.value;
  mail.attach = null;  // for now..... to do

  const res = await myFetch(apiMethods.groupEmail,mail);
      if (res === 'OK') 
        await Message('emails sent OK');
      else 
        await AlertError('email send failed',res);
      closeDetails();
}
</script>

<template>
  <div class="text-center">
    <v-btn block  variant='outlined'  :prepend-icon="mdiEmailEdit" @click=" emailActive=true;" >
        Send email(s)
    </v-btn>
    
      <v-dialog 
        
        v-if="emailActive"
        activator="parent"
        
        content-class="details-dialog"
      >

      <v-card title="Send group email" max-width="550">
        <v-row>
          <v-col cols = 3>
            <v-card-text  >   Send to: </v-card-text>
          </v-col>
          <v-col cols = 3 v-if="groupChosen==0">
            <v-btn color="green"   variant='outlined' @click="groupChosen=1" >Just me (test)</v-btn>
          </v-col>
          <v-col cols = 3 v-if="groupChosen==0">
            <v-btn color="green"   variant='outlined'  @click="groupChosen=2" >All committee</v-btn>
          </v-col>
            <v-col cols = 3 v-if="groupChosen==0">
            <v-btn color="green"   variant='outlined'  @click="groupChosen=3" >All members</v-btn>
          </v-col>
          <v-col cols = 9 v-if="groupChosen>0"><v-card-text  @click="groupChosen=0">{{chosen()}}</v-card-text></v-col>
        </v-row>
        <v-row>
            <v-text-field class="mr-6 ml-6" clearable density="compact" variant="outlined" label="Subject" hint="" v-model = "subject">
            </v-text-field>
        </v-row>
        <v-row>
            <v-textarea class="mr-6 ml-6" clearable density="compact" variant="outlined" label="Message" hint="" v-model = "body"/>
        </v-row>
        <v-row>
            <v-col cols="8"  >
                  <v-file-input  density="compact" variant="outlined"
                      accept=".pdf,.txt,.docx"
                      label="Add attachment (pdf, txt, docx)"
                      :prepend-icon="mdiEmailPlus"
                ></v-file-input> 
            </v-col>
            <v-col cols = 2>
              <v-btn color="green"   variant='outlined' @click="closeDetails()">Cancel</v-btn>
            </v-col>
            <v-col cols = 2>
              <v-btn color="green"  @click="prepareEmail()" >Send</v-btn>
            </v-col>
        </v-row>
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
