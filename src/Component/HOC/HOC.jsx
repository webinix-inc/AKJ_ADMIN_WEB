import React, { useState } from "react";
import './HOC.css'
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";


const HOC = (WrappedComponent) => {
    const Component = () => {
        const [show, setShow] = useState(true);
        const toggleSidebar = () => setShow(prevShow => !prevShow);

        return (
            <div className={`container1 ${show ? '' : 'sidebar-hidden'}`}>
                {show && (
                    <div className="sidebar55">
                        <Sidebar toggleSidebar={toggleSidebar}/>
                    </div>
                )}
                <div className="content">
                    <Navbar show={show} toggleSidebar={toggleSidebar} />
                    <div  className={`child-component ${show ? '' : 'child-component-hidden'}`}>
                        <WrappedComponent />
                    </div>
                </div>
            </div>
        );
    };

    return Component;
};

export default HOC;
