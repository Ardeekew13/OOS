import React from 'react'
import icon from '../src/images/tg.png'
import icon2 from '../src/images/fb.png'
import icon3 from '../src/images/gmail.png'

function Footer() {
  return (
    <div className='bg-[#283247] text-sm p-4  flex justify-between '>
        <p>
            Zamora,Bilar,Bohol
        </p>
        <div className='flex mx-2 gap-2'>
            <img className='w-[25px] h-[25px]  ' src={icon} alt="icon"></img>
            <img className='w-[25px] h-[25px]  ' src={icon2} alt="icon"></img>
            <img className='w-[25px] h-[25px]  ' src={icon3} alt="icon"></img>
        </div>
      
    </div>
  );
}

export default Footer

