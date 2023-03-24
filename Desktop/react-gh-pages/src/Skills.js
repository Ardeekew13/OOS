import React from 'react'
import algorithmIMG from '../src/images/algorithm.png';
import learningIMG from '../src/images/online-learning.png';
import Dlogo1 from '../src/images/Figma.png';
import Dlogo2 from '../src/images/Illustrator.png';
import Dlogo3 from '../src/images/Vscode.png';
import Dlogo4 from '../src/images/js.png';
import Dlogo5 from '../src/images/tailwind.png';
import Dlogo6 from '../src/images/gh.png';
import Dlogo7 from '../src/images/react.png';
import {motion} from 'framer-motion'

function Services() {
  return (
    <section id="skills">
    <div className='pt-32 h-[full]'> 
    <h2 className='text-3xl  sm:text-5xl flex gap-2 pt-15 justify-center font-bold xs:text-4xl'><h2 className='text-[#90CCF3]'> My</h2>Skills</h2>
        </div>
            <div className='pt-20 max-w-[1240px] mx-auto grid md:grid-cols-2 gap-8 xs:px-4'>
        <motion.div className='mx-auto'
          initial="hidden"
          whileInView="visible"
         animate={{ x:0 }}
         transition={{delay: 0.2, duration: 0.5 }}
         variants={{
          hidden:{opacity:0, y:100},
          visible:{opacity:1,x:0,y:0}
         }}>
        <div className='w-full h-[700px] bg-white shadow-2xl rounded-3xl text-black text-center '>
            <img className='w-28 pt-5 mx-auto pb-10' src={algorithmIMG} alt="icon"/>
            <h3 className='text-2xl font-bold pb-5'>UX/UI Design</h3>
            <p>Our UX and UI design services create 
            user-centered digital experiences tailored 
            to businesses' unique needs, through user 
            research, information architecture, 
            wireframes, and usability testing
            </p>
            <h3 className='text-2xl font-bold pt-10'>Tools</h3>
            <div className='grid grid-cols-2 mx-auto pt-10'>
            <img className='w-36 pt-5 mx-auto' src={Dlogo1} alt="icon"/>
            <img className='w-36 pt-5 mx-auto ' src={Dlogo2} alt="icon"/>
            </div>
        </div>
        </motion.div>
        <motion.div className='mx-auto'
          initial="hidden"
          whileInView="visible"
         animate={{ x:0 }}
         transition={{delay: 0.4, duration: 0.5 }}
         variants={{
          hidden:{opacity:0, y:100},
          visible:{opacity:1,x:0,y:0}
         }}>
        <div className='w-full h-full bg-white rounded-3xl text-black text-center'>
            <img className='w-28 pt-5 mx-auto pb-10' src={learningIMG} alt="icon"/>
            <h3 className='text-2xl font-bold pb-5'>Web developer</h3>
            <p>Our front-end development services build responsive and 
                user-friendly web interfaces using the latest technologies, 
                ensuring a seamless user experience on all devices.
            </p>
            <h3 className='text-2xl font-bold pt-10'>Tools</h3>
            <div className='grid grid-cols-3 mx-auto gap-2'>
            <img className='w-24 pt-5 mx-auto' src={Dlogo3} alt="icon "/>
            <img className='w-26 pt-5 mx-auto ' src={Dlogo4} alt="icon"/>
            <img className='w-24 pt-5 mx-auto ' src={Dlogo5} alt="icon"/>
            <img className='w-26 pt-5 mx-auto ' src={Dlogo6} alt="icon"/>
            <img className='w-24 pt-5 mx-auto ' src={Dlogo7} alt="icon"/>
            </div>
        </div>
        </motion.div>
    </div>
    </section>
  )
}

export default Services
