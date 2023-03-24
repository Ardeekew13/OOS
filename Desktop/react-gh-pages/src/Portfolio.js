import React from "react"
import prototypeImg from '../src/images/prototype.png';
import prototypeImg2 from '../src/images/branding.png';
import prototypeImg3 from '../src/images/Website.png';
import { Link } from "react-router-dom";
import {motion} from "framer-motion";

function Portfolio() {
    return (
        <section id="portfolio">
        <div className='max-w-screen-lg p-3 mx-auto flex flex-col justify-center w-full mt-14 h-3/4'>
            <div className='pb-8 text-center font-bold'>
              <h2 className='text-3xl  sm:text-5xl flex gap-2 pt-24 justify-center pb-20 xs:text-4xl xs:justify-center xs:text-center'><h2 className='text-[#90CCF3] xs:text-4xl sm:text-5xl md:text-5xl'> My</h2>Portfolio</h2>
                </div>
                    <div className='grid sm:gridcols-2 mx-auto  md:grid-cols-3 gap-8  pb-20 xs:px-2'>
                    <motion.div
                    initial="hidden"
                    whileInView="visible"
                    animate={{ x:0 }}
                    transition={{delay: 0.2, duration: 0.5 }}
                    variants={{
                    hidden:{opacity:0, y:100},
                    visible:{opacity:1,x:0,y:0}
                    }}>
                         <div className='shadow-md shadow-gray-600  '>
                           <Link className='cursor-pointer' target="_blank" to='https://www.figma.com/file/9pD3h3VVnRNcBNn7RMwqMr/Ardailyshoes?t=Z4IaagGeuyPAaqUQ-0'>
                         <div>
                             <img src={prototypeImg} alt='' className='rounded-md duration-200 hover:scale-105 w-[360px] h-[230px]  '/>
                         </div>
                             <div className='flex item-center justify-center'>
                                 <p>Mobile Prototype</p>
                             </div>
                             
                              </Link>
                             
                             </div>
                             </motion.div>
                    <motion.div
                    initial="hidden"
                    whileInView="visible"
                    animate={{ x:0 }}
                    transition={{delay: 0.2, duration: 0.5 }}
                    variants={{
                    hidden:{opacity:0, y:100},
                    visible:{opacity:1,x:0,y:0}
                    }}>              
     <div className='shadow-md shadow-gray-600  '>
     <Link className='cursor-pointer' target="_blank" to='https://www.figma.com'>
    <div>
    <img src={prototypeImg2} alt='' className='rounded-md duration-200 hover:scale-105 w-[360px] h-[230px]'/>
    </div>
    <div className='flex item-center justify-center'>
        <p>Branding of Ardeelishoes</p>
        </div>
        </Link>
     </div>
     </motion.div>
     <motion.div
                    initial="hidden"
                    whileInView="visible"
                    animate={{ x:0 }}
                    transition={{delay: 0.2, duration: 0.5 }}
                    variants={{
                    hidden:{opacity:0, y:100},
                    visible:{opacity:1,x:0,y:0}
                    }}>
     <div className='shadow-md shadow-gray-600  '>
     <Link className='cursor-pointer' target="_blank" to='https://www.gkquilicot.com'>
    <div>
    <img src={prototypeImg3} alt='' className='rounded-md duration-200 hover:scale-105 w-[360px] h-[230px]'/>
    </div>
    <div className='flex item-center justify-center'>
        <p>Website Portfolio</p>
        </div>
        </Link>
     </div>
     </motion.div>
    </div>
</div>
</section>
    )
}
export default Portfolio
