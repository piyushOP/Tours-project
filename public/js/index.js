import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout, signup } from './login';
import { updateUserData } from './updateUserData';
import { bookTour } from './stripe';

// DOM ELEMENTS
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour')



if(mapBox){
   const locations = JSON.parse(document.getElementById('map').dataset.locations);
   displayMap(locations);
}

if(loginForm){
   loginForm.addEventListener('submit', (e)=> {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      login(email, password);
   })
}

if(signupForm){
   signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      document.getElementById('signup-btn').innerHTML = 'Signing you in....'

      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const passwordConfirm = document.getElementById('signup-passwordConfirm').value;
   
      signup(name, email, password, passwordConfirm);
   })
}

if(logOutBtn){
   logOutBtn.addEventListener('click', logout);
}

if(userDataForm){
   userDataForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const form = new FormData();
      form.append('name', document.getElementById('name').value);
      form.append('email', document.getElementById('email').value);
      form.append('photo', document.getElementById('photo').files[0]);

      console.log(form);

      updateUserData(form , 'data');
   })
}

if(userPasswordForm){
   userPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      document.querySelector('.btn-save-password').innerHTML = 'Updating....'

      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;

      await updateUserData({passwordCurrent, password, passwordConfirm}, 'password');
      
      document.querySelector('.btn-save-password').innerHTML = 'Save password'
      document.getElementById('password-current').value = ''
      document.getElementById('password').value = ''
      document.getElementById('password-confirm').value = ''
   })
}


if(bookBtn){
   bookBtn.addEventListener('click', (e)=> {
      e.target.innerHTML = 'Processing...';
      const { tourId } = e.target.dataset
      bookTour(tourId);
   })
}