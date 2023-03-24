import React from 'react'
import {useTypewriter} from 'react-simple-typewriter';
import { Link } from 'react-scroll';
import {motion} from 'framer-motion'


import personImg from '../src/images/person.png';

function Hero() {
  const [text]= useTypewriter({
    words: ["Designer.", "Web Developer."],
    typeSpeed:20,
    deleteSpeed:50,
    delaySpeed:2000,
    loop:0,
  });
  return (
    <section id='hero' name='hero' className='flex items-center w-full lg:py-0  lg:pl-28  md:mx-auto md:items-center md:justify-center'>
      <div className='container mx-auto w-full h-full pt-20 sm:flex sm:items-center sm:mx-auto sm:justify-center xs:px-4 xs:text-center xs:flex xs:justify-center xs:items-center'>
       <div className='flex items-center h-full pt-8 justify-center'>
       <motion.div
        initial='hidden'
        whileInView="visible"
        animate={{x:100}}
        transition={{ ease:"easeOut",duration:0.5}}
        variants={{
          hidden:{opacity:0,x:50},
          visible: {opacity:1, x:0}
        }}
        >
        <div className='flex-1 flex flex-col item-center lg:items-start md:items-center sm:flex sm:justify-center sm:mx-auto sm:w-full sm:items-center pt-24 pb-24'>
          <h1 className='md:hidden sm:flex text-[#cd07bd] text-2xl'>Hi, My name is</h1>
            <h1 className='text-4xl md:text-5xl md:leading-tight lg:text-7xl lg:leading-[1.2]  font-bold md:tracking-[-2px ] items-center'>Ron Derick Quilicot</h1>
            <span className='text-3xl py-2 sm:text-4xl font-bold text-[#90CCF3]'>I'm a {text}</span>
            <p className='py-3 max-w-[600px] text-left'>As a web developer and designer, I combine expertise in front-end and back-end web development with creative design skills. I'm proficient in programming languages including HTML, CSS, JavaScript, and React, as well as design tools such as Adobe Illustrator and Figma. With a focus on problem-solving, attention to detail, and passion for innovation, I create visually appealing and highly functional web applications that meet clients' needs in various industries.</p>
      <button className='border-2 px-3 py-3 hover:bg-[#7441b9] hover:border-[#7441b9]'><Link to="portfolio" spy={true} smooth={true} offset={-50} duration={500}>See My work</Link></button>
      </div>
      </motion.div>
      <motion.div className='mx-auto items-center'
          initial="hidden"
          whileInView="visible"
         animate={{ x:0 }}
         transition={{ delay:0.2, duration: 0.8 }}
         variants={{
          hidden:{opacity:0, y:-50},
          visible:{opacity:1,y:0}
         }}>
      <div className='hidden lg:flex flex-1 justify-end items-end h-full'>
       
        <img className='w-[640px] h-[650px]'src={personImg} alt="image2"/>
        
      </div>
      </motion.div>
      </div>
      
      </div>
      
     
    </section>
  )
}

export default Hero
