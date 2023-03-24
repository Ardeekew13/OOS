import React from 'react'
import {BiHomeAlt, BiUser} from 'react-icons/bi'
import {BsClipboardData} from 'react-icons/bs'
import {GiSkills} from 'react-icons/gi'
import {AiOutlinePhone} from 'react-icons/ai'
import {FaCogs} from 'react-icons/fa'

import { Link } from 'react-scroll'

function Navbar2() {
  return (
    <nav className='fixed bottom-1 lg:bottom-2 w-full overflow-hidden z-50 mx-auto  '>
        <div className='container mx-auto '>
            <div className='w-full bg-black/80 h-[96px] backdrop-blur-2xl rounded-full max-w-[460px] mx-auto px-5 flex justify-between text-2xl items-center text-white/50'>
                <Link  to="hero" activeClass='active2' spy={true} smooth={true} offset={-100} duration={500} className='cursor-pointer w-[60px] h-[60px] flex items-center justify-center'>
                <BiHomeAlt/>
                </Link>
                <Link to="about" activeClass='active2' spy={true} smooth={true} offset={-100} duration={500} className='cursor-pointer w-[60px] h-[60px] flex items-center justify-center'>
                <BiUser/>
                </Link>
                <Link to="skills" activeClass='active2' spy={true} smooth={true} offset={50} duration={500} className='cursor-pointer w-[60px] h-[60px] flex items-center justify-center'>
                <GiSkills/>
                </Link>
                <Link to="services" activeClass='active2' spy={true} smooth={true} offset={40} duration={500} className='cursor-pointer w-[60px] h-[60px] flex items-center justify-center'>
                <FaCogs/>
                </Link>
                <Link to="portfolio" activeClass='active2'spy={true} smooth={true} offset={100} duration={500} className='cursor-pointer w-[60px] h-[60px] flex items-center justify-center'>
                <BsClipboardData/>
                </Link>
                <Link to="contact" activeClass='active2' spy={true} smooth={true} offset={50} duration={500} className='cursor-pointer w-[60px] h-[60px] flex items-center justify-center'>
                <AiOutlinePhone/>
                </Link>

            </div>
        </div>
    </nav>
  )
}

export default Navbar2
