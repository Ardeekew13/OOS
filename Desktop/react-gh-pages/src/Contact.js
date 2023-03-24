import React from 'react'
import emailjs from '@emailjs/browser';

export const Contact = () =>{
  const form =useRef();
  const sendEmail = (e) => {
   e.preventDefault();
 
   emailjs.sendForm('service_n67ckkq', 'template_g1y67gf', form.current, 's2NFCYTwJKr-mNr5H')
       .then((result) => {
           console.log(result.text);
       }, (error) => {
           console.log(error.text);
       });
       e.target.reset()
   };

function Contact() {
  return ( 
    <section id="contact" className='lg:pb-20 md:pb-16 sm:pb-14 xs:pb-12'> 
    <div className='text-center my-auto'>
      <h2 className='text-3xl  sm:text-5xl flex gap-2 pt-14 justify-center font-bold md:flex md:justify-center md:items-center xs:flex xs:justify-center xs:items-center sm:justify-center sm:items-center sm:mx-auto flex-col'>Contact <h2 className='text-[#90CCF3]'> Me</h2></h2>
      <div className='mt-4 flex md:flex-row sm:flex-row flex-col gap-6 max-w-5xl p-6  mx-auto pb-10 w-[600px] xs:w-auto xs:px-4 '>
      <form ref={form} onSubmit={(sendEmail)} className='flex flex-col flex-1 gap-5 rounded-lg outline-8 md:w-auto sm:mx-auto md:mx-auto xs:flex xs:flex-col xs:px-4 '>
      <input className=' w-full h-12 rounded-lg border-[2px] pl-2 border-b-white bg-gray-900 hover:border-[#7441b9]' name='user_name'  id="name"type="text" placeholder="Your Name" required/>
        <input className=' w-full h-12 rounded-lg border-[2px] pl-2 border-b-white bg-gray-900 hover:border-[#7441b9]' name='user_email' id="email" type="Email" placeholder="Your Email Address" required/>
        <textarea className='w-full h-32 rounded-lg border-[2px] pl-2 border-b-white bg-gray-900 hover:border-[#7441b9]'name='message' id="message" placeholder='Your Message' required></textarea>
        <button type='submit'  className='border-white border-2 px-6 py-3 hover:bg-[#7441b9] hover:border-[#7441b9]'>Send Message</button>
      </form>

      </div>
    </div>

    </section>
  )
}
}
export default Contact
