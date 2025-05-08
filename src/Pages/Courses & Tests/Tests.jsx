import React, { useState } from 'react'
import './Courses_Tests.css'
import HOC from '../../Component/HOC/HOC'
import Modal from "react-bootstrap/Modal";

import { HiPlus } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { FaCirclePlus } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { FaCircleCheck } from "react-icons/fa6";


import img1 from '../../Image/img13.png'
import img4 from '../../Image/img29.png'
import img5 from '../../Image/img30.png'


const Tests = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0);
  const [modalShow, setModalShow] = useState(false);
  const [modalShow1, setModalShow1] = useState(false);


  const handlemodals = () => {
    setModalShow(false)
    setModalShow1(true)
    setTimeout(() => {
      setModalShow1(false);
    }, 2000);
  }

  function AddTest(props) {

    const questions = [
      {
        id: 1,
        question: 'We don’t track your usage - would you be willing to share how much you use the app?',
        options: ['Daily', 'Once or twice a week', 'Three or four times a week', 'Every other week', 'Monthly', 'Rarely'],
        correctAnswer: 'Daily',
      },
      // Add more questions as needed
    ];




    // State to keep track of selected answers
    const [selectedAnswers, setSelectedAnswers] = useState({});

    // Handler for selecting an answer
    const handleSelectAnswer = (questionId, answer) => {
      setSelectedAnswers(prevAnswers => ({
        ...prevAnswers,
        [questionId]: answer,
      }));
    };




    return (
      <Modal
        {...props}
        size="50000"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body style={{ padding: '0' }}>
          <div className='addtestmodal'>
            <div className='addtestmodal1'>
              <div className='addtestmodal2'>
                <IoClose color='#000000' size={30} onClick={props.onHide}/>
              </div>
              <div className='addtestmodal3'>
                <p>Add New Tests</p>
              </div>
            </div>
            {step === 0 ? (
              <div className='addtestmodal4'>
                <h6>Create Test’s :</h6>
                <div className='addtestmodal5'>
                  <div className='addtestmodal6' onClick={() => setStep(1)}>
                    <h6>UPSC Test Pattern 01</h6>
                    <FaCirclePlus color='#121212' size={25}   onClick={() => setStep(1)}/>
                  </div>
                  <div className='addtestmodal6'>
                    <h6>CAT Test Pattern 01</h6>
                    <FaCirclePlus color='#121212' size={25}  onClick={() => setStep(1)}/>
                  </div>
                  <div className='addtestmodal6'>
                    <h6>MBA Test Pattern 01</h6>
                    <FaCirclePlus color='#121212' size={25}  onClick={() => setStep(1)}/>
                  </div>
                  <div className='addtestmodal6'>
                    <h6>JEE Mains Test Pattern 01</h6>
                    <FaCirclePlus color='#121212' size={25}  onClick={() => setStep(1)}/>
                  </div>
                </div>
              </div>
            ) : step === 1 ? (
              <div className='addtestmodal4'>
                <h6>UPSC Test Pattern 01</h6>
                {questions.map((q) => (
                  <div key={q.id}>
                    <div className='addtestmodal8'>
                      <p>{q.id}.</p>
                      <p>{q.question}</p>
                    </div>

                    <div className='addtestmodal5'>
                      {q.options.map((option) => (
                        <label key={option} className={`quiz-option ${selectedAnswers[q.id] === option ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={option}
                            checked={selectedAnswers[q.id] === option}
                            onChange={() => handleSelectAnswer(q.id, option)}
                          />
                          {option}
                          <span className="custom-radio">
                            {selectedAnswers[q.id] === option && <span className="tick-mark"><FaCircleCheck /></span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className='addtestmodal9'>
                  <button onClick={() => setStep(2)}>Next</button>
                </div>
              </div>
            ) : step === 2 ? (
              <div className='addtestmodal4'>
                <h6>UPSC Test Pattern 01</h6>
                {questions.map((q) => (
                  <div key={q.id}>
                    <div className='addtestmodal8'>
                      <p>2.</p>
                      <p>{q.question}</p>
                    </div>

                    <div className='addtestmodal5'>
                      {q.options.map((option) => (
                        <label key={option} className={`quiz-option ${selectedAnswers[q.id] === option ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={option}
                            checked={selectedAnswers[q.id] === option}
                            onChange={() => handleSelectAnswer(q.id, option)}
                          />
                          {option}
                          <span className="custom-radio">
                            {selectedAnswers[q.id] === option && <span className="tick-mark"><FaCircleCheck /></span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className='addtestmodal9'>
                  <button onClick={() => setStep(3)}>Next</button>
                </div>
              </div>
            ) : step === 3 ? (
              <div className='addtestmodal4'>
                <h6>UPSC Test Pattern 01</h6>
                {questions.map((q) => (
                  <div key={q.id}>
                    <div className='addtestmodal8'>
                      <p>3.</p>
                      <p>{q.question}</p>
                    </div>

                    <div className='addtestmodal5'>
                      {q.options.map((option) => (
                        <label key={option} className={`quiz-option ${selectedAnswers[q.id] === option ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={option}
                            checked={selectedAnswers[q.id] === option}
                            onChange={() => handleSelectAnswer(q.id, option)}
                          />
                          {option}
                          <span className="custom-radio">
                            {selectedAnswers[q.id] === option && <span className="tick-mark"><FaCircleCheck /></span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className='addtestmodal9'>
                  <button onClick={() => setStep(4)}>Next</button>
                </div>
              </div>
            ) : step === 4 ? (
              <div className='addtestmodal4'>
                <h6>UPSC Test Pattern 01</h6>
                {questions.map((q) => (
                  <div key={q.id}>
                    <div className='addtestmodal8'>
                      <p>4.</p>
                      <p>{q.question}</p>
                    </div>

                    <div className='addtestmodal5'>
                      {q.options.map((option) => (
                        <label key={option} className={`quiz-option ${selectedAnswers[q.id] === option ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={option}
                            checked={selectedAnswers[q.id] === option}
                            onChange={() => handleSelectAnswer(q.id, option)}
                          />
                          {option}
                          <span className="custom-radio">
                            {selectedAnswers[q.id] === option && <span className="tick-mark"><FaCircleCheck /></span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className='addtestmodal9'>
                  <button onClick={() => setStep(5)}>Add More</button>
                  <button onClick={handlemodals}>Publish</button>
                </div>
              </div>
            ) : step === 5 ? (
              <div className='addtestmodal4'>
                <h6>UPSC Test Pattern 01</h6>
                {questions.map((q) => (
                  <div key={q.id}>
                    <div className='addtestmodal8'>
                      <p>5.</p>
                      <p>{q.question}</p>
                    </div>

                    <div className='addtestmodal5'>
                      {q.options.map((option) => (
                        <label key={option} className={`quiz-option ${selectedAnswers[q.id] === option ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={option}
                            checked={selectedAnswers[q.id] === option}
                            onChange={() => handleSelectAnswer(q.id, option)}
                          />
                          {option}
                          <span className="custom-radio">
                            {selectedAnswers[q.id] === option && <span className="tick-mark"><FaCircleCheck /></span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className='addtestmodal9'>
                  <button onClick={() => setStep(5)}>Add More</button>
                  <button onClick={handlemodals}>Publish</button>
                </div>
              </div>
            ) : (
              ""
            )}

          </div>
        </Modal.Body>
      </Modal>
    );
  }



  function TestAddedSuccessfully(props) {

    return (
      <Modal
        {...props}
        size="sl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body style={{ padding: '30px' }}>
          <div className='courseaddedsucc'>
            <img src={img5} alt="" />
            <p>Test Added Successfully</p>
          </div>
        </Modal.Body>
      </Modal>
    );
  }


  return (
    <>
      <AddTest
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
      <TestAddedSuccessfully
        show={modalShow1}
        onHide={() => setModalShow1(false)}
      />
      <div className='course-test'>
        <div className='course-test1'>
          <div className='course-test2'>
            <div className='course-test3'>
              <div className='course-test5' onClick={() => navigate('/courses_tests/courses')}>
                <h6>Courses</h6>
              </div>
              <div className='course-test4'>
                <h6>Tests</h6>
              </div>
            </div>
            <div className='course-test6'>
              <button onClick={() => setModalShow(true)}><HiPlus color='#FFFFFF' size={20} />
                Add New Test</button>
            </div>
          </div>

          <div className='course-test7'>
            <div className='course-test88' style={{ backgroundImage: `url(${img1})` }}>
              <div className='test'>
                <h6>Test</h6>
              </div>
              <div className='test1'>
                <p>Timing : Every Saturday & Monday</p>
              </div>
              <div className='course-test14777'>

                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HOC(Tests)