import React, { useRef } from "react";
import { FaExpand, FaCompress, FaTimes } from "react-icons/fa";

const Modal = ({ children, onClose }) => {
  const modalRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  const toggleFullScreen = () => {
    if (modalRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullScreen(false);
      } else {
        modalRef.current.requestFullscreen();
        setIsFullScreen(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div
        className="bg-white w-full max-w-4xl h-[80vh] rounded-lg shadow-lg relative overflow-hidden"
        ref={modalRef}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="z-10 absolute top-2 right-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
        >
          <FaTimes />
        </button>

        {/* Full Screen Button */}
        <button
          onClick={toggleFullScreen}
          className="absolute bottom-2 right-2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition flex items-center"
        >
          {isFullScreen ? <FaCompress /> : <FaExpand />}
          <span className="z-10 ml-2">{isFullScreen ? "Exit Full Screen" : "Full Screen"}</span>
        </button>

        {/* Content */}
        <div className="w-full h-full">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
