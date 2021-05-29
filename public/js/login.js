import axios from 'axios';
import { showAlert } from './alerts';


export const login = async (email, password) => {
   try{
      const res = await axios.post('/api/v1/users/login', {
         email: email,
         password: password
      })

      // console.log(res);

      if(res.status === 200){
         showAlert('success', "Logged in successfully !")

         window.setTimeout(()=>{
            location.assign('/');
         },1500);
      }

   }catch(err){
      showAlert('error', err.response.data.message);
   }
}



export const signup = async (name, email, password, passwordConfirm) => {
   try{
      const res = await axios.post('/api/v1/users/signup', {
         name: name,
         email: email,
         password: password,
         passwordConfirm: passwordConfirm
      })

      // console.log(res);

      if(res.status === 201){
         showAlert('success', "Signed Up successfully !")

         window.setTimeout(()=>{
            location.assign('/');
         },1500);
      }

   }catch(err){
      showAlert('error', err.response.data.message);
   }
}


export const logout = async ()=> {
   try{
      
      const res = await axios.get('/api/v1/users/logout');
      if(res.status === 200){
         location.assign('/');
      }

   }catch(err){
      showAlert('error', 'Error logging out! Try Again..')
   }
}

