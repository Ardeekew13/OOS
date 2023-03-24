import React, {useState} from "react";
import {FaBars, FaTimes} from 'react-icons/fa'
import {Link} from 'react-scroll';

function Navbar() {
  const [click, setClick]=useState(false)
  const handleClick =() => setClick(!click)
    return (
    
    <div className="fixed w-full h-[60px] flex justify-between items-center px-4 text-white bg-gray-900">
      <div className='text-white text-3xl '>
      <Link to="hero" spy={true} smooth={true} offset={-100} duration={500}><p>Ardee</p></Link>
      </div>
          <ul className='hidden md:flex'>
          <li><Link to="hero" activeClass="active" spy={true} smooth={true} offset={-100} duration={500}>Home</Link></li>
          <li><Link to="about" spy={true} smooth={true} offset={-150} duration={500}>About</Link></li>
          <li><Link to="skills" spy={true} smooth={true} offset={50} duration={500}>Skills</Link></li>
          <li><Link to="services" spy={true} smooth={true} offset={-50} duration={500}>Services</Link></li>
          <li><Link to="portfolio" spy={true} smooth={true} offset={-50} duration={500}>Portfolio</Link></li>
          <li><a href="mailto:rdquilicot14@gmail.com">Contact Us</a></li>
        </ul>
      <div onClick={handleClick}className='md:hidden z-10'>
       {!click ? <FaBars />: <FaTimes/>}
      </div>
     
      <ul className={!click ? 'hidden' : 'absolute top-0 left-0 w-full h-screen bg-black flex flex-col justify-center items-center'}>
          <li className="py-5 text-4xl"><Link to="hero" spy={true} smooth={true} offset={50} duration={500}>Home</Link></li>
          <li className="py-5 text-4xl"><Link to="about" spy={true} smooth={true} offset={50} duration={500}>About</Link></li>
          <li className="py-5 text-4xl"><Link to="skills" spy={true} smooth={true} offset={50} duration={500}>Skills</Link></li>
          <li className="py-5 text-4xl"><Link to="services" spy={true} smooth={true} offset={50} duration={500}>Services</Link></li>
          <li className="py-5 text-4xl"><Link to="contact" spy={true} smooth={true} offset={50} duration={500}>Contact Us</Link></li>
        </ul>
        <div className='hidden'>
        </div>

      </div>
          
    );
  };
  
  export default Navbar;
  