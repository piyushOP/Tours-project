import axois from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'user data'
export const updateUserData = async (data, type) => {
   try{

      const url = type === 'password' ? 'http://localhost:3000/api/v1/users/updateMyPassword' : 'http://localhost:3000/api/v1/users/updateMe';
      
      const res = await axois.patch(url, data);

      if(res.status === 200){
         showAlert('success', `${type.toUpperCase()} updated successfully!`);
      }

   }catch(err){
      showAlert('error', err.response.data.message);
   }
}