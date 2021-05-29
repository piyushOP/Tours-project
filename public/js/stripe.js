const stripe = Stripe('pk_test_51Iw334SILZyuwKr8wPMBFmeD7obeQrBQ7jrsh42keSXSFJK4xM7nW3PJt5xkjili6afXpOF9CNJmMCCLEzT3OVQG00e87pBXSC');
import { showAlert } from './alerts';
import axios from 'axios';

export const bookTour = async tourId => {
   
   try{

      // 1) Get checkout session from API
      const session = await axios.get(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`);

      console.log(session);

      // 2) Create checkout form + Charge credit-card
      await stripe.redirectToCheckout({
         sessionId: session.data.session.id
      });


   }catch(err){
      console.log(err);
      showAlert('error', err);
   }
}