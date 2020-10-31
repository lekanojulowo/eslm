/* custom utility functions */
const customRedirect = loc => loc ? window.location.assign(loc) : '';
const ucword = word => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '';
const $q = document.querySelector.bind(document);

function savePDF() {
  const pdfDoc = new jsPDF('p', 'px', 'A4');
  pdfDoc.addImage(logourl, 'JPEG', 115, 20, 200, 50);
  pdfDoc.fromHTML($q('#offer-letter'), 30, 75);
  pdfDoc.addImage(signatureurl, 'JPEG', 30, 555, 50, 20);
  pdfDoc.fromHTML($q('#dg-details'), 30, 575);

  pdfDoc.save('OfferLetter.pdf');
}

function noZeroObjectValue(obj) {
  let newObj = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (+value !== 0) {
      newObj[key] = value;
    }
  })
  return newObj;
}

function validate(field) {
  const {
    target,
    target: {
      validity: { valid },
    },
  } = field;
  if (!valid) {
    target.classList.add('is-invalid');
    target.focus();
  } else {
    target.classList.remove('is-invalid');
  }
};

function formatAge(dob, yr = '') {
  return (dob && dob.length > 3 ? (new Date().getFullYear() - new Date(dob).getFullYear()) + yr : '');
}

const { mapState, mapGetters, mapActions } = Vuex;

/* Global Filters */
Vue.filter('padZero', str => (+str < 10 ? '0' : '') + str); // filter @param by padding it with 0 
Vue.filter('unknownRoute', str => router.push(str)); // push unknown routes to 404 
Vue.filter('uppercase', str => str.toUpperCase());
Vue.filter('lowercase', str => str.toLowerCase());
Vue.filter('capitalize', str => str.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' '));
Vue.filter('replaceStr', (str, oldChar, newChar) => str.replace(oldChar, newChar));
Vue.filter('formatAge', (str, yr = '') => (str && str.length > 3) ? new Date().getFullYear() - new Date(str).getFullYear() + yr : '');

/* Global Mixins */
const alertMixin = {
  data() {
    return {
      showAlert: false,
      alertVariant: '',
      alertMsg: '',
      dismissSecs: 0
    }
  },
  methods: {
    setAlert(msg, variant, secs) {
      this.alertMsg = msg;
      this.alertVariant = variant;
      this.dismissSecs = secs || 5;
      this.showAlert = true;
    },
  }
};

// General Component
const PasswordInput = {
  // global component
  template: `
			<b-form-group :description="description" :label="label" :label-for="id" :label-align="labelAlign" :state="validatePass" :invalid-feedback="feedback">
				<b-input-group >
				<b-input-group-prepend is-text><b-icon icon="key"></b-icon></b-input-group-prepend>
					<input class="form-control" :id="id" :type="type" :placeholder="placeholder" @input="$emit('input',$event.target.value)" @blur="validateField($event)" :value="value" aria-label="Password" minlength="4" required></input>
					<b-input-group-append is-text><b-icon :icon="icon" @click="showPass=!showPass"></b-icon></b-input-group-append>
				</b-input-group>
			</b-form-group>
				`,
  props: {
    placeholder: String,
    label: String,
    description: String,
    value: String,
    labelAlign: String,
    id: String,
  },
  data: () => ({ showPass: false, feedback: 'Password is too short' }),
  computed: {
    icon() {
      return this.showPass ? 'eye-slash-fill' : 'eye-fill';
    },
    type() {
      return this.showPass ? 'text' : 'password';
    },
    validatePass() {
      return this.value ? this.value.length >= 4 : null;
    },
  },
  methods: {
    validateField(field) {
      validate(field);
    },
  },
};

const PageLogin = {
  // global component
  template: `
    <div class=""> 
      <show-alert :alert-variant="alertVariant" :alert-msg="alertMsg" :show-alert="showAlert" :dismiss-secs="dismissSecs"></show-alert>          
      <div class="shadow p-1">
				<b-form @submit.prevent="formSubmit()" v-show="showForm">
						<h4 class="text-white bg-success text-center py-2 rounded">
						<b-icon icon="box-arrow-in-down-right"></b-icon> Login</h4>							
						<b-form-group label="User ID" label-align="center" label-for="username">
              <b-input-group>
                <b-input-group-prepend is-text><b-icon icon="shield-lock"></b-icon></b-input-group-prepend>
                <b-form-input id="username" v-model="uForm.username" trim required></b-form-input>
              </b-input-group>
            </b-form-group>
						<b-form-group label="Mobile Number / Email" description="Please enter either mobile number or email, but not both" label-align="center" label-for="mobbile_no" v-if="forgetPasswd">
              <b-input-group>
                <b-input-group-prepend is-text><b-icon icon="telephone-plus-fill"></b-icon></b-input-group-prepend>
                <b-form-input id="mobile_no" v-model="uForm.mobile_no" placeholder="enter mobile number / email" trim required></b-form-input>
              </b-input-group>
            </b-form-group>
            <password-input label-align="center" :label="forgetPasswd ? 'New Password' : 'Password'" v-model.trim="uForm.passwd" :value="uForm.passwd"></password-input>
            <b-nav align="center" tabs>
              <b-nav-item @click="forgetPasswd=false" v-if="forgetPasswd">login</b-nav-item>
              <b-nav-item @click="forgetPasswd=true" v-else>forgot password</b-nav-item>
            </b-nav>
            <div class="mt-2 text-center">
              <b-button size="sm" class="mr-2" variant="danger" @click="hideModal"><b-icon icon="x-circle-fill"></b-icon>&nbsp;Cancel</b-button>	
              <b-button class="thm-btn" variant="danger" type="submit"><b-icon icon="box-arrow-in-right"></b-icon>&nbsp;{{ forgetPasswd ? 'Submit' : 'Login' }}</b-button>	
            </div>			
        </b-form>
        <b-alert :show="!showForm">Processing... Please wait... <b-spinner></b-spinner></b-alert>
			</div>
    </div>
  `,
  props: { hideModal: Function },
  mixins: [alertMixin],
  data() {
    return {
      uForm: { mobile_no: '', username: '', passwd: '' },
      forgetPasswd: false,
      showForm: true,
    };
  },
  methods: {
    ...mapActions(['setLoading', 'setLogin', 'setCurUser']),
    formSubmit() {
      this.showForm = false;
      let isAdmin = this.uForm.username.toLowerCase().startsWith('admin');
      let url = isAdmin ? 'api/login_admin.php' : 'api/login.php';
      axios
        .post(url, this.uForm)
        .then(res => {
          // console.log(res.data)
          if (res.data.id) {
            this.setCurUser(res.data);
            this.setLogin(true);
            this.hideModal();
            isAdmin ? router.push('/admin') : router.push('/applicant');
          } else {
            this.setAlert(`${res.data}`, 'danger', 10);
            this.showForm = true;
          }
        })
        .catch(err => {
          this.setAlert(`${err.message}`, 'danger');
          this.showForm = true;
        });
    },
  },
};

const TopNavbar = {
  // global component
  template: `
    <div>
      <b-row align-h="around">
        <b-col cols="auto">
          <b-nav align="center" v-if="login" key="logout-btn">
            <b-nav-item href="./"><b-button class="thm-btn" size="sm" variant="danger"><b-icon icon="box-arrow-left"></b-icon> Logout</b-button></b-nav-item>            
          </b-nav>
          <b-nav align="center" v-else key="login-btn">
            <b-nav-item><b-button v-b-modal.login-modal class="thm-btn text-uppercase" size="sm" variant="danger">Login</b-button></b-nav-item>
            <b-nav-text class="text-muted small text-break login-text">have you applied? Kindly login here</b-nav-text>
          </b-nav>
        </b-col>
        <b-col cols="auto">
          <b-nav align="center">
            <b-nav-text class="text-muted"><b-icon icon="telephone-inbound-fill" class="thm-text"></b-icon> Phone: +2348030000000</b-nav-text>&nbsp;&nbsp;
            <b-nav-text class="text-muted"><b-icon icon="envelope-fill" class="thm-text"></b-icon> Email: meda@ekitistate.gov.ng</b-nav-text>
          </b-nav>
        </b-col>
      </b-row>
      <b-modal id="login-modal" ref="login-modal" no-close-on-backdrop centered hide-footer ok-only ok-title="Cancel" ok-variant="danger">
        <page-login :hide-modal="hideModal"></page-login>
      </b-modal>
    </div>
  `,
  computed: {
    ...mapState(['login']),
  },
  components: { 'page-login': PageLogin },
  methods: {
    hideModal() {
      this.$refs['login-modal'].hide();
    },
  },
};
/* 
toggleable="sm"
*/

const MainNavbar = {
  // global component
  template: `
    <b-navbar variant="light" type="light" class="py-0 px-2 shadow" toggleable="sm" sticky>
      <b-navbar-brand to="/" class="d-flex align-items-center">
        <b-img :src="logo" class="brand-logo"></b-img>
        <div class="text-center thm-text pl-2">
        <b-img :src="eslm" class="sub-logo"></b-img>
        <p class="small mb-0 pb-0 brand-text">Ekiti State Land Management<br> Online Portal</p>
        </div>
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse" class="p-1 thm-text"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item to="/">Home</b-nav-item>
          <b-nav-item to="/lands">Lands</b-nav-item>
          <b-nav-item to="/howitworks">How it Works</b-nav-item>
          <b-nav-item to="/agents">Contact</b-nav-item>
          <b-nav-item to="/cart"><b-icon icon="cart-check"></b-icon><b class="thm-text h5 m-0 p-0">0</b></b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  `,
  data() {
    return {
      logo: 'assets/images/logo.png',
      eslm: 'assets/images/eslm.jpg',
    };
  },
  computed: {
    ...mapState(['brandName', 'brandDescription']),
  },
};

const CarouselSlide = {
  // global component
  template: `
    <div>
      <b-carousel img-width="1024" img-height="300" :interval="2000" controls fade>
        <b-carousel-slide v-for="s in slideImages" :img-src="s.img" :key="s.id">
        </b-carousel-slide>
      </b-carousel>
    </div>
  `,
  data() {
    return {
      slideImages: [{
          id: uuidv4(),
          img: 'assets/images/slider/1.jpg',
        },
        {
          id: uuidv4(),
          img: 'assets/images/slider/2.jpg',
        },
        {
          id: uuidv4(),
          img: 'assets/images/slider/3.jpg',
        },
        {
          id: uuidv4(),
          img: 'assets/images/slider/4.jpg',
        },
        {
          id: uuidv4(),
          img: 'assets/images/slider/5.jpg',
        },
      ],
      slide: 0,
    };
  },
  methods: {},
};

/**  PageLoans */
const PageLoans = {
  template: `
    <section class="pt-5 bg-light" id="loans">     

      <div class="py-2 py-md-3 py-lg-4 text-center">
        <h3 class="text-uppercase thm-text"> <b-icon icon="grip-vertical"></b-icon> <b class="text-dark">Available</b> Lands <b-icon icon="grip-vertical"></b-icon> </h3>               
        <b-row cols="1" cols-sm="2" cols-lg="3">
          <b-col v-for="l in loans" class="my-3" :key="l.id">
            <b-card :img-src="l.img" :title="l.title">
            <i class="d-block text-muted">{{ l.desc }}</i>
              <i class="d-block text-muted"><s>N</s>{{ l.price }}</i>
              <b-link :to="l.link"><b-icon icon="cart-plus"></b-icon> add to cart</b-link>
            </b-card>
          </b-col>
        </b-row>
      </div>
    </section>
  `,
  data() {
    return {
      loans: [{
          id: uuidv4(),
          img: 'assets/images/lands/1.jpg',
          title: 'Land 1',
          desc: '3 plots',
          price: '200,000.00',
          avail: true,
          inCart: false,
          link: '',
        },
        {
          id: uuidv4(),
          img: 'assets/images/lands/2.jpg',
          title: 'Land 2',
          desc: '2 hectres',
          price: '2,000,000.00',
          avail: true,
          inCart: false,
          link: '',
        },
        {
          id: uuidv4(),
          img: 'assets/images/lands/3.jpg',
          title: 'Land 3',
          desc: '5 plots',
          price: '500,000.00',
          avail: true,
          inCart: false,
          link: '',
        },
        {
          id: uuidv4(),
          img: 'assets/images/lands/4.jpg',
          title: 'Land 4',
          desc: '4 hectres',
          price: '5,000,000.00',
          avail: true,
          inCart: false,
          link: '',
        },
        {
          id: uuidv4(),
          img: 'assets/images/lands/5.jpg',
          title: 'Land 5',
          desc: '5 acres',
          price: '20,000,000.00',
          avail: true,
          inCart: false,
          link: '',
        },
        {
          id: uuidv4(),
          img: 'assets/images/lands/6.jpg',
          title: 'Land 6',
          desc: '10 acres',
          price: '50,000,000.00',
          avail: true,
          inCart: false,
          link: '',
        },
      ],
    };
  },
  computed: {
    ...mapState(['brandName', 'brandDescription']),
  },
};

/**  PageEmpowerments */
const PageEmpowerments = {
  template: `
    <section class="py-3 py-md-4 py-lg-5 text-center bg-light" id="empowerments">
      <header class="my-2 my-md-3 my-lg-4">
        <h3 class="text-uppercase title-1">EMPOWERMENT <span class="thm-text"> PROGRAMMES</span></h3>
      </header>
      <b-row cols="1" cols-sm="2" cols-lg="3" align-h="center">
        <b-col v-for="e in empowerments" class="my-3" :key="e.id">
          <b-card :img-src="e.img" img-bottom>
            <b-card-title>{{ e.title }}</b-card-title>
            <b-card-sub-title>...</b-card-sub-title>
          </b-card>
        </b-col>
      </b-row>
    </section>
  `,
  data() {
    return {
      empowerments: [
        { id: uuidv4(), img: 'assets/images/empowerments/tricycle.jpg', title: 'TRICYCLE SCHEME', available: false },
        { id: uuidv4(), img: 'assets/images/empowerments/motorcycle.jpg', title: 'MOTORCYCLE SCHEME', available: false },
        { id: uuidv4(), img: 'assets/images/empowerments/agency-banking.jpg', title: 'AGENCY BANKING', available: false },
      ],
    };
  },
  computed: {
    // ...mapState(['brandName', 'brandDescription']),
  },
};
/**  PageProjects */
const PageProjects = {
  template: `
    <section class="pt-3 pt-md-4 pt-lg-5 pt-lg-5 text-center thm-bg" id="projects">
      <header class="my-2 my-md-3 my-lg-4">
        <h3 class="text-uppercase text-white"> <b-icon icon="grip-vertical"></b-icon> How it Works <b-icon icon="grip-vertical"></b-icon> </h3>
      </header>
      <div class="d-flex flex-wrap justify-content-center">
        <div class="bg-black text-white col-md-6" >
          <b-row cols="1"  cols-sm="2" align-h="center">
            <b-col v-for="h in hows" class="my-3" :key="h.id">
              <div class="rounded-circle thm-bg d-inline-block px-3 py-2 mb-1"><h1 class="">{{ h.sn | padZero }}</h1></div>
              <h3>{{ h.title }}</h3>
              <p>{{ h.desc }}</p>
            </b-col>
          </b-row>
        </div>
        
          <div class="col-md-6 work-flow"><b-img :src="howsImage" class="d-block d-md-none"></b-img></div>
        
      </div>
    </section>
  `,
  data() {
    return {
      hows: [{
          id: uuidv4(),
          sn: 1,
          title: 'Evaluate Land',
          desc: 'Browse through the list of available lands',
          link: '',
        },
        {
          id: uuidv4(),
          sn: 2,
          title: 'Choose Your Land',
          desc: 'Select your preferred choice of land among the list of available lands and add to cart.',
          link: '',
        },
        {
          id: uuidv4(),
          sn: 3,
          title: 'Make Payment',
          desc: 'Proceed to checkout to make payment using our range of payment methods ',
          link: '',
        },
        {
          id: uuidv4(),
          sn: 4,
          title: 'Have Your Land',
          desc: 'Then you safely and securely own your preferred choice of land',
          link: '',
        },
      ],
      howsImage: 'assets/images/howitworks.jpg',
    };
  },
  computed: {
    ...mapState(['brandName', 'brandDescription']),
  },
};

const MainFooter = {
  // global component
  template: `
      <footer class="pt-5 mb-0 bg-light thm-text" id="footer">
        <b-row align-h="center" align-v="center">
          <b-col cols="auto" class="text-center">
            <p>Copyrights &copy; {{ new Date().getFullYear() }}
              ESLM
              <span class="text-dark d-block d-sm-inline">All Rights Reserved.</span>
            </p>
          </b-col>
          <b-col cols="auto">
          <b-nav align="center">
            <b-nav-text class="text-black"><b-icon icon="telephone-inbound-fill" class="thm-text"></b-icon> Phone: +2348030000000</b-nav-text>&nbsp;&nbsp;
            <b-nav-text class="text-black"><b-icon icon="envelope-fill" class="thm-text"></b-icon> Email: eslm@ekitistate.gov.ng</b-nav-text>
          </b-nav>
        </b-col>
        </b-row>
      </footer>`,
  data() {
    return {
      telephone: 'assets/images/telephone.jpg',
      whatsapp: 'assets/images/whatsapp.jpg',
      telegram: 'assets/images/telegram.jpg',
    };
  },
  computed: {
    ...mapState(['brandName', 'brandDescription']),
  },
};

const ShowAlert = {
  // global component
  template: `
		<b-alert :variant="alertVariant" :show="alertCountDown" @dismiss-count-down="countDown" dismissible @dismissed="dismissedAlert">
			<p> {{ alertMsg }} </p>
			<b-progress :variant="alertVariant" :max="dismissSecs" :value="alertCountDown" height="0.3rem"></b-progress>
		</b-alert>`,
  props: {
    alertVariant: String,
    alertMsg: String,
    showAlert: Boolean,
    dismissSecs: { type: Number, default: 5 },
  },
  data() {
    return {
      alertCountDown: 0,
    };
  },
  methods: {
    countDown(countDown) {
      this.alertCountDown = countDown;
    },
    dismissedAlert() {
      this.alertCountDown = 0;
      this.$parent.showAlert = false;
    },
  },
  watch: {
    showAlert(newValue) {
      newValue ? (this.alertCountDown = this.dismissSecs) : '';
    },
  },
};

const Page404 = {
  // global component
  template: ` 
      <main class="p-2 text-center">      
					<b-alert show variant="danger">
					<h4 class="alert-heading">Page Not Found</h4> 
					<h5 class="alert-heading">Sorry, we can't find &quot;{{ unknownRoute }}&quot; ?</h5> 
					<p>Kindly follow the right link<p>
					<p><a class="thm-btn" href="./"><b-icon icon="house-fill"></b-icon> Back to Home</a></p>
				</b-alert>				
      </main>`,
  computed: {
    unknownRoute() {
      return this.$route.params.pathMatch.slice(1);
    },
  },
};

const ChangePasswd = {
  // global component
  template: `
    <div>      
      <show-alert :alert-variant="alertVariant" :alert-msg="alertMsg" :show-alert="showAlert" :dismiss-secs="dismissSecs"></show-alert>          
      <div class="mt-2 mb-2 border shadow p-3">
				<b-form @submit.prevent="formSubmit()">
						<h4 class="text-white thm-bg text-center p-1">
						<b-icon icon="lock"></b-icon> Change Password</h4>						
            <password-input label-align="center" label="Current Password" v-model.trim="uForm.passwd" :value="uForm.passwd" id="current-passwd"></password-input>
            <password-input label-align="center" label="New Password" v-model.trim="uForm.newpasswd" :value="uForm.newpasswd" id="new-passwd"></password-input>
                        
            <div class="mt-2 text-center">
              <b-button class="thm-btn" variant="danger" type="submit"><b-icon icon="cursor"></b-icon> Change</b-button>	
              <b-button variant="danger" to="/applicant"><b-icon icon="x-circle"></b-icon> Cancel</b-button>	
            </div>			
				</b-form>
      </div>
    </div>
  `,
  mixins: [alertMixin],
  data() {
    return {
      uForm: {},
    };
  },
  computed: {
    ...mapState(['curUser']),
    ...mapGetters(['isAdmin']),
  },
  methods: {
    ...mapActions(['setLoading']),
    formSubmit() {
      scroll(0, 0);
      this.setLoading(true);
      this.uForm.user_id = this.curUser.id;
      this.uForm.is_admin = this.isAdmin;
      axios
        .post(`api/change_passwd.php`, this.uForm)
        .then(res => {
          if (res.data.ok) {
            this.setAlert(`Password changed successfully`, 'success');
            setTimeout(() => this.isAdmin ? router.push('/admin') : router.push('/applicant'), 5000);
          } else {
            this.setAlert(`${res.data}`, 'danger', 10);
          }
        })
        .catch(err => this.setAlert(`${err.message}`, 'danger'));
      this.setLoading(false);
    },
  },
};

const PageIndex = {
  // global component
  template: `
  <div>
    <carousel-slide></carousel-slide>
    <page-loans></page-loans>
    <page-projects></page-projects>    
  </div>
  `,
  components: { 'page-loans': PageLoans, 'page-empowerments': PageEmpowerments, 'page-projects': PageProjects, 'carousel-slide': CarouselSlide },
  methods: {
    ...mapActions(['setLoading']),
  },
  // mounted() {
  //   this.setLoading(false);
  // }
};


/* Applicant Section */
const ApplicationForm = {
  template: `
    <b-container fluid>
      <div class="mt-2 mb-2 border-bottom border-top shadow p-2">
        <b-alert variant="danger" :show="userExists.application_no ? true : false" class="text-center">
        <h5>Sorry, an applicant with this Name: <strong>{{ userExists.details.surname }} {{ userExists.details.other_names }}</strong>, <br>
        Mobile Number: <strong>{{ userExists.details.mobile_no}}</strong> and <br> Application Number / User ID: <strong>{{ userExists.application_no}}</strong> already exist.</h5>
        <h6 v-if="+userExists.submitted === 0">
        You have started your application, but you have not submitted. Please login with the above details to complete and submit your application. If you can't remember your password, you can click on <strong>forgot password</strong> to change your password.
        </h6>
        <h6 v-else>
        You have submitted your application. Please login with the above details to check for any available updates with respect to your application. If you can't remember your password, you can click on <strong>forgot password</strong> to change your password.
        </h6>
        <b-button variant="danger" class="mx-auto" @click="closeUserExist"><b-icon icon="x-circle"></b-icon> close</b-button>
        </b-alert>
        
        <b-alert variant="danger" :show="showInstruction" class="text-center">
          <h4>Application Form - Instruction(s)</h4>
          <h6 v-if="freshApplication">After starting the application, please take note of your application number and keep it secure. {{ alwaysClick }}. You can login later with your user ID (application number) and password to complete the application form and submit. Click &quot;Continue&quot; to start your application.</h6> 
          <h6 v-else-if="applicationStarted" class="text-white thm-bg">
          Application started successfully. <br>Your application Number / User ID is: {{ uForm.application_no }} <br>Your Password is: {{ raw_passwd }} <br> {{ alwaysClick }}. You can login later with your user ID and password to complete the application form and submit. Click &quot;Continue&quot; to continue your application.</h6> 
          <h6 v-else-if="alreadySubmitted">
          Please note that after editing your details, always click on &quot;Save and Continue&quot;. kindly click on &quot;Save and Exit&quot;, to exit. Click &quot;Continue&quot; to edit your application.</h6> 
          <h6 v-else>
          You have not submitted your application. {{ alwaysClick }}. Click &quot;Continue&quot; to continue your application.</h6> 
          <b-button class="thm-btn" @click="continueApplication" variant="danger">Continue</b-button>
        </b-alert>
        <show-alert :alert-variant="alertVariant" :alert-msg="alertMsg" :show-alert="showAlert"></show-alert> 
				<b-form @submit.prevent="formSubmit" v-show="showForm">
					<div class="d-flex flex-column">
						<h2 class="thm-text text-center">
            <b-icon icon="file-earmark-text"></b-icon> Application Form</h2>

            <b-alert variant="danger" show class="text-center bold">Complete the application form below. All asteriked (*) fields are required and important.</b-alert>
                    
            <b-card no-body>
              <b-tabs v-model="tabIndex" card lazy>
                <b-tab title="Account" key="account-data">
                
                <b-row>
                
              <b-col cols="12">
                <h4 class="mb-3">Section A: <span class="thm-text">Account Information</span></h4>
              </b-col>

              <b-col cols="12" md="6" lg="4" class="text-center">
                <b-form-group label="Loan Type *">
                  <b-input-group>
									<b-input-group-prepend is-text><b-icon icon="cash-stack"></b-icon></b-input-group-prepend>
									<b-form-select v-model="uForm.loan_type" :options="loanType" @blur="validateField($event)" @change="uForm.former_beneficiary=''" ref="loan_type" required autofocus></b-form-select>
								</b-input-group>
              </b-form-group>
            </b-col>

              <b-col cols="12" md="6" lg="4" v-if="uForm.loan_type">
                <b-form-group label="Former Beneficiary *">
                  <b-form-radio-group v-model="uForm.former_beneficiary" :options="yesNo" @input="setApplicationNo" @blur="validateField($event)" required>
                    </b-form-radio-group>
                </b-form-group>
                <b-form-group v-if="uForm.former_beneficiary" :label="uForm.former_beneficiary === 'Yes' ? 'Enter Former Application No.' : 'Application No.'">
                  <b-input-group>
                    <b-input-group-prepend is-text><b-icon icon="shield-lock-fill"></b-icon></b-input-group-prepend>
                    <b-form-input v-model="uForm.application_no" trim :readonly="uForm.former_beneficiary === 'No'" ref="application_no"></b-form-input>
                  </b-input-group>
                </b-form-group>
              </b-col>

              <b-col cols="12" md="6" lg="4">
                <password-input v-if="showPasswdField" label="Choose A Password *" v-model.trim="uForm.passwd" :value="uForm.passwd" description="Choose a password you will always remember."></password-input>
                <input type="hidden" v-model.trim="uForm.passwd" v-else>
              </b-col>
          
              <b-col cols="12">
                <h5 class="my-3 pb-2 border-bottom">Bank Account Info</h5>
              </b-col>
              
              <b-col cols="12" md="6" lg="4">
                <b-form-group label="Bank Name *" label-for="bank-name">
                  <b-input-group>
                    <b-input-group-prepend is-text><b-icon icon="shop"></b-icon></b-input-group-prepend>
                    <b-form-input id="bank-name" v-model="uForm.bank.name" trim @blur="validateField($event)" :formatter="ucwords" required></b-form-input>
                  </b-input-group>
                </b-form-group></b-col>
              
              <b-col cols="12" md="6" lg="4">
                <b-form-group label="Bank Address " label-for="bank-address">
                  <b-input-group>
                    <b-input-group-prepend is-text><b-icon icon="geo-alt-fill"></b-icon></b-input-group-prepend>
                    <b-form-input id="bank-address" v-model="uForm.bank.address" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                  </b-input-group>
                </b-form-group></b-col>
              
              <b-col cols="12" md="6" lg="4">
                <b-form-group label="Account Number *" label-for="account-no">
                  <b-input-group>
                    <b-input-group-prepend is-text><b-icon icon="hash"></b-icon></b-input-group-prepend>
                    <b-form-input id="account-no" v-model="uForm.bank.account_no" trim @blur="validateField($event)" :formatter="ucwords" required></b-form-input>
                  </b-input-group>
                </b-form-group></b-col>
              </b-row>
              </b-tab>


                <b-tab title="Personal Data" key="personal-data" v-if="uForm.loan_type === 'personal'">
                
                <b-row>
              <b-col cols="12">
                <h4 class="mb-3">Section B: <span class="thm-text">Personal Information</span></h4>
              </b-col>
                  <b-col cols="12" class="pb-1 text-center">
                    <div v-if="uForm.personal.passport && !uploads.edit.personal" class="mb-1">
                      <b-avatar rounded :src="uForm.personal.passport" size="8rem"></b-avatar>
                      <b-button class="thm-btn" variant="danger" @click="uploads.edit.personal=true" v-show="!uploads.edit.personal"><b-icon icon="pencil"></b-icon> Change</b-button>
                    </div>
                    

                    <div v-if="newPersonalPassport" class="text-center"> 
                      <b-avatar rounded :src="uploads.src.personal" size="8rem"></b-avatar>
                      <b-form-group  label="Passport *" description="Upload passport image not bigger than 50KB" :state="valstate.personal" :invalid-feedback="valmsg.personal" :valid-feedback="valmsg.personal">	
                        <b-form-file :browse-text="uploads.img.personal ? 'Change' : 'Choose'" v-model="uploads.img.personal" @change="getImage" placeholder="No passport chosen" drop-placeholder="" accept="image/*" required :state="valstate.personal" size="sm" data-field="personal" data-type="passport" :data-edit="uploads.edit.personal">
                          <template v-slot:file-name="{ names }">
                            <b-badge variant="success">{{ names[0] }}</b-badge>
                          </template>
                        </b-form-file>											
                      </b-form-group>
                      <div v-if="valstate.personal">
                        <b-button class="thm-btn" variant="danger" @click="saveImage('personal', 'passport')"><b-icon icon="upload"></b-icon> Save</b-button>
                        <b-button variant="danger" @click="uploads.edit.personal=false" v-if="uploads.edit.personal"><b-icon icon="x-circle"></b-icon> Cancel</b-button>
                      </div>
                    </div>
                  </b-col>                  

              <b-col cols="12" md="6">
                <b-form-group label="Full Name (surname first) *" label-for="fullname">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="person-badge"></b-icon></b-input-group-prepend>
									<b-form-input id="fullname" v-model="uForm.personal.name" trim required minlength="5" @blur="validateField($event)"  :formatter="ucwords"></b-form-input>
								</b-input-group>
              </b-form-group></b-col>
              
              <b-col cols="12" md="6">
                <b-form-group label="Phone No *" label-for="phone-no">
                  <b-input-group>
                    <b-input-group-prepend is-text><b-icon icon="telephone-plus-fill"></b-icon></b-input-group-prepend>
                    <b-form-input type="tel" id="phone-no" v-model="uForm.personal.phone_no" trim  @blur="validateField($event)" required minlength="8"></b-form-input>
                  </b-input-group>
              </b-form-group></b-col>
                
              <b-col cols="12" md="6">
                <b-form-group label="Email" label-for="email">
                  <b-input-group>
                    <b-input-group-prepend is-text><b-icon icon="envelope-fill"></b-icon></b-input-group-prepend>
                    <b-form-input type="email" id="email" v-model="uForm.personal.email" trim  @blur="validateField($event)"></b-form-input>
                  </b-input-group>
              </b-form-group></b-col> 

              <b-col cols="12" md="6">
                <b-form-group label="Residential Address *" label-for="residential-address">
                <b-input-group>
                    <b-input-group-prepend is-text><b-icon icon="geo-alt"></b-icon></b-input-group-prepend>
                  <b-form-textarea max-rows="10" size="sm" id="residential-address" v-model="uForm.personal.address" trim  @blur="validateField($event)" required minlength="6"></b-form-textarea>
                  </b-input-group>
              </b-form-group></b-col>            
              
              <b-col cols="12" md="6" lg="4">
                <b-form-group label="National ID No" label-for="id-no">
                  <b-input-group>
                    <b-input-group-prepend is-text><b-icon icon="hash"></b-icon></b-input-group-prepend>
                    <b-form-input id="id-no" v-model="uForm.personal.nid_no" trim  @blur="validateField($event)"></b-form-input>
                  </b-input-group>
                </b-form-group></b-col>

                <b-col cols="12" md="6" lg="4">
                <b-form-group description="You can click on the icon to select" label-for="dob">
                <template #label>
									Date of Birth *: {{ uForm.personal.dob | formatAge(' years old') }}
								</template>
                <b-input-group>
                  <b-input-group-prepend>
                    <b-form-datepicker v-model="uForm.personal.dob" button-only left aria-controls="dob"></b-form-datepicker>
                  </b-input-group-prepend>
                    <b-form-input id="dob" type="date" v-model="uForm.personal.dob" placeholder="YYYY-MM-DD" autocomplete="off" @blur="validateField($event)" required></b-form-input>
                    </b-input-group>
                </b-form-group></b-col> 
                
              <b-col cols="12" md="6" lg="4">
                <b-form-group label="Gender *">
                  <b-form-radio-group v-model="uForm.personal.gender" :options="gender" @blur="validateField($event)" required>
                  </b-form-radio-group>
              </b-form-group></b-col>
              
              <b-col cols="12" md="6" lg="4">
              <b-form-group label="Marital Status (*)" label-for="marital_status">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="people-fill"></b-icon></b-input-group-prepend>
									<b-form-select id="marital_status" v-model="uForm.personal.marital_status" :options="maritalStatus" @blur="validateField($event)" required></b-form-select>
								</b-input-group>
              </b-form-group>
              
                <div v-if="uForm.personal.marital_status === 'Married'">
                  <b-form-group label="Name of Spouse" label-for="spouse-name">
                  <b-input-group>
									<b-input-group-prepend is-text><b-icon icon="person-fill"></b-icon></b-input-group-prepend>
                    <b-form-input id="spouse-name" v-model="uForm.personal.spouse_name" trim  @blur="validateField($event)"></b-form-input>
                    </b-input-group>
                  </b-form-group>
                  <b-form-group label="Phone No. of Spouse" label-for="spouse-phone-no">
                  <b-input-group>
									<b-input-group-prepend is-text><b-icon icon="telephone-plus-fill"></b-icon></b-input-group-prepend>
                    <b-form-input id="spouse-phone-no" v-model="uForm.personal.spouse_phone_no" trim  @blur="validateField($event)"></b-form-input>
                    </b-input-group>
                  </b-form-group>
                  <b-form-group label="No. of Children" label-for="children">
                  <b-input-group>
									<b-input-group-prepend is-text><b-icon icon="hash"></b-icon></b-input-group-prepend>
                    <b-form-input type="number" id="children" v-model="uForm.personal.children" trim number  @blur="validateField($event)"></b-form-input>
                    </b-input-group>
                  </b-form-group>
                </div>
              </b-col>
              
              <b-col cols="12" md="6" lg="4">
                <b-form-group label="Occupation" label-for="occupation">
                <b-input-group>
									<b-input-group-prepend is-text><b-icon icon="file-person-fill"></b-icon></b-input-group-prepend>
                  <b-form-input id="occupation" v-model="uForm.personal.occupation" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                  </b-input-group>
              </b-form-group></b-col>
              
              <b-col cols="12" md="6" lg="4">
              <b-form-group label="Religion" label-for="religion">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="shuffle"></b-icon></b-input-group-prepend>
									<b-form-select id="religion" v-model="uForm.personal.religion" :options="religion" @blur="validateField($event)"></b-form-select>
								</b-input-group>
							</b-form-group></b-col>
              
              <b-col cols="12" md="6" lg="4">
                <b-form-group label="City" label-for="city">
                <b-input-group>
									<b-input-group-prepend is-text><b-icon icon="geo-alt-fill"></b-icon></b-input-group-prepend>
                  <b-form-input id="city" v-model="uForm.personal.city" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                  </b-input-group>
              </b-form-group></b-col>
              
              <b-col cols="12" md="6" lg="4">
                <b-form-group label="LGA" label-for="lga">
                <b-input-group>
									<b-input-group-prepend is-text><b-icon icon="geo-alt"></b-icon></b-input-group-prepend>
                  <b-form-input id="lga" v-model="uForm.personal.lga" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                  </b-input-group>
              </b-form-group></b-col>
              
              <b-col cols="12" md="6" lg="4">
                <b-form-group label="Highest Educational Qualification" label-for="qualification">	
                <b-input-group><b-input-group-prepend is-text>
                  <b-icon icon="award"></b-icon></b-input-group-prepend>
                    <b-form-input id="qualification" v-model="uForm.personal.qualification" placeholder="e.g. M.Tech, B.Sc, HND, NCE etc." trim @blur="validateField($event)"></b-form-input>				
                </b-input-group>
                </b-form-group>
              </b-col>

              <b-col cols="12" md="6" lg="4">
                <b-form-group label="Any Physical Disability" label-for="disability">	
                <b-input-group><b-input-group-prepend is-text>
                  <b-icon icon="alt"></b-icon></b-input-group-prepend>
                    <b-form-input id="disability" v-model="uForm.personal.disability" trim @blur="validateField($event)"></b-form-input>				
                </b-input-group>
                </b-form-group>
              </b-col>

              <b-col cols="12" md="6" lg="4">
                <b-form-group label="Name of Next of Kin" label-for="kin-name">	
                <b-input-group><b-input-group-prepend is-text>
                  <b-icon icon="person-fill"></b-icon></b-input-group-prepend>
                    <b-form-input id="kin-name" v-model="uForm.personal.next_of_kin.name" trim @blur="validateField($event)"></b-form-input>				
                </b-input-group>
                </b-form-group>
              </b-col>
              
              <b-col cols="12" md="6" lg="4">
                <b-form-group label="Phone No. of Next of Kin" label-for="kin-phone-no">	
                <b-input-group><b-input-group-prepend is-text>
                  <b-icon icon="telephone-plus-fill"></b-icon></b-input-group-prepend>
                    <b-form-input id="kin-phone-no" v-model="uForm.personal.next_of_kin.phone_no" trim @blur="validateField($event)"></b-form-input>				
                </b-input-group>
                </b-form-group>
              </b-col>
              
              <b-col cols="12" md="6" lg="4">
                <b-form-group label="Address of Next of Kin" label-for="kin-address">	
                <b-input-group><b-input-group-prepend is-text>
                  <b-icon icon="geo-alt-fill"></b-icon></b-input-group-prepend>
                    <b-form-input id="kin-address" v-model="uForm.personal.next_of_kin.address" trim @blur="validateField($event)"></b-form-input>				
                </b-input-group>
                </b-form-group>
              </b-col>
              
                </b-row>                  
                </b-tab>
                <b-tab title="Group Data" key="group-data" v-else-if="uForm.loan_type === 'group_org'">
                  <b-row>
              <b-col cols="12">
                <h4 class="mb-3">Section B: <span class="thm-text">Group Information</span></h4>
              </b-col>

              <b-col cols="12" md="6">
                <b-form-group label="Group Name " label-for="group-name">
                  <b-input-group>
                    <b-input-group-prepend is-text><b-icon icon="people-fill"></b-icon></b-input-group-prepend>
                    <b-form-input id="group-name" v-model="uForm.group_org.name" trim @blur="validateField($event)" :formatter="ucwords" ></b-form-input>
                  </b-input-group>
                </b-form-group></b-col> 

              <b-col cols="12" md="6">
                <b-form-group label="Group Reg. No " label-for="group-no">
                  <b-input-group>
                    <b-input-group-prepend is-text><b-icon icon="hash"></b-icon></b-input-group-prepend>
                    <b-form-input id="group-no" v-model="uForm.group_org.reg_no" trim @blur="validateField($event)" :formatter="ucwords" ></b-form-input>
                  </b-input-group>
                </b-form-group></b-col>
              
              <b-col cols="12" md="6">
                <b-form-group label="Group Phone No *" label-for="phone-no">
                  <b-input-group>
                    <b-input-group-prepend is-text><b-icon icon="telephone-plus-fill"></b-icon></b-input-group-prepend>
                    <b-form-input type="tel" id="phone-no" v-model="uForm.group_org.phone_no" trim  @blur="validateField($event)" required minlength="8"></b-form-input>
                  </b-input-group>
              </b-form-group></b-col>
              
              <b-col cols="12" md="6">
                <b-form-group label="Group Email" label-for="email">
                  <b-input-group>
                    <b-input-group-prepend is-text><b-icon icon="envelope-fill"></b-icon></b-input-group-prepend>
                    <b-form-input type="email" id="email" v-model="uForm.group_org.email" trim  @blur="validateField($event)"></b-form-input>
                  </b-input-group>
              </b-form-group></b-col> 

              <b-col cols="12">
                <b-form-group label="Business or Office Address" label-for="office-address">
                <b-input-group>
                    <b-input-group-prepend is-text><b-icon icon="geo-alt-fill"></b-icon></b-input-group-prepend>
                  <b-form-textarea max-rows="10" size="sm" id="office-address" v-model="uForm.group_org.address" trim  @blur="validateField($event)"></b-form-textarea>
                  </b-input-group>
              </b-form-group></b-col>

                <b-col cols="12">
                <h5 class="py-2 py-md-3 py-lg-4 border-top border-bottom thm-text">Particulars of Group Executives: Chairman, Secretary and Treasurer</h5>
              </b-col>
                </b-row> 

                <b-row v-for="(exco, idx) in uForm.group_org.excos" :key="exco.id" class="my-2" align-v="end">
                
                  <b-col cols="12" md="6" lg="4">
                    <b-form-group label="Name of Exco" :label-for="exco.id + 'name'">
                      <b-input-group>
                        <b-input-group-prepend is-text><b-icon icon="person-fill"></b-icon></b-input-group-prepend>
                        <b-form-input :id="exco.id + 'name'" v-model="exco.name" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                      </b-input-group>
                  </b-form-group></b-col>

                  <b-col cols="12" md="6" lg="4">
                    <b-form-group label="Designation of Exco" :label-for="exco.id + 'designation'">
                      <b-input-group>
                        <b-input-group-prepend is-text><b-icon icon="grid-fill"></b-icon></b-input-group-prepend>
                        <b-form-input :id="exco.id + 'designation'" v-model="exco.designation" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                      </b-input-group>
                  </b-form-group></b-col>

                  <b-col cols="12" md="6" lg="4">
                    <b-form-group label="Phone No. of Exco" :label-for="exco.id + 'phoneNo'">
                      <b-input-group>
                        <b-input-group-prepend is-text><b-icon icon="telephone-plus-fill"></b-icon></b-input-group-prepend>
                        <b-form-input :id="exco.id + 'phoneNo'" v-model="exco.phone_no" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                      </b-input-group>
                  </b-form-group></b-col>

                  <b-col cols="12" md="6" lg="12">
                  <b-form-group label="Address of Exco" :label-for="exco.id + 'address'">
                    <b-input-group>
                      <b-input-group-prepend is-text><b-icon icon="geo-alt"></b-icon></b-input-group-prepend>
                        <b-form-textarea max-rows="10" size="sm" :id="exco.id + 'address'" v-model="exco.address" trim  @blur="validateField($event)"></b-form-textarea>
                      </b-input-group>
                  </b-form-group></b-col>

                  <b-col cols="12">
                    <b-button v-if="+idx === 0" class="rounded" variant="success" @click="addNewExco"><b-icon icon="plus"></b-icon> Add New Exco</b-button>
                    <b-button v-else variant="danger" @click="removeExco(exco.id)"><b-icon icon="x"></b-icon> Remove Exco</b-button>
                  </b-col>
                </b-row> 
                
                </b-tab>               

                <b-tab title="Loan" key="loan" >                
                  <b-row>              
                  <b-col cols="12">
                    <h4 class="mb-3">Section C: <span class="thm-text">Loan Details - The Proposed Project</span></h4>
                  </b-col>
                </b-row>
              <b-row align-v="end" v-for="(loan, idx) in uForm.loan" :key="loan.id">
              <b-col cols="12" md="6" lg="4">
                <b-form-group label="Type of Business/Project *">
                <b-input-group>
                  <b-input-group-prepend is-text><b-icon icon="layers-fill"></b-icon></b-input-group-prepend>	
                  <b-form-input v-model="loan.business_type" trim @blur="validateField($event)" required  :formatter="ucwords"></b-form-input>
                  </b-input-group>	
              </b-form-group></b-col>

              <b-col cols="12" md="6" lg="4">
              <b-form-group label="Business Location *">	
              <b-input-group>
                  <b-input-group-prepend is-text><b-icon icon="geo-alt-fill"></b-icon></b-input-group-prepend>	
                  <b-form-textarea max-rows="10" size="sm" v-model="loan.business_location" trim @blur="validateField($event)" required minlength="4"></b-form-textarea>
                  </b-input-group>
              </b-form-group></b-col>

              <b-col cols="12" md="6" lg="4">
              <b-form-group label="Experience">
                <b-input-group>
                    <b-input-group-prepend is-text><b-icon icon="clock-history"></b-icon></b-input-group-prepend>		
                  <b-form-textarea max-rows="10" size="sm" v-model="loan.experience" trim @blur="validateField($event)" minlength="4"></b-form-textarea>
                </b-input-group>
              </b-form-group></b-col>

              <b-col cols="12" md="6" lg="4">
                <b-form-group label="CAC Reg. No.">
                <b-input-group>
                  <b-input-group-prepend is-text><b-icon icon="hash"></b-icon></b-input-group-prepend>	
                  <b-form-input v-model="loan.cac_no" trim @blur="validateField($event)" ></b-form-input>	
                  </b-input-group>
              </b-form-group></b-col>

              <b-col cols="12" md="6" lg="4">
                <b-form-group label="Amount Required *">
                  <b-input-group>	
                  <b-input-group-prepend><b-button><s>N</s></b-button></b-input-group-prepend>
                    <b-form-input type="number" v-model="loan.amount_required" trim number @blur="validateField($event)" required></b-form-input>
                  </b-input-group>	
              </b-form-group></b-col>  

              <b-col cols="12" md="6" lg="4" v-if="isAdmin">
                <b-form-group label="Amount Given *">
                  <b-input-group>	
                  <b-input-group-prepend><b-button><s>N</s></b-button></b-input-group-prepend>
                    <b-form-input type="number" v-model="loan.amount_given" trim number @blur="validateField($event)" required></b-form-input>
                  </b-input-group>	
              </b-form-group></b-col>                                            
            
            </b-row>
            </b-tab>

                <b-tab title="Guarantor" key="guarantor">
                <b-row>
                                
                  <b-col cols="12">
                    <h4 class="mb-3">Section D: <span class="thm-text">Guarantor Information</span></h4>
                  </b-col>                  
                </b-row>
                    
                <b-row v-for="(gt, idx) in uForm.guarantor" :key="gt.id" class="my-2" align-v="end">

                  <b-col cols="12" class="pb-1 text-center">
                    <div v-if="gt.passport && !uploads.edit.guarantor[idx]" class="mb-1">
                      <b-avatar rounded :src="gt.passport" size="8rem"></b-avatar>
                      <b-button class="thm-btn" variant="danger" @click="toggleEditImage('guarantor', idx, true)" v-show="!uploads.edit.guarantor[idx]"><b-icon icon="pencil"></b-icon> Change</b-button>
                    </div>
                    

                    <div v-if="newGuarantorPassport[idx]" class="text-center"> 
                      <b-avatar rounded :src="uploads.src.guarantor[idx]" size="8rem"></b-avatar>
                      <b-form-group  label="Passport *" description="Upload passport image not bigger than 50KB" :state="valstate.guarantor[idx]" :invalid-feedback="valmsg.guarantor[idx]" :valid-feedback="valmsg.guarantor[idx]">	
                        <b-form-file :browse-text="uploads.img.guarantor[idx] ? 'Change' : 'Choose'" v-model="uploads.img.guarantor[idx]" @change="getImage" placeholder="No passport chosen" drop-placeholder="" accept="image/*" required :state="valstate.guarantor[idx]" size="sm" data-field="guarantor" data-type="passport" :data-index="idx" :data-edit="uploads.edit.guarantor[idx]">
                          <template v-slot:file-name="{ names }">
                            <b-badge variant="success">{{ names[0] }}</b-badge>
                          </template>
                        </b-form-file>											
                      </b-form-group>
                      <div v-if="valstate.guarantor[idx]">
                        <b-button class="thm-btn" variant="danger" @click="saveImage('guarantor', 'passport', idx)"><b-icon icon="upload"></b-icon> Save</b-button>
                        <b-button variant="danger" @click="toggleEditImage('guarantor', idx, false)" v-if="uploads.edit.guarantor[idx]"><b-icon icon="x-circle"></b-icon> Cancel</b-button>
                      </div>
                    </div>
                  </b-col>
                  
                  <b-col cols="12" md="6">
                    <b-form-group label="Full Name (surname first) *" :label-for="gt.id + 'name'">
                      <b-input-group>
                        <b-input-group-prepend is-text><b-icon icon="person"></b-icon></b-input-group-prepend>
                        <b-form-input :id="gt.id + 'name'" v-model="gt.name" trim @blur="validateField($event)" required :formatter="ucwords"></b-form-input>
                      </b-input-group>
                  </b-form-group></b-col>

                  <b-col cols="12" md="6">
                  <b-form-group label="Residential Address" :label-for="gt.id + 'address'">
                    <b-input-group>
                        <b-input-group-prepend is-text><b-icon icon="geo-alt-fill"></b-icon></b-input-group-prepend>
                    <b-form-textarea max-rows="10" size="sm" :id="gt.id + 'address'" v-model="gt.address" trim  @blur="validateField($event)"></b-form-textarea>
                    </b-input-group>
                  </b-form-group></b-col>
        
                  <b-col cols="12" md="6" lg="4">
                    <b-form-group label="Organization" :label-for="gt.id + 'organization'">
                      <b-input-group>
                        <b-input-group-prepend is-text><b-icon icon="people-fill"></b-icon></b-input-group-prepend>
                        <b-form-input :id="gt.id + 'organization'" v-model="gt.organization" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                      </b-input-group>
                  </b-form-group></b-col>

                  <b-col cols="12" md="6" lg="4">
                    <b-form-group label="Email" :label-for="gt.id + 'email'">
                      <b-input-group>
                        <b-input-group-prepend is-text><b-icon icon="envelope-fill"></b-icon></b-input-group-prepend>
                        <b-form-input type="email" :id="gt.id + 'email'" v-model="gt.email" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                      </b-input-group>
                  </b-form-group></b-col>

                  <b-col cols="12" md="6" lg="4">
                    <b-form-group label="Phone No." :label-for="gt.id + 'phoneNo'">
                      <b-input-group>
                        <b-input-group-prepend is-text><b-icon icon="telephone-plus-fill"></b-icon></b-input-group-prepend>
                        <b-form-input :id="gt.id + 'phoneNo'" v-model="gt.phone_no" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                      </b-input-group>
                  </b-form-group></b-col>

                  <b-col cols="12" md="6" lg="4">
                    <b-form-group label="Designation" :label-for="gt.id + 'designation'">
                      <b-input-group>
                        <b-input-group-prepend is-text><b-icon icon="grid-fill"></b-icon></b-input-group-prepend>
                        <b-form-input :id="gt.id + 'designation'" v-model="gt.designation" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                      </b-input-group>
                  </b-form-group></b-col>

                  <b-col cols="12" md="6" lg="4">
                    <b-form-group label="Date of First Appointment" :label-for="gt.id + 'first_appointment'">
                      <b-input-group>
                        <b-input-group-prepend is-text><b-icon icon="calendar2-plus-fill"></b-icon></b-input-group-prepend>
                        <b-form-input type="date" :id="gt.id + 'first_appointment'" v-model="gt.first_appointment" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                      </b-input-group>
                  </b-form-group></b-col>

                  <b-col cols="12" md="6" lg="4">
                    <b-form-group label="Biometric Number" :label-for="gt.id + 'biometric_no'">
                      <b-input-group>
                        <b-input-group-prepend is-text>123</b-input-group-prepend>
                        <b-form-input type="number" :id="gt.id + 'biometric_no'" v-model="gt.biometric_no" trim number @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                      </b-input-group>
                  </b-form-group></b-col>

                  <b-col cols="12" md="6" lg="4" class="pb-1 text-center">
                    <div v-if="gt.biometric && !uploads.edit.biometric[idx]" class="mb-1">
                      <b-avatar rounded :src="gt.biometric" size="5rem"></b-avatar>
                      <b-button class="thm-btn" variant="danger" @click="toggleEditImage('biometric', idx, true)" v-show="!uploads.edit.biometric[idx]"><b-icon icon="pencil"></b-icon> Change</b-button>
                    </div>                 

                    <div v-if="newGuarantorBiometric[idx]" class="text-center"> 
                      <b-avatar rounded :src="uploads.src.biometric[idx]" size="5rem"></b-avatar>
                      <b-form-group  label="Biometric *" description="Upload biometric image not bigger than 50KB" :state="valstate.biometric[idx]" :invalid-feedback="valmsg.biometric[idx]" :valid-feedback="valmsg.biometric[idx]">	
                        <b-form-file :browse-text="uploads.img.biometric[idx] ? 'Change' : 'Choose'" v-model="uploads.img.biometric[idx]" @change="getImage" placeholder="No biometric chosen" drop-placeholder="" accept="image/*" required :state="valstate.biometric[idx]" size="sm" data-field="guarantor" data-type="biometric" :data-index="idx" :data-edit="uploads.edit.biometric[idx]">
                          <template v-slot:file-name="{ names }">
                            <b-badge variant="success">{{ names[0] }}</b-badge>
                          </template>
                        </b-form-file>											
                      </b-form-group>
                      <div v-if="valstate.biometric[idx]">
                        <b-button class="thm-btn" variant="danger" @click="saveImage('guarantor', 'biometric', idx)"><b-icon icon="upload"></b-icon> Save</b-button>
                        <b-button variant="danger" @click="toggleEditImage('biometric', idx, false)" v-if="uploads.edit.biometric[idx]"><b-icon icon="x-circle"></b-icon> Cancel</b-button>
                      </div>
                    </div>
                  </b-col>

                  <b-col cols="12" md="6" lg="4">
                    <b-form-group label="Date of Last Promotion" :label-for="gt.id + 'last_promotion'">
                      <b-input-group>
                        <b-input-group-prepend is-text><b-icon icon="calendar2-plus-fill"></b-icon></b-input-group-prepend>
                        <b-form-input type="date" :id="gt.id + 'last_promotion'" v-model="gt.last_promotion" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                      </b-input-group>
                  </b-form-group></b-col>
                  
                  <b-col cols="12" md="6" lg="4">
                    <b-form-group label="Grade Level" :label-for="gt.id + 'grade_level'">
                      <b-input-group>
                        <b-input-group-prepend is-text><b-icon icon="layers"></b-icon></b-input-group-prepend>
                        <b-form-input :id="gt.id + 'grade_level'" v-model="gt.grade_level" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                      </b-input-group>
                  </b-form-group></b-col>
                  
                  <b-col cols="12" md="6" lg="4">
                    <b-form-group label="Step" :label-for="gt.id + 'step'">
                      <b-input-group>
                        <b-input-group-prepend is-text><b-icon icon="bar-chart-steps"></b-icon></b-input-group-prepend>
                        <b-form-input :id="gt.id + 'step'" v-model="gt.step" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                      </b-input-group>
                  </b-form-group></b-col>
                  
                  <b-col cols="12" md="6" lg="4">
                    <b-form-group label="Ministry" :label-for="gt.id + 'ministry'">
                      <b-input-group>
                        <b-input-group-prepend is-text><b-icon icon="geo-fill"></b-icon></b-input-group-prepend>
                        <b-form-input :id="gt.id + 'ministry'" v-model="gt.ministry" trim @blur="validateField($event)" :formatter="ucwords"></b-form-input>
                      </b-input-group>
                  </b-form-group></b-col>

                  <b-col cols="12">
                    <b-button v-if="+idx === 0 && uForm.guarantor.length < 2" class="rounded" variant="success" @click="addNewGuarantor"><b-icon icon="plus"></b-icon> Add New Guarantor</b-button>
                    <b-button v-else variant="danger" @click="removeGuarantor(gt.id)"><b-icon icon="x"></b-icon> Remove Guarantor</b-button>
                  </b-col>
                </b-row> 
                </b-tab>                                
              </b-tabs>
            </b-card>

            <div class="text-center mt-2">
              <b-button-group>
              <b-button class="mr-2 thm-btn" type="submit" variant="danger" @click="tab=-1">Prev <b class="sr-only">Previous</b></b-button>
                <b-button class="mr-2 thm-btn" type="submit" variant="danger" @click="tab=1">Next</b-button>
                <b-button class="mr-2 thm-btn" variant="danger" type="submit">Save and Continue</b-button>
                <b-button class="mr-2 thm-btn" variant="danger" type="submit" @click="continueStep = false">Save and Exit</b-button>
                <button class="btn btn-success btn-sm" type="submit" @click="uForm.submit = 1" v-if="showSubmitButton"><b-icon icon="cursor"></b-icon>&nbsp;Submit Application</button>               
              </b-button-group>
            </div>
					</div>				
				</b-form>
      </div>
    </b-container>
  `,

  mixins: [alertMixin],
  data() {
    return {
      tabIndex: 0,
      maritalStatus: [{ text: 'Select marital status...', value: '', disabled: true }, 'Single', 'Married'],
      yesNo: ['Yes', 'No'],
      gender: ['Male', 'Female'],
      religion: [{ text: 'Select religion...', value: '', disabled: true }, 'Christianity', 'Muslim'],
      loanType: [
        { text: 'Select loan type...', value: '', disabled: true },
        { text: 'Personal', value: 'personal' },
        { text: 'Group', value: 'group_org' },
      ],
      formType: 'new',
      showForm: false,
      showInstruction: true,
      alwaysClick: `Always click on "Save and Continue". If you need to exit the application form without submitting, kindly click on "Save and Exit".`,
      uForm: {
        id: uuidv4(),
        new_form: 1,
        application_no: '',
        former_beneficiary: '',
        loan_type: '',
        passwd: '',
        personal: {
          passport: '',
          marital_status: '',
          religion: '',
          next_of_kin: { name: '' },
        },
        group_org: {
          excos: [{ id: uuidv4() }],
          email: '',
          name: '',
          phone_no: '',
        },
        bank: { id: uuidv4() },
        loan: [{ id: uuidv4(), amount_given: 0 }],
        guarantor: [{ id: uuidv4(), passport: '', biometric: '' }],
        comments: [{
            id: uuidv4(),
            level: 'field_officer',
            comment: 'This is the field officer comments and recommendation',
            updated_on: new Date(),
            updated_by: 'Field Officer I',
            edit: false,
          },
          {
            id: uuidv4(),
            level: 'loan_admin',
            comment: 'This is the loan admin comments and recommendation',
            updated_on: new Date(),
            updated_by: 'Loan Admin I',
            edit: false,
          },
          {
            id: uuidv4(),
            level: 'director',
            comment: 'This is the director comments and recommendation',
            updated_on: new Date(),
            updated_by: 'Director General',
            edit: false,
          },
        ],
        actions: { shortlisted: 0, approved: 0, disbursed: 0, repaid: 0 },
        submit: 0,
        submitted: 0,
      },
      valstate: { personal: false, guarantor: [false, false], biometric: [false, false] },
      valmsg: { personal: '', guarantor: ['', ''], biometric: ['', ''] },
      uploads: {
        img: { personal: null, guarantor: [null, null], biometric: [null, null] },
        src: { personal: null, guarantor: [null, null], biometric: [null, null] },
        edit: { personal: false, guarantor: [false, false], biometric: [false, false] },
      },
      continueStep: true,
      tab: 0,
      userExists: { application_no: '', details: {} },
      applicationStarted: false,
      raw_passwd: '',
    };
  },
  props: {
    applicant: {
      type: Object,
      default: null,
    },
  },
  computed: {
    ...mapState(['curUser', 'setup']),
    formError() {
      let checkField = [
        this.uForm.loan_type,
        this.uForm.former_beneficiary,
        this.uForm.passwd,
        this.uForm.bank.name,
        this.uForm.bank.account_no,
        this.uForm.loan[0].amount_required,
        this.uForm.loan[0].business_type,
        this.uForm.loan[0].business_location,
        this.uForm.guarantor[0].passport,
        this.uForm.guarantor[0].biometric,
        this.uForm.guarantor[0].name,
      ];
      return checkField.filter(f => !f).length > 0;
    },

    freshApplication() {
      return this.uForm.new_form;
    },
    alreadySubmitted() {
      return +this.uForm.submitted === 1;
    },
    showSubmitButton() {
      return !this.formError && !this.alreadySubmitted;
    },
    showPasswdField() {
      return this.uForm.new_form;
    },
    newPersonalPassport() {
      return !this.uForm.personal.passport || this.uploads.edit.personal;
    },
    newGuarantorPassport() {
      let ngp = [];
      this.uForm.guarantor.forEach((gt, idx) =>
        ngp.push(!this.uForm.guarantor[idx].passport || this.uploads.edit.guarantor[idx])
      );
      return ngp;
    },
    newGuarantorBiometric() {
      let ngb = [];
      this.uForm.guarantor.forEach((gt, idx) =>
        ngb.push(!this.uForm.guarantor[idx].biometric || this.uploads.edit.biometric[idx])
      );
      return ngb;
    },
    isAdmin() {
      return this.applicant !== null;
    },
  },

  methods: {
    ...mapActions(['setLoading', 'setLogin', 'setCurUser', 'setSetup']),
    continueApplication() {
      this.showInstruction = false;
      this.showForm = true;
    },
    ucwords(words) {
      return words ?
        words
        .split(' ')
        .map(word => ucword(word))
        .join(' ') :
        '';
    },
    validateField(field) {
      validate(field);
    },

    closeUserExist() {
      this.userExists = { application_no: '', details: {} };
    },

    addNewExco() {
      this.uForm.group_org.excos.push({ id: uuidv4() });
    },

    removeExco(id) {
      this.uForm.group_org.excos = this.uForm.group_org.excos.filter(exco => exco.id !== id);
    },

    addNewGuarantor() {
      this.uForm.guarantor.push({ id: uuidv4(), passport: '', biometric: '' });
    },

    removeGuarantor(id) {
      this.uForm.guarantor = this.uForm.guarantor.filter(gt => gt.id !== id);
    },

    setFocus(ref) {
      this.$refs[ref].focus();
    },

    setApplicationNo() {
      if (this.uForm.former_beneficiary === 'No') {
        let lastNo = +this.setup.last_number;
        let curNo = lastNo + 1;
        let newNo = `${+curNo < 9 ? '0' : ''}${curNo}`;
        this.uForm.application_no = `MEDA-${this.uForm.loan_type[0].toUpperCase()}${newNo}`;
      } else if (this.uForm.former_beneficiary === 'Yes') {
        this.uForm.application_no = '';
        this.setFocus('application_no');
      }
    },

    toggleEditImage(field, index, edit = true) {
      this.uploads.edit[field].splice(index, 1, edit);
    },

    saveImage(field = '', type = '', index) {
      this.setLoading(true);
      let file = this.getImageFile(field, type, index);
      let imagename = this.getImageName(field, type, index);
      let filename = uuidv4();
      let data = { imagename, filename };
      let fd = new FormData();
      fd.append('data', JSON.stringify(data));
      fd.append('file', file);
      let config = { header: { 'Content-Type': 'multipart/form-data' } };
      axios
        .post('api/process_file.php', fd, config)
        .then(res => {
          // console.log(res.data);
          this.setLoading(false);
          if (res.data.imagename) {
            this.setImageName(res.data.imagename, field, type, index);
            this.setEditImage(field, type, index);
          } else {
            this.setAlert(`${res.data}`, 'danger');
          }
        })
        .catch(err => {
          this.setAlert(`${err.message}`, 'danger');
          this.setLoading(false);
        });
    },

    setEditImage(field = '', type = '', index) {
      if (index !== undefined) {
        switch (type) {
          case 'biometric':
            this.uploads.edit[type].splice(index, 1, false);
            break;
          default:
            this.uploads.edit[field].splice(index, 1, false);
        }
      } else {
        this.uploads.edit[field] = false;
      }
    },

    getImageFile(field = '', type = '', index) {
      let file = null;
      if (index !== undefined) {
        switch (type) {
          case 'biometric':
            file = this.uploads.img[type][index];
            break;
          default:
            file = this.uploads.img[field][index];
        }
      } else {
        file = this.uploads.img[field];
      }
      return file;
    },

    getImageName(field = '', type = '', index) {
      let filename = '';
      if (index !== undefined) {
        filename = this.uForm[field][index][type];
      } else {
        filename = this.uForm[field][type];
      }
      return filename;
    },

    setImageName(imageName, field = '', type = '', index) {
      if (index !== undefined) {
        this.uForm[field][index][type] = '';
        this.uForm[field][index][type] = imageName;
      } else {
        this.uForm[field][type] = '';
        this.uForm[field][type] = imageName;
      }
    },

    formSubmit() {
      scroll(0, 0);
      this.setLoading(true);

      if (this.tab !== 0) {
        setTimeout(() => {
          this.tabIndex += this.tab;
          this.tab = 0;
        });
        return;
      }

      let newForm = this.uForm.new_form;
      if (newForm) {
        this.raw_passwd = this.uForm.passwd;
      }
      // console.log(this.uForm);
      axios
        .post('api/applicants.php', this.uForm)
        .then(res => {
          // console.log(res.data);

          if (res.data.id) {
            if (!this.continueStep) {
              !this.isAdmin ? this.setCurUser(res.data) : '';
              this.showForm = false;
              this.setAlert(`Application saved successfully`, 'success');
              this.setLoading(false);
              setTimeout(() => {
                this.setLogin(true);
                !this.isAdmin ? router.push('/applicant') : (this.$parent.showForm = false);
              }, 5000);
            } else if (this.uForm.submit) {
              !this.isAdmin ? this.setCurUser(res.data) : '';
              this.showForm = false;
              this.setAlert(`Application submitted successfully`, 'success');
              this.setLoading(false);
              setTimeout(() => {
                this.setLogin(true);
                !this.isAdmin ? router.push('/applicant') : (this.$parent.showForm = false);
              }, 5000);
            } else {
              this.uForm = {...res.data };
              if (newForm) {
                this.showInstruction = true;
                this.applicationStarted = true;
                this.showForm = false;
              }
              this.tabIndex++;
              this.setAlert(`Application saved successfully`, 'success');
              this.setLoading(false);
            }
          } else if (res.data.details) {
            this.userExists = {...res.data };
            this.setLoading(false);
          } else {
            this.setAlert(`${res.data}`, 'danger');
            this.setLoading(false);
          }
        })
        .catch(err => {
          this.setAlert(`${err.message}`, 'danger');
          this.setLoading(false);
        });
    },

    getImage(e) {
      const file = e.target.files[0];
      const { type, field, index } = e.target.dataset;

      if (file === null) return;

      this.setLoading(true);

      switch (type) {
        case 'biometric':
          const { valid, message } = this.validateImage(file, 152);
          if (!valid) {
            this.invalidImage(type, message, index);
          } else {
            this.validImage(file, type, index);
          }
          break;
        default:
          const { valid: val, message: msg } = this.validateImage(file, 52);
          if (!val) {
            this.invalidImage(field, msg, index);
          } else {
            this.validImage(file, field, index);
          }
      }
    },

    validateImage(file, size, type = 'image/') {
      if (file === null) return;
      let valid = true;
      let message = '';
      if (!file.type.includes(type)) {
        valid = false;
        message = 'This is not an image.';
      } else if (parseInt(file.size / 1000, 10) > size) {
        valid = false;
        message = 'Image is too large.';
      }
      return { valid, message };
    },

    invalidImage(field, message = '', index) {
      if (index !== undefined) {
        this.valstate[field].splice(index, 1, false);
        this.valmsg[field].splice(index, 1, `Invalid Image:  ${message}`);
        this.uploads.img[field].splice(index, 1, null);
        this.setLoading(false);
      } else {
        this.valstate[field] = false;
        this.valmsg[field] = 'Invalid Image: ' + message;
        this.uploads.img[field] = null;
        this.setLoading(false);
      }
    },

    validImage(file, field, index) {
      if (file === null) return;
      if (index !== undefined) {
        this.valstate[field].splice(index, 1, true);
        this.valmsg[field].splice(index, 1, 'Valid Image.');
        const reader = new FileReader();
        reader.addEventListener('load', () => this.uploads.src[field].splice(index, 1, reader.result), false);
        file ? reader.readAsDataURL(file) : '';
        this.setLoading(false);
      } else {
        this.valstate[field] = true;
        this.valmsg[field] = 'Valid Image.';
        const reader = new FileReader();
        reader.addEventListener('load', () => (this.uploads.src[field] = reader.result), false);
        file ? reader.readAsDataURL(file) : '';
        this.setLoading(false);
      }
    },
  },
  created() {
    if (this.applicant) {
      this.uForm = {...this.applicant };
    } else if (this.curUser.application_no) {
      this.uForm = {...this.curUser };
    }
    axios
      .get('api/setup.php')
      .then(res => this.setSetup(res.data))
      .catch(err => console.error(err));
  },
};

const OfferLetter = {
  template: `    
    <div class="p-2 my-1">
      <div class="text-center"><b-img :src="logo" class=""></b-img></div>
      <div id="offer-letter">
        <h5 class="text-center">EKITI STATE {{ brandDescription | uppercase}}</h5>
        <p class="mt-3 text-uppercase">{{ curUser[curUser.loan_type].name }}</p>
        <p class="text-uppercase">{{ curUser[curUser.loan_type].address }}</p>
        <h5 class="mt-4"><b>Dear Sir/Ma,</b></h5>
        <h5 class="mt-4"><b>OFFER LETTER</b></h5>
        <p>We are pleased to inform you that our Agency has approved your request for a facility under <br> the following terms and conditions:</p>
        <p class="">
          <b class="">Lender:</b>
          <span>{{ brandDescription }}</span>
        </p>
        <p>
          <b>Borrower:</b>
          <span>{{ curUser[curUser.loan_type].name }}</span>
        </p>
        
        <p>
          <b>Facility Type:</b>
          <span>Term Loan</span>
        </p><p>
          <b>Amount:</b>
          <span>{{ curUser.loan[curUser.loan.length-1].amount_required }}</span>
        </p><p>
          <b>Effective Repayment:</b>
          <span>30 days after disbursement date</span>
        </p><p>
          <b>Tenor:</b>
          <span>12 months</span>
        </p><p>
          <b>Repayment:</b>
          <span>Twelve (12) equal installment payments of <s>N</s>4,600.00</span>
        </p><p>
          <b>Purpose:</b>
          <span>To augment obligor's working capital Requirement</span>
        </p>
          <h4><u>Pricing</u></h4>
        <p>
          <b>Interest Rate:</b>
          <span>10% per Annum</span>
        </p><p>
          <b>Duty on Form:</b>
          <span>1% flat of the facility amount</span>
        </p><p>
          <b>Processing Fee:</b>
          <span>1% flat of the facility amount</span>
        </p><p>
          <b>Monitoring Fee:</b>
          <span>1% flat of the facility amount</span>
        </p><p>
          <b>Source of Payment:</b>
          <span>Proceeds from sales</span>
        </p>
      </div>
      <div class="d-flex justify-content-between align-content-end mt-4">
        <div>
          <b-img :src="DGSign" alt="DG Signature"></b-img>
          <div id="dg-details">
            <h6 class="font-weight-bold text-uppercase">{{ DGName }},</h6>
            <h6 class="font-weight-bold">Director General</h6>
          </div>
        </div>
        <div>
          <b-button @click="genPDF()" size="sm" class="thm-btn" variant="danger">Download/Save as PDF <b-icon icon="download"></b-icon></b-button>
        </div>
      </div>      
    </div>
  `,
  // genPDF(fullName, a.title)
  data() {
    return {
      logo: 'assets/images/logo.png',
      DGSign: 'assets/images/dg_signature.jpg',
      DGName: 'Otunba Kayode Fasae',
    };
  },
  computed: {
    ...mapGetters(['fullName']),
    ...mapState(['curUser', 'brandName', 'brandDescription']),
  },
  methods: {
    ...mapActions(['setLoading']),
    genPDF() {
      savePDF();
    },
  },
};

const ApplicantDashboard = {
  template: `    
      <div class="text-center">
        <b-jumbotron>
          <template v-slot:header>
          <h2>Applicant Dashboard</h2> 
          </template>
          <template v-slot:lead>
          <h5 class="text-wrap h">Application Number / User ID: <b class="thm-text"> {{ curUser.application_no }}</b></h5>
          
          <h5 v-if="curUser.submitted === 1" class="thm-text"> Your application has been submitted</h5>
          <h5 v-else-if="curUser.submitted === 0" class="thm-text"> Your application has not been submitted</h5>
          </template>
        </b-jumbotron>
      </div>
  `,
  computed: {
    ...mapGetters(['fullName']),
    ...mapState(['curUser']),
    submittedApplication() {
      return +this.curUser.submitted === 1;
    },
  },
};

const ApplicantPage = {
  template: `
    <b-row align-h="center">
      <b-col cols="12" sm="4" md="3" xl="2" class="mt-3">
        <b-nav tabs align="center">
          <b-nav-item to="/applicant/edt">Edit Profile</b-nav-item>
          <b-nav-item to="/applicant/pwd">Change Password</b-nav-item>
          <b-nav-item to="/applicant/olt" v-if="+curUser.actions.approved === 1">Offer Letter</b-nav-item>
        </b-nav tabs>
      </b-col>
      <b-col>
        <router-view></router-view>
      </b-col>
    </b-row>
  `,
  computed: mapState(['curUser']),
};

/* Admin Section */
const AdminDashboard = {
  template: `
  <div class="text-center">
			<b-jumbotron>
				<template v-slot:header>
				<h2><small><b-icon icon="tools"></b-icon></small> Admin Dashboard</h2> 
				</template>
				<template v-slot:lead>
				<h5 class="text-success text-wrap h"><small>Welcome</small> {{ fullName }}</h5>
				</template>
			</b-jumbotron>
		</div>
	`,
  computed: mapGetters(['fullName']),
};

// <b-nav-item>Edit Profile</b-nav-item>

const AdminPage = {
  template: `
  <b-row align-h="center">
		<b-col cols="12" sm="4" md="3" xl="2" class="mt-3">
			<b-nav tabs align="center" small>
        <b-nav-item to="/admin/applicants">Applicants</b-nav-item>
        <b-nav-item to="/admin/admins">Admins</b-nav-item>        
        <b-nav-item to="/admin/pwd">Change Password</b-nav-item>
			</b-nav tabs>
		</b-col>
    <b-col class="">
      <router-view></router-view>
    </b-col>
  </b-row>
  `,
  mixins: [alertMixin],
  data() {
    return { uForm: {} };
  },
  computed: {
    ...mapState(['curUser']),
    ...mapGetters(['userId']),
  },
  methods: {
    ...mapActions(['setApplicants', 'setAdmins', 'setSetup']),
  },
  created() {
    axios
      .all([axios.get('api/applicants.php?_u=2'), axios.get('api/admins.php?_u=2'), axios.get('api/setup.php')])
      .then(axios.spread((apps, admins, setup) => {
        this.setApplicants(apps.data);
        this.setAdmins(admins.data);
        this.setSetup(setup.data);
      }))
      .catch(err => console.error(err));
  },
};

const ApplicantsTable = {
  template: `
    <div>
      <b-form v-if="showFieldOptions">
        <b-form-group label="Select table fields to show">
        <b-form-checkbox-group id="table-fields" name="table-fields" v-model="fields" :options="tableFields" switches size="sm"></b-form-checkbox-group>
        </b-form-group>
      </b-form>
      <h4 class="thm-text text-center py-2" v-else>Applicant Lists</h4>				
      <b-table :items="applicants" :fields="fields" primary-key="id" hover striped  bordered :stacked="stacked" :tbody-transition-props="{name:'flip-list'}" sort-icon-left show-empty small>
        <template #empty>
          <b-alert show>No Applicant Yet!</b-alert>
        </template>				
        <template v-slot:cell(index)="{index}">
        {{ index + 1 }}
        </template>				
        <template v-slot:head(actions)={label}>
        <b-icon icon="tools"></b-icon> {{ label }}</template>	
        <template v-slot:cell(actions)="{item: q, detailsShowing, toggleDetails}">
          <b-link class="text-nowrap" @click="edit(q)"><b-icon icon="pencil"></b-icon>edit</b-link> . 
          <b-link class=" text-nowrap" @click="del(q)"><b-icon icon="trash"></b-icon>del</b-link> .
          <b-form-checkbox v-model="detailsShowing" @change="toggleDetails" switch>Details</b-form-checkbox>
        </template>			
        <template v-slot:cell(full_name)="{item: q}">
          {{ q[q.loan_type].name }}
        </template>			
        <template v-slot:cell(application_no)="{item: q}">
          {{ q.application_no }}
        </template>			
        <template v-slot:cell(phone_no)="{item: q}">
          {{ q[q.loan_type].phone_no }}
        </template>			
        <template v-slot:cell(loan_type)="{item: q}">
          {{ q.loan_type ==='personal' ? 'Personal' : 'Group' }}
        </template>			
        <template v-slot:cell(amount_required)="{item: q}">
          {{ q.loan[q.loan.length-1].amount_required }}
        </template>			
        <template v-slot:cell(amount_given)="{item: q}">
          <b-form-input type="number" v-model="q.loan[q.loan.length-1].amount_given" :plaintext="!editAmountGiven" size="sm" trim number required></b-form-input>
          <span v-if="editAmountGiven">
          <b-link @click="editAmountGiven=false">Cancel &nbsp;</b-link>
          <b-link @click="saveAmountGiven(q)">Save</b-link>
          </span>
          <b-link v-else @click="editAmountGiven=true">edit</b-link>
        </template>			
        <template v-slot:cell(business_type)="{item: q}">
          {{ q.loan[q.loan.length-1].business_type }}
        </template>			
        <template v-slot:cell(business_location)="{item: q}">
          {{ q.loan[q.loan.length-1].business_location }}          
        </template>

      <template v-slot:row-details="{item: q, toggleDetails}">
        <b-card>
          <b-row class="mb-2">
            <b-col cols="12"><h5 class="bg-dark thm-text m-0 mb-1 p-1 rounded">Account Information</h5></b-col>
            <b-col cols="auto" class="p-1"><b>Former Beneficiary: </b><span>{{ q.former_beneficiary }}</span></b-col>         
            <b-col cols="auto" class="p-1"><b>Bank Name: </b><span>{{ q.bank.name }}</span></b-col>         
            <b-col cols="auto" class="p-1"><b>Bank Address: </b><span>{{ q.bank.address }}</span></b-col>         
            <b-col cols="auto" class="p-1"><b>Bank Account No.: </b><span>{{ q.bank.account_no }}</span></b-col> 
          </b-row>   
          <b-row class="mb-2" v-if="q.loan_type==='personal'">
            <b-col cols="12"><h5 class="bg-dark thm-text m-0 mb-1 p-1 rounded">Personal Information</h5></b-col>
            <b-col cols="12" class="p-1 text-center" v-if="q.personal.passport"><b>Passport - click to view: </b><b-link :href="q.personal.passport" target="_blank"><b-img :src="q.personal.passport" alt="Passport" width="100"></b-img></b-link></b-col>
            <b-col cols="auto" class="p-1"><b>Email: </b><span>{{ q.personal.email }}</span></b-col>
            <b-col cols="auto" class="p-1"><b>National ID No: </b><span>{{ q.personal.nid_no }}</span></b-col>
            <b-col cols="auto" class="p-1"><b>Date of Birth: </b><span>{{ q.personal.dob }}</span></b-col>
            <b-col cols="auto" class="p-1"><b>Residential Address: </b><span>{{ q.personal.address }}</span></b-col>
            <b-col cols="auto" class="p-1"><b>Gender: </b><span>{{ q.personal.gender }}</span></b-col>
            <b-col cols="auto" class="p-1"><b>Marital Status: </b><span>{{ q.personal.marital_status }}</span></b-col>
            <b-col cols="auto" class="p-1"><b>Occupation: </b><span>{{ q.personal.occupation }}</span></b-col>
            <b-col cols="auto" class="p-1"><b>Religion: </b><span>{{ q.personal.religion }}</span></b-col>
            <b-col cols="auto" class="p-1"><b>City: </b><span>{{ q.personal.city }}</span></b-col>
            <b-col cols="auto" class="p-1"><b>LGA: </b><span>{{ q.personal.lga }}</span></b-col>
            <b-col cols="auto" class="p-1"><b>Highest Educational Qualification: </b><span>{{ q.personal.qualification }}</span></b-col>
            <b-col cols="auto" class="p-1"><b>Any Physical Disability: </b><span>{{ q.personal.disability }}</span></b-col>
            <b-col cols="auto" class="p-1" v-for="kn in q.next_of_kin" :key="'kin' + kn"><b>{{ kn | replaceStr("_", " ") | capitalize }} of Next of Kin: </b><span>{{ q.next_of_kin[kn] }}</span></b-col>
          </b-row>  

          <b-row class="mb-2" v-if="q.loan_type==='group_org'">
            <b-col cols="12"><h5 class="bg-dark thm-text m-0 mb-1 p-1 rounded">Group Information</h5></b-col>
            <b-col cols="auto" class="p-1"><b>Reg. No.: </b><span>{{ q.group_org.reg_no }}</span></b-col>         
            <b-col cols="auto" class="p-1"><b>Email: </b><span>{{ q.group_org.email }}</span></b-col>         
            <b-col cols="auto" class="p-1"><b>Business or Office Address: </b><span>{{ q.group_org.address }}</span></b-col>
          
            <b-col cols="12">
              <b-col cols="12" class="mb-2"><h5 class="bg-dark thm-text m-0 mb-1 p-1 rounded">Particulars of Group Executives: Chairman, Secretary and Treasurer</h5></b-col>
              <b-row class="mb-2" v-for="exco in q.group_org.excos" :key="exco.id">
                <b-col cols="auto" class="p-1"><b>Name of Exco: </b><span>{{ exco.name }}</span></b-col>         
                <b-col cols="auto" class="p-1"><b>Designation of Exco: </b><span>{{ exco.designation }}</span></b-col>         
                <b-col cols="auto" class="p-1"><b>Phone No. of Exco: </b><span>{{ exco.phone_no }}</span></b-col>         
                <b-col cols="auto" class="p-1"><b>Address of Exco: </b><span>{{ exco.address }}</span></b-col> 
              </b-row>         
            </b-col>
          </b-row>         
          
          <b-row class="mb-2">
            <b-col cols="12"><h5 class="bg-dark thm-text m-0 mb-1 p-1 rounded">Loan Details - The Proposed Project</h5></b-col>
            <b-col cols="auto" class="p-1"><b>Type of Business/Project: </b><span>{{ q.loan[q.loan.length-1].business_type }}</span></b-col>                      
            <b-col cols="auto" class="p-1"><b>Business Location: </b><span>{{ q.loan[q.loan.length-1].business_location }}</span></b-col>                      
            <b-col cols="auto" class="p-1"><b>Experience: </b><span>{{ q.loan[q.loan.length-1].experience }}</span></b-col>                      
            <b-col cols="auto" class="p-1"><b>CAC Reg. No.: </b><span>{{ q.loan[q.loan.length-1].cac_no }}</span></b-col>            
          </b-row> 
        
          <b-row class="mb-2">
            <b-col cols="12"><h5 class="bg-dark thm-text m-0 mb-1 p-1 rounded">Guarantor Information</h5></b-col>
            <b-col cols="12">
              <b-row class="mb-2" v-for="gt in q.guarantor" :key="gt.id">
                <b-col cols="12" class="p-1 text-center" v-if="gt.passport"><b>Passport - click to view: </b><b-link :href="gt.passport" target="_blank"><b-img :src="gt.passport" alt="Passport" width="100"></b-img></b-link></b-col>
                <b-col cols="auto" class="p-1"><b>Full Name (Surname First) : </b><span>{{ gt.name }}</span></b-col>                      
                <b-col cols="auto" class="p-1"><b>Residential Address: </b><span>{{ gt.address }}</span></b-col>                      
                <b-col cols="auto" class="p-1"><b>Organization: </b><span>{{ gt.organization }}</span></b-col>                      
                <b-col cols="auto" class="p-1"><b>Phone No: </b><span>{{ gt.phoneno }}</span></b-col>                      
                <b-col cols="auto" class="p-1"><b>Email: </b><span>{{ gt.email }}</span></b-col>
                <b-col cols="auto" class="p-1"><b>Designation: </b><span>{{ gt.designation }}</span></b-col>
                <b-col cols="auto" class="p-1"><b>Date of First Appointment: </b><span>{{ gt.first_appointment }}</span></b-col>
                <b-col cols="auto" class="p-1"><b>Biometric Number: </b><span>{{ gt.biometric_no }}</span></b-col>
                <b-col cols="12" class="p-1 text-center" v-if="gt.biometric"><b>Biometric - click to view: </b><b-link :href="gt.biometric" target="_blank"><b-img :src="gt.biometric" alt="Biometric" width="100"></b-img></b-link></b-col> 
                <b-col cols="auto" class="p-1"><b>Date of Last Promotion: </b><span>{{ gt.last_promotion }}</span></b-col>                     
                <b-col cols="auto" class="p-1"><b>Grade Level: </b><span>{{ gt.grade_level }}</span></b-col>                     
                <b-col cols="auto" class="p-1"><b>Step: </b><span>{{ gt.step }}</span></b-col>                     
                <b-col cols="auto" class="p-1"><b>Ministry: </b><span>{{ gt.ministry }}</span></b-col>                     
              </b-row> 
            </b-col>                   
          </b-row>

          <b-row class="mb-2" align-h="center" align-v="center">
            <b-col cols="12"><h5 class="bg-dark thm-text m-0 mb-1 p-1 rounded">Comments and Recommendations</h5></b-col>                
            <b-col cols="auto" class="p-1" v-for="cm in q.comments" :key="cm.id">            
              <b-card :title="cm.level | replaceStr('_', ' ') | capitalize"  class="text-center">
                <p><b-form-textarea v-model="cm.comment" :plaintext="!cm.edit" rows="1" max-rows="10"></b-form-textarea></p>
                <small class="d-block">Modified By: {{ cm.updated_by }}</small>
                <small class="d-block">Modified On: {{ new Date(cm.updated_on).toLocaleString()}}</small>
                <div class="py-2" v-if="cm.level === curUser.level">
                  <span v-if="cm.edit">
                    <b-button size="sm" variant="danger" @click="cm.edit=false"><b-icon icon="x-circle-fill"></b-icon> Cancel</b-button>
                    <b-button size="sm" class="thm-btn" variant="danger" @click="saveComments(q, cm)">Save <b-icon icon="cursor-fill"></b-icon></b-button>
                  </span>
                  <b-button v-else size="sm" class="thm-btn" variant="danger" @click="cm.edit=true">Edit <b-icon icon="pencil-square"></b-icon></b-button>
                </div>                
              </b-card>
            </b-col>                  
          </b-row>

          <div class="text-center">
            <b-form-checkbox v-model="q.actions.shortlisted" value="1" number unchecked-value="0" @change="saveActions(q)" inline switch>
              Shortlisted
            </b-form-checkbox>
            <b-form-checkbox v-model="q.actions.approved" value="1" number unchecked-value="0" @change="saveActions(q)" inline switch>
              Approved
            </b-form-checkbox>
            <b-form-checkbox v-model="q.actions.disbursed" value="1" number unchecked-value="0" @change="saveActions(q)" inline switch>
              Disbursed
            </b-form-checkbox>
            <b-form-checkbox v-model="q.actions.repaid" value="1" number unchecked-value="0" @change="saveActions(q)" inline switch>
              Repaid
            </b-form-checkbox>
            <div class="mt-1">
              <b-button size="sm" class="thm-btn" variant="danger" @click="">Send Mail <b-icon icon="envelope-fill"></b-icon></b-button>
              <b-button size="sm" class="thm-btn" variant="danger" @click="">Send SMS <b-icon icon="phone-fill"></b-icon></b-button>
              <b-button size="sm" class="thm-btn" variant="danger" @click="toggleDetails">Hide Details <b-icon icon="caret-up-fill"></b-icon></b-button>
            </div>
          </div>
        </b-card>
      </template>		
      </b-table>
    </div> 
	`,
  props: {
    applicants: Array,
    edit: Function,
    del: Function,
    showFieldOptions: Boolean,
  },
  data() {
    return {
      editAmountGiven: false,
      stacked: 'md',
      fields: [
        { key: 'index', label: 'S/N' },
        'loan_type',
        'full_name',
        'application_no',
        'phone_no',
        'amount_required',
        'amount_given',
        'business_type',
        'business_location',
        'actions',
      ],
      tableFields: [
        { text: 'S/N', value: { key: 'index', label: 'S/N' } },
        { text: 'Loan Type', value: 'loan_type' },
        { text: 'Full Name', value: 'full_name' },
        { text: 'Application No', value: 'application_no' },
        { text: 'Phone No', value: 'phone_no' },
        { text: 'Amount Required', value: 'amount_required' },
        { text: 'Amount Given', value: 'amount_given' },
        { text: 'Business Type', value: 'business_type' },
        { text: 'Business Location', value: 'business_location' },
        { text: 'Actions', value: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState(['curUser']),
    ...mapGetters([]),
  },
  methods: {
    ...mapActions(['setLoading']),
    mailApplicant(applicant) {
      this.setLoading(true);
      let data = { applicant };
      axios
        .post(`api/mail_applicant.php`, data)
        .then(res => {
          this.setLoading(false);
          let variant = res.data.mailsent == 1 ? 'success' : 'danger';
          scroll(0, 0);
          this.$parent.setAlert(`${res.data.message}`, `${variant}`);
        })
        .catch(err => {
          this.setLoading(false);
          scroll(0, 0);
          this.$parent.setAlert(`${err.message}`, 'danger');
        });
    },
    saveActions(applicant) {
      axios
        .put(`api/applicants.php`, {...applicant, type: 'actions' })
        .then(res => {
          // console.log(res.data);
        })
        .catch(err => {
          scroll(0, 0);
          this.$parent.setAlert(`${err.message}`, 'danger');
        });
    },
    saveAmountGiven(applicant) {
      axios
        .put(`api/applicants.php`, {...applicant, type: 'loan' })
        .then(res => {
          // console.log(res.data);
          this.editAmountGiven = false;
        })
        .catch(err => {
          scroll(0, 0);
          this.$parent.setAlert(`${err.message}`, 'danger');
        });
    },
    saveComments(applicant, comment) {
      comment.updated_by = this.curUser.name;
      comment.updated_on = new Date();
      comment.edit = false;
      applicant.comments.forEach((cm, idx) => (cm.id === comment.id ? applicant.comments.splice(idx, 1, comment) : ''));
      axios
        .put(`api/applicants.php`, {...applicant, type: 'comments' })
        .then(res => {
          // console.log(res.data);
        })
        .catch(err => {
          scroll(0, 0);
          this.$parent.setAlert(`${err.message}`, 'danger');
        });
    },
  },
};

const ApplicantSettings = {
  template: `
		<div class="p-2">									
      <h5 class="thm-text text-center">
        <b-icon icon="list-ol"></b-icon> Applicants
      </h5>	
      <b-nav align="center" tabs small>
        <b-nav-item @click="setView('unsubmitted')" :active="unsubmitted">yet to submit <b-badge variant="success" v-show="unsubmitted">{{ curApplicants.length }}</b-badge></b-nav-item>
        <b-nav-item @click="setView('submitted')" :active="submitted">submitted <b-badge variant="success" v-show="submitted">{{ curApplicants.length }}</b-badge></b-nav-item>
        <b-nav-item @click="setView('shortlisted')" :active="shortlisted">shortlisted <b-badge variant="success" v-show="shortlisted">{{ curApplicants.length }}</b-badge></b-nav-item>
        <b-nav-item @click="setView('approved')" :active="approved">approved <b-badge variant="success" v-show="approved">{{ curApplicants.length }}</b-badge></b-nav-item>
        <b-nav-item @click="setView('disbursed')" :active="disbursed">disbursed <b-badge variant="success" v-show="disbursed">{{ curApplicants.length }}</b-badge></b-nav-item>
        <b-nav-item @click="setView('repaid')" :active="repaid">repaid <b-badge variant="success" v-show="repaid">{{ curApplicants.length }}</b-badge></b-nav-item>
      </b-nav>	
      <div class="text-center mt-2" v-show="!unsubmitted">        
        <b-form-checkbox v-model="showFields" switch size="sm" inline>fields</b-form-checkbox>
      </div> 

      <show-alert :alert-variant="alertVariant" :alert-msg="alertMsg" :show-alert="showAlert"></show-alert>    
      <div v-if="showForm">
        <application-form :applicant="userForm"></application-form>
        <div class="text-center my-2">
          <b-button size="sm" variant="danger" @click="showForm = false"><b-icon icon="x-circle-fill"></b-icon> Close Application Editing</b-button>
        </div>
      </div>	
      <applicants-table :show-field-options="showFields" :applicants="curApplicants" :edit="edit" :del="del"></applicants-table>	
		</div>
	`,
  mixins: [alertMixin],
  components: {
    'applicants-table': ApplicantsTable,
  },
  data() {
    return {
      showForm: false,
      showFields: false,
      userForm: {},
      cView: {
        submitted: false,
        unsubmitted: false,
        shortlisted: false,
        approved: false,
        disbursed: false,
        repaid: false,
      },
      curApplicants: [],
    };
  },
  computed: {
    ...mapState(['applicants']),
    submitted() {
      return this.cView.submitted;
    },
    unsubmitted() {
      return this.cView.unsubmitted;
    },
    shortlisted() {
      return this.cView.shortlisted;
    },
    approved() {
      return this.cView.approved;
    },
    disbursed() {
      return this.cView.disbursed;
    },
    repaid() {
      return this.cView.repaid;
    },
  },
  methods: {
    ...mapActions(['setLoading', 'setApplicants']),
    curView(view) {
      Object.keys(this.cView).forEach(cv => (this.cView[cv] = false));
      this.cView[view] = true;
    },
    setView(view) {
      switch (view) {
        case 'submitted':
          this.curView('submitted');
          this.curApplicants = this.applicants.filter(a => +a.submitted === 1 || +a.submitted === 2);
          break;
        case 'unsubmitted':
          this.curView('unsubmitted');
          this.curApplicants = this.applicants.filter(a => +a.submitted === 0);
          break;
        case 'shortlisted':
          this.curView('shortlisted');
          this.curApplicants = this.applicants.filter(a => +a.actions.shortlisted === 1);
          break;
        case 'approved':
          this.curView('approved');
          this.curApplicants = this.applicants.filter(a => +a.actions.approved === 1);
          break;
        case 'disbursed':
          this.curView('disbursed');
          this.curApplicants = this.applicants.filter(a => +a.actions.disbursed === 1);
          break;
        case 'repaid':
          this.curView('repaid');
          this.curApplicants = this.applicants.filter(a => +a.actions.repaid === 1);
          break;
        default:
          break;
      }
    },
    initializeView() {
      this.setView('submitted');
      this.curView['submitted'] = true;
    },
    edit(user) {
      this.userForm = {...user };
      this.showForm = true;
      scroll(0, 0);
    },
    del(user) {
      let ok = confirm('Are sure you want to delete applicant(s)?');
      if (ok) {
        this.setLoading(true);
        axios
          .delete(`api/applicants.php?${user.id}`)
          .then(res => {
            console.log(res.data);
            if (res.data[0].id || Array.isArray(res.data)) {
              this.setApplicants(res.data);
              this.initializeView();
              this.setAlert('Applicant(s) successfully deleted.', 'success');
            } else {
              this.setAlert(`${res.data}`, 'danger');
            }
          })
          .catch(err => {
            this.setAlert(`${err.message}`, 'danger');
          });
        this.setLoading(false);
        scroll(0, 0);
      }
    },
  },
  created() {
    this.initializeView();
  },
};


const AdminForm = {
  template: `
			<div class="mt-2 mb-2 border-bottom border-top shadow p-2" v-if="showForm">
				<b-form @submit.prevent="formSubmit()" @reset.prevent="formReset">
					<div class="d-flex flex-column">
						<h4 class="text-success text-center" v-if="formType === 'new'">
						<b-icon icon="person-plus-fill"></b-icon> New Admin</h4>
						<h4 class="text-success text-center" v-else>
						<b-icon icon="pencil-square"></b-icon> Edit Admin</h4>							
						<b-row>
							<b-col cols="12" md="6" lg="4"><b-form-group label="Full Name (surname first) *" label-for="fname">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="person-circle"></b-icon></b-input-group-prepend>
									<b-form-input id="fname" v-model="uForm.name" trim required autofocus></b-form-input>
								</b-input-group>
              </b-form-group></b-col>
              
							<b-col cols="12" md="6" lg="4"><b-form-group label="User ID" label-for="user-id">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="shield-lock"></b-icon></b-input-group-prepend>
									<b-form-input id="user-id" v-model="uForm.username" trim required></b-form-input>
								</b-input-group>
							</b-form-group></b-col>

              <b-col cols="12" md="6" lg="4" v-if="formType==='new'"><password-input label="Password" v-model.trim="uForm.passwd" :value="uForm.passwd"></password-input></b-col>		
              <input type="hidden" v-model.trim="uForm.passwd" v-else-if="formType==='edit'">

							<b-col cols="12" md="6" lg="4"><b-form-group label="Level:" label-for="level">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="shuffle"></b-icon></b-input-group-prepend>
									<b-form-select id="level" v-model="uForm.level" :options="level" required number></b-form-select>
								</b-input-group>
              </b-form-group></b-col>
              
							<b-col cols="12" md="6" lg="4"><b-form-group label="Status:" label-for="status">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="shuffle"></b-icon></b-input-group-prepend>
									<b-form-select id="status" v-model="uForm.is_active" :options="status" required number></b-form-select>
								</b-input-group>
							</b-form-group></b-col>
						</b-row>
						<b-row align-h="center"><b-col cols="auto">
							<button class="btn btn-danger btn-sm thm-btn" type="submit"><b-icon icon="cursor"></b-icon>&nbsp;{{ formType === 'new' ? 'Add' : 'Save Changes' }}</button> &nbsp; 
							<button class="btn btn-danger btn-sm" type="reset" v-if="formType === 'new'"><b-icon icon="backspace"></b-icon>&nbsp;Clear</button> 
							<button class="btn btn-danger btn-sm" @click="formCancel"><b-icon icon="x-octagon"></b-icon>&nbsp;Cancel</button>  
						</b-col></b-row>	
					</div>				
				</b-form>
			</div>
	`,
  props: {
    showForm: Boolean,
    userForm: Object,
    formType: String,
    add: Function,
  },
  data() {
    return {
      status: [
        { text: 'Active', value: 1 },
        { text: 'Inactive', value: 0 },
      ],
      level: [
        { text: 'Field Officer', value: 'field_officer' },
        { text: 'Loan Admin', value: 'loan_admin' },
        { text: 'Director', value: 'director' },
      ],
      uForm: {},
    };
  },
  methods: {
    ...mapActions(['setLoading', 'setAdmins']),
    formSubmit() {
      this.setLoading(true);
      let user = this.uForm;
      let msg = this.formType === 'new' ? 'added' : 'updated';
      axios
        .post('api/admins.php', this.uForm)
        .then(res => {
          if (res.data[0].id) {
            this.setAdmins(res.data);
            this.$parent.setAlert(`${user.name} successfully ${msg}`, 'success');
          } else {
            this.$parent.setAlert(`${user.name} not successfully ${msg}`, 'danger');
          }
        })
        .catch(err => this.$parent.setAlert(`${err.message}`, 'danger'));
      this.formReset();
      this.setLoading(false);
    },
    formReset() {
      // Trick to reset/clear native browser form validation state
      this.$parent.showForm = false;
      this.$parent.userForm = {};
      this.uForm = {};
      let ftype = this.formType;
      this.$parent.formType = '';
      this.$nextTick(() => {
        ftype === 'new' ? this.$parent.add() : '';
      });
    },
    formCancel() {
      this.$parent.showForm = false;
      this.$parent.userForm = {};
      this.uForm = {};
      this.$parent.formType = '';
    },
  },
  watch: {
    formType(newValue, oldValue) {
      this.uForm = newValue !== oldValue ? {...this.userForm } : {};
    },
  },
};

const AdminsTable = {
  template: `				
		<b-table :items="admins" :fields="fields" primary-key="id" hover striped  bordered :stacked="stacked" :tbody-transition-props="{name:'flip-list'}" sort-icon-left small>				
      <template #empty>
          <b-alert show>No Admin Yet!</b-alert>
      </template>	
      <template #cell(index)="{index}">
			{{ index + 1 }}
			</template>				
			<template #head(actions)={label}>
        <b-icon icon="tools"></b-icon> {{ label }}</template>	
        <template #cell(actions)="{item: q, detailsShowing, toggleDetails}">
          <span v-if="curUser.level==='director'">
            <b-link class="text-nowrap" @click="edit(q)"><b-icon icon="pencil"></b-icon>edit</b-link> . 
            <b-link class="text-nowrap" @click="del(q)"><b-icon icon="trash"></b-icon>del</b-link> .
          </span>
          <b-form-checkbox v-model="detailsShowing" @change="toggleDetails" switch>Details</b-form-checkbox>
        </template>			
			<template #cell(level)="{value}">
				{{ value | replaceStr('_', ' ') | capitalize }}
			</template>					
			<template #cell(status)="{item: q}">
				{{ +q.is_active === 1 ? 'Active' : 'Inactive' }}
			</template>					
			
      
      <template v-slot:row-details="{item: q, toggleDetails}">
        <b-card>
          <b-row class="mb-2">
            <b-col cols="auto" class="p-1"><b>No Details Yet </b><span></span></b-col>
                            
          </b-row>
          <div class="text-center"><b-button size="sm" class="thm-btn" variant="success" @click="toggleDetails">Hide Details</b-button></div>
        </b-card>
      </template>		
    </b-table> 
	`,
  props: {
    admins: Array,
    edit: Function,
    del: Function,
  },
  data() {
    return {
      stacked: 'sm',
      fields: [
        { key: 'index', label: 'S/N' },
        { key: 'name', label: 'Full Name', sortable: true },
        { key: 'level', sortable: true },
        'username',
        'status',
        'actions',
      ],
    };
  },
  computed: {
    ...mapState(['curUser']),
    ...mapGetters([]),
  },
};

const AdminSettings = {
  template: `
		<div class="p-2">									
				<h5 class="thm-text d-flex justify-content-around">
          <span><b-icon icon="list-ol"></b-icon> Admins <b-badge variant="success">{{ curAdmins.length }}</b-badge></span>
          <small v-if="curUser.level==='director'" class="" @click="add"><b-button size="sm" class="thm-btn"><b-icon icon="person-plus"></b-icon> new admin</b-button></small>	
				</h5>			
      <show-alert :alert-variant="alertVariant" :alert-msg="alertMsg" :show-alert="showAlert"></show-alert>
      <admin-form :form-type="formType" :user-form="userForm" :show-form="showForm" :add="add"></admin-form>
      <admins-table :admins="curAdmins" :edit="edit" :del="del"></admins-table>			
		</div>
	`,
  mixins: [alertMixin],
  components: { 'admins-table': AdminsTable, 'admin-form': AdminForm },
  data() {
    return {
      userForm: {},
      showForm: false,
      formType: '',
    };
  },
  computed: {
    ...mapState(['admins', 'curUser']),
    curAdmins() {
      return this.admins;
    },
  },
  methods: {
    ...mapActions(['setLoading', 'setAdmins']),
    add() {
      this.userForm = {};
      this.userForm = {
        id: uuidv4(),
        is_active: 1,
        username: '',
        name: '',
        passwd: '',
        level: 'field_officer',
        new_form: 1,
      };
      this.formType = 'new';
      this.showForm = true;
    },
    edit(user) {
      this.userForm = {...user };
      this.formType = 'edit';
      this.showForm = true;
      scroll(0, 0);
    },
    del(user) {
      let ok = confirm('Are sure you want to delete admin(s)?');
      if (ok) {
        this.setLoading(true);
        axios
          .delete(`api/admins.php?${user.id}`)
          .then(res => {
            if (res.data[0].id || Array.isArray(res.data)) {
              this.setAdmins(res.data);
              this.setAlert('Admin(s) successfully deleted.', 'success');
            } else {
              this.setAlert('Admin(s) not successfully deleted', 'danger');
            }
          })
          .catch(err => this.setAlert(`${err.message}`, 'danger'));
        this.setLoading(false);
        scroll(0, 0);
      }
    },
  },
};