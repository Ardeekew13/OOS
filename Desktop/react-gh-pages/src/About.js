import React from 'react'
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

function About() {
    const[ref,inView]= useInView({
        threshold:0.5,
    });
  return (
    <section className='about  lg:pb-20 md:pb-16 sm:pb-14 xs:pb-12' ref={ref}>
    <div className='container mx-auto'>
        <div>
            <div className='text-center mx-auto '>
                <h2 className='lg:text-7xl  sm:text-5xl md:text-5xl font-bold  pb-6 flex justify-center  xs: text-4xl gap-3'>About <h2 className='text-[#90CCF3]'> Me</h2> </h2>
                
                <p  className='max-w-screen-md mx-auto pt-5 text-center pb-5'>
                I finished my degree, Bachelor of Science in Information Technology at Holy Name University. My degree taught me invaluable knowledge in programming languages , web design, and many more. My knowledge and skills have been very beneficial in providing quality services to my clients.  In addition, I  am flexible, reliable and possess excellent time keeping skills. I am an enthusiastic, self-motivated, reliable, responsible and hard working person who loves web design. I am able to work well both in a team environment as well as using own initiative.  Moreover, I help clients achieve their smart, measurable, attainable, realistic, and timely goals.
                </p>
                <div className='flex justify-center gap-x-6 lg:gap-x-10 mg-12'>
                    <div>
                        <div className='text-[70px] text-[#90CCF3] max-h-xs'>
                            {
                                inView?
                            <CountUp start={0} end={5} duration={2} / >: null}+ 
                        </div>
                        <div className='text-sm tracking-[2px]'>Years of<br/>Experience</div>
                </div>
                <div>
                <div className='text-[70px] text-[#90CCF3]'>
                    {
                        inView?
                    <CountUp start={0} end={12} duration={3} / >: null}
                    +
                </div>
                <div className='text-sm tracking-[2px]'>Projects<br/>Completed</div>
        </div>
       
        <div>
        <div className='text-[70px] text-[#90CCF3]'>
            {
                inView?
            <CountUp start={0} end={10} duration={3} / >: null}+
        </div>
        <div className='text-sm tracking-[2px]'>Client<br/>Satisfied</div>
</div>
</div>
            </div>
        </div>
      
    </div>
    </section>
  )
}

export default About;
