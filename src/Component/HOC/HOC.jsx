import React, { Suspense } from "react";
import "./HOC.css";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

const HOC = (WrappedComponent) => {
    const Component = (props) => {
        return (
            <div className="app-container">
                <Sidebar />
                <main className="main-content">
                    <Navbar />
                    <div className="page-content">
                        <Suspense fallback={<div className="loading-spinner"></div>}>
                            <WrappedComponent {...props} />
                        </Suspense>
                    </div>
                </main>
            </div>
        );
    };

    return Component;
};

export default HOC;
