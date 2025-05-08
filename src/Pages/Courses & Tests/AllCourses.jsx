import React from 'react'
import HOC from '../../Component/HOC/HOC'
import './Courses_Tests.css'
import { useNavigate } from 'react-router-dom';


import { FaArrowLeft } from "react-icons/fa6";
import { SlArrowRight } from "react-icons/sl";

import img from '../../Image/img16.jpeg'
import img1 from '../../Image/img14.jpeg'
import img2 from '../../Image/img15.jpeg'
import img3 from '../../Image/img17.jpeg'
import img4 from '../../Image/img18.png'
import img5 from '../../Image/img19.png'
import img6 from '../../Image/img20.png'
import img7 from '../../Image/img21.png'

const AllCourses = () => {
    const navigate = useNavigate()

    return (
        <>
            <div className='coursesEdit'>
                <div className='coursesEdit1'>
                    <FaArrowLeft color='#FFFFFF' size={20} onClick={() => navigate('/courses_tests/courses')} />
                    <h6>All Courses for CAT preparation</h6>
                </div>

                <div className='coursedetails1'>
                    <div className='coursedetails2' onClick={()=>navigate('/courses_tests/courses/allcourses/details')}>
                        <div className='coursedetails22'>
                            <div className='coursedetails3'>
                                <div className='coursedetails4'>
                                    <img src={img} alt="" />
                                </div>
                                <div className='coursedetails5'>
                                    <h6>Quantitative Aptitude (Quant)</h6>
                                </div>
                            </div>
                            <div className='coursedetails6'>
                                <SlArrowRight color='#FFFFFF' size={25} />
                            </div>
                        </div>

                    </div>
                    <div className='coursedetails2'>
                        <div className='coursedetails22'>
                            <div className='coursedetails3'>
                                <div className='coursedetails4'>
                                    <img src={img1} alt="" />
                                </div>
                                <div className='coursedetails5'>
                                    <h6>Crash Course for CAT</h6>
                                </div>
                            </div>
                            <div className='coursedetails6'>
                                <SlArrowRight color='#FFFFFF' size={25} />
                            </div>
                        </div>

                    </div>
                    <div className='coursedetails2'>
                        <div className='coursedetails22'>
                            <div className='coursedetails3'>
                                <div className='coursedetails4'>
                                    <img src={img2} alt="" />
                                </div>
                                <div className='coursedetails5'>
                                    <h6>CAT Mock Test Series 2024</h6>
                                </div>
                            </div>
                            <div className='coursedetails6'>
                                <SlArrowRight color='#FFFFFF' size={25} />
                            </div>
                        </div>

                    </div>
                    <div className='coursedetails2'>
                        <div className='coursedetails22'>
                            <div className='coursedetails3'>
                                <div className='coursedetails4'>
                                    <img src={img3} alt="" />
                                </div>
                                <div className='coursedetails5'>
                                    <h6>Verbal Ability (VA) & Reading Comprehension (RC)</h6>
                                </div>
                            </div>
                            <div className='coursedetails6'>
                                <SlArrowRight color='#FFFFFF' size={25} />
                            </div>
                        </div>

                    </div>
                    <div className='coursedetails2'>
                        <div className='coursedetails22'>
                            <div className='coursedetails3'>
                                <div className='coursedetails4'>
                                    <img src={img4} alt="" />
                                </div>
                                <div className='coursedetails5'>
                                    <h6>Logical Reasoning (LR) and Data Interpretation (DI)</h6>
                                </div>
                            </div>
                            <div className='coursedetails6'>
                                <SlArrowRight color='#FFFFFF' size={25} />
                            </div>
                        </div>

                    </div>
                    <div className='coursedetails2'>
                        <div className='coursedetails22'>
                            <div className='coursedetails3'>
                                <div className='coursedetails4'>
                                    <img src={img5} alt="" />
                                </div>
                                <div className='coursedetails5'>
                                    <h6>CAT Mock Test Series and 500+ Practice Tests 2024</h6>
                                </div>
                            </div>
                            <div className='coursedetails6'>
                                <SlArrowRight color='#FFFFFF' size={25} />
                            </div>
                        </div>

                    </div>
                    <div className='coursedetails2'>
                        <div className='coursedetails22'>
                            <div className='coursedetails3'>
                                <div className='coursedetails4'>
                                    <img src={img6} alt="" />
                                </div>
                                <div className='coursedetails5'>
                                    <h6>100 RCs for Practice</h6>
                                </div>
                            </div>
                            <div className='coursedetails6'>
                                <SlArrowRight color='#FFFFFF' size={25} />
                            </div>
                        </div>

                    </div>
                    <div className='coursedetails2'>
                        <div className='coursedetails22'>
                            <div className='coursedetails3'>
                                <div className='coursedetails4'>
                                    <img src={img7} alt="" />
                                </div>
                                <div className='coursedetails5'>
                                    <h6>3 Months Preparation for CAT</h6>
                                </div>
                            </div>
                            <div className='coursedetails6'>
                                <SlArrowRight color='#FFFFFF' size={25} />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default HOC(AllCourses)