import React, { useState } from 'react'
import HOC from '../../Component/HOC/HOC'
import { useNavigate } from 'react-router-dom';


import { FaArrowLeft } from "react-icons/fa6";
import { IoIosArrowDropdown } from "react-icons/io";
import img1 from '../../Image/img16.jpeg'
import { IoPlayCircleOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoIosStarOutline } from "react-icons/io";
import { PiClipboardTextBold } from "react-icons/pi";
import { IoIosArrowDropup } from "react-icons/io";

const AllCoursesDatails = () => {
    const navigate = useNavigate()
    const [sections, setSections] = useState({
        section1: { show: false, step: 0 },
        section2: { show: false, step: 0 },
        // Add more sections if needed
    });

    const handleToggle = (section) => {
        setSections(prevSections => ({
            ...prevSections,
            [section]: {
                ...prevSections[section],
                show: !prevSections[section].show
            }
        }));
    };

    const handleStepChange = (section, step) => {
        setSections(prevSections => ({
            ...prevSections,
            [section]: {
                ...prevSections[section],
                step
            }
        }));
    };
    return (
        <>
            <div className='coursesEdit'>
                <div className='coursesEdit1'>
                    <FaArrowLeft color='#FFFFFF' size={20} onClick={() => navigate('/courses_tests/courses/allcourses')} />
                    <h6>Quantitative Aptitude (Quant)</h6>
                </div>

                <div className='coursedetails7'>
                    <div className='coursedetails8'>
                        <div className='coursedetails9'>
                            <img src={img1} alt="" />
                        </div>
                        <div className='coursedetails10'>
                            <div className='coursedetails11'>
                                <p>INFINITY COURSE</p>
                            </div>
                            <div className='coursedetails12'>
                                <h6>Quantitative Aptitude (Quant)</h6>
                                <p>75,157 students learning this week</p>
                            </div>
                        </div>
                    </div>

                    <div className='coursedetails13'>
                        <div className='coursedetails14'>
                            <div className='coursedetails15'>
                                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
                            </div>
                            <div className='coursedetails16'>
                                <div className='coursedetails17'>
                                    <div className='coursedetails18'>
                                        <div className='coursedetails19'>
                                            <p>01</p>
                                            <div className='coursedetails20'>
                                                <h6>Number System</h6>
                                                <span>5 Videos  | 5 Docs | 5 Tests</span>
                                            </div>
                                        </div>
                                        <div>
                                            {sections.section1.show ?
                                                <IoIosArrowDropup color='#878787' size={25} onClick={() => handleToggle('section1')} />
                                                :
                                                <IoIosArrowDropdown color='#878787' size={25} onClick={() => handleToggle('section1')} />
                                            }
                                        </div>
                                    </div>
                                    {sections.section1.show &&
                                        <div className='coursedetails32'>
                                            <div className="coursedetails33">
                                                <div
                                                    className={sections.section1.step === 0 ? "coursedetails34" : "coursedetails35"}
                                                    onClick={() => handleStepChange('section1', 0)}>
                                                    <p>All</p>
                                                </div>
                                                <div
                                                    className={sections.section1.step === 1 ? "coursedetails34" : "coursedetails35"}
                                                    onClick={() => handleStepChange('section1', 1)}>
                                                    <p>5 Videos</p>
                                                </div>
                                                <div
                                                    className={sections.section1.step === 2 ? "coursedetails34" : "coursedetails35"}
                                                    onClick={() => handleStepChange('section1', 2)}>
                                                    <p>5 docs</p>
                                                </div>
                                                <div
                                                    className={sections.section1.step === 3 ? "coursedetails34" : "coursedetails35"}
                                                    onClick={() => handleStepChange('section1', 3)}>
                                                    <p>5 Tests</p>
                                                </div>
                                            </div>
                                            {sections.section1.step === 0 ? (
                                                <div className='coursedetails36'>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 1</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 2</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 3</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 4</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 5</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 1</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 2</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 3</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 4</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 5</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 1</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 2</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 3</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 4</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 5</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : sections.section1.step === 1 ? (
                                                <div className='coursedetails36'>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 1</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 2</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 3</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 4</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 5</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : sections.section1.step === 2 ? (
                                                <div className='coursedetails36'>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 1</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 2</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 3</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 4</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 5</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : sections.section1.step === 3 ? (
                                                <div className='coursedetails36'>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 1</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 2</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 3</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 4</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 5</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (

                                                ""
                                            )}
                                        </div>
                                    }
                                </div>
                                <div className='coursedetails17'>
                                    <div className='coursedetails18'>
                                        <div className='coursedetails19'>
                                            <p>02</p>
                                            <div className='coursedetails20'>
                                                <h6>How to Prepare Quantitative Aptitude for CAT?</h6>
                                                <span>5 Videos  | 5 Docs | 5 Tests</span>
                                            </div>
                                        </div>
                                        <div>
                                            {sections.section2.show ?
                                                <IoIosArrowDropup color='#878787' size={25} onClick={() => handleToggle('section2')} />
                                                :
                                                <IoIosArrowDropdown color='#878787' size={25} onClick={() => handleToggle('section2')} />
                                            }
                                        </div>
                                    </div>
                                    {sections.section2.show &&
                                        <div className='coursedetails32'>
                                            <div className="coursedetails33">
                                                <div
                                                    className={sections.section2.step === 0 ? "coursedetails34" : "coursedetails35"}
                                                    onClick={() => handleStepChange('section2', 0)}>
                                                    <p>All</p>
                                                </div>
                                                <div
                                                    className={sections.section2.step === 1 ? "coursedetails34" : "coursedetails35"}
                                                    onClick={() => handleStepChange('section2', 1)}>
                                                    <p>5 Videos</p>
                                                </div>
                                                <div
                                                    className={sections.section2.step === 2 ? "coursedetails34" : "coursedetails35"}
                                                    onClick={() => handleStepChange('section2', 2)}>
                                                    <p>5 docs</p>
                                                </div>
                                                <div
                                                    className={sections.section2.step === 3 ? "coursedetails34" : "coursedetails35"}
                                                    onClick={() => handleStepChange('section2', 3)}>
                                                    <p>5 Tests</p>
                                                </div>
                                            </div>
                                            {sections.section2.step === 0 ? (
                                                <div className='coursedetails36'>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 1</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 2</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 3</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 4</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 5</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 1</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 2</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 3</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 4</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 5</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 1</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 2</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 3</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 4</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 5</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : sections.section2.step === 1 ? (
                                                <div className='coursedetails36'>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 1</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 2</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 3</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 4</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Video 5</h6>
                                                            <p>55:00 min</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : sections.section2.step === 2 ? (
                                                <div className='coursedetails36'>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 1</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 2</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 3</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 4</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Docs 5</h6>
                                                            <p>20 Pages</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : sections.section2.step === 3 ? (
                                                <div className='coursedetails36'>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 1</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 2</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 3</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 4</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                    <div className='coursedetails37'>
                                                        <div className='coursedetails38'>

                                                        </div>
                                                        <div className='coursedetails39'>
                                                            <h6>Test 5</h6>
                                                            <p>20 Questions</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (

                                                ""
                                            )}
                                        </div>
                                    }
                                </div>
                                <div className='coursedetails17'>
                                    <div className='coursedetails18'>
                                        <div className='coursedetails19'>
                                            <p>03</p>
                                            <div className='coursedetails20'>
                                                <h6>Time & Work</h6>
                                                <span>7 Videos  | 4 Docs | 6 Tests</span>
                                            </div>
                                        </div>
                                        <div>
                                            <IoIosArrowDropdown color='#878787' size={25} />
                                        </div>
                                    </div>
                                </div>
                                <div className='coursedetails17'>
                                    <div className='coursedetails18'>
                                        <div className='coursedetails19'>
                                            <p>04</p>
                                            <div className='coursedetails20'>
                                                <h6>Ratio & Proportion</h6>
                                                <span>9 Videos  | 6 Docs | 5 Tests</span>
                                            </div>
                                        </div>
                                        <div>
                                            <IoIosArrowDropdown color='#878787' size={25} />
                                        </div>
                                    </div>
                                </div>
                                <div className='coursedetails17'>
                                    <div className='coursedetails18'>
                                        <div className='coursedetails19'>
                                            <p>05</p>
                                            <div className='coursedetails20'>
                                                <h6>Percentages</h6>
                                                <span>9 Videos  | 4 Docs | 5 Tests</span>
                                            </div>
                                        </div>
                                        <div>
                                            <IoIosArrowDropdown color='#878787' size={25} />
                                        </div>
                                    </div>
                                </div>
                                <div className='coursedetails17'>
                                    <div className='coursedetails18'>
                                        <div className='coursedetails19'>
                                            <p>06</p>
                                            <div className='coursedetails20'>
                                                <h6>Averages</h6>
                                                <span>7 Videos  | 4 Docs | 5 Tests</span>
                                            </div>
                                        </div>
                                        <div>
                                            <IoIosArrowDropdown color='#878787' size={25} />
                                        </div>
                                    </div>
                                </div>
                                <div className='coursedetails17'>
                                    <div className='coursedetails18'>
                                        <div className='coursedetails19'>
                                            <p>07</p>
                                            <div className='coursedetails20'>
                                                <h6>Vedic Mathematics - Tricks for Fast Calculations</h6>
                                                <span>26 Videos  | 1 Doc</span>
                                            </div>
                                        </div>
                                        <div>
                                            <IoIosArrowDropdown color='#878787' size={25} />
                                        </div>
                                    </div>
                                </div>
                                <div className='coursedetails17'>
                                    <div className='coursedetails18'>
                                        <div className='coursedetails19'>
                                            <p>08</p>
                                            <div className='coursedetails20'>
                                                <h6>Speed, Time and Distance</h6>
                                                <span>5 Videos  | 6 Docs | 3 Tests</span>
                                            </div>
                                        </div>
                                        <div>
                                            <IoIosArrowDropdown color='#878787' size={25} />
                                        </div>
                                    </div>
                                </div>
                                <div className='coursedetails17'>
                                    <div className='coursedetails18'>
                                        <div className='coursedetails19'>
                                            <p>09</p>
                                            <div className='coursedetails20'>
                                                <h6>Geometry</h6>
                                                <span>8 Videos  | 10 Docs | 3 Tests</span>
                                            </div>
                                        </div>
                                        <div>
                                            <IoIosArrowDropdown color='#878787' size={25} />
                                        </div>
                                    </div>
                                </div>
                                <div className='coursedetails17'>
                                    <div className='coursedetails18'>
                                        <div className='coursedetails19'>
                                            <p>10</p>
                                            <div className='coursedetails20'>
                                                <h6>Probability</h6>
                                                <span>7 Videos  | 5 Docs | 6 Tests</span>
                                            </div>
                                        </div>
                                        <div>
                                            <IoIosArrowDropdown color='#878787' size={25} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='coursedetails21'>
                            <div className='coursedetails23'>
                                <div className='coursedetails24'>
                                    <img src={img1} alt="" />
                                </div>
                                <div className='coursedetails25'>
                                    <h6>Quantitative
                                        Aptitude…</h6>
                                </div>
                            </div>
                            <div className='coursedetails26'>
                                <button>Join Course for Free</button>
                            </div>
                            <div className='coursedetails27'>
                                <p>This course includes:</p>
                                <div className='coursedetails28'>
                                    <div className='coursedetails29'>
                                        <IoPlayCircleOutline color='#C2C2C2' size={20} />
                                        <span>180+</span>
                                        <span> Videos</span>
                                    </div>
                                    <div className='coursedetails29'>
                                        <IoDocumentTextOutline color='#C2C2C2' size={20} />
                                        <span>150+</span>
                                        <span>  Documents</span>
                                    </div>
                                    <div className='coursedetails29'>
                                        <PiClipboardTextBold color='#C2C2C2' size={20} />
                                        <span>110+</span>
                                        <span>   Tests</span>
                                    </div>
                                    <div className='coursedetails29'>
                                        <IoIosStarOutline color='#C2C2C2' size={20} />
                                        <span>  4.96 (3040+ ratings)</span>
                                    </div>
                                </div>
                            </div>

                            <div className='coursedetails30'>
                                <h6>Plans starting @ ₹94/month</h6>
                                <p>Get this course, and all other
                                    courses for CAT with EduRev
                                    Infinity Package.</p>

                                <div className='coursedetails31'>
                                    <button>
                                        Buy Now
                                    </button>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HOC(AllCoursesDatails)