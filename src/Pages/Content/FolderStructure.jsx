// // src/components/FolderComponent.js
// import React, { useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { fetchCourses } from "../../redux/slices/courseSlice";
// import { useNavigate } from "react-router-dom";
// import { FaFolder } from "react-icons/fa";
// import HOC from "../../Component/HOC/HOC";
// import { Menu, Dropdown } from "antd";
// import api from "../../api/axios";

// function FolderComponent() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { courses, loading } = useSelector((state) => state.courses);

//   useEffect(() => {
//     dispatch(fetchCourses());
//   }, [dispatch]);

//   const handleFolderClick = (folderId) => {
//     navigate(`/folder/${folderId}`);
//   };
//   const handleToggleDownload = async (rootFolderId, allowDownload) => {
//     try {
//       const response = await api.post("/admin/updateDownloads", {
//         rootFolderId,
//         allowDownload,
//       });

//       console.log("Download toggle updated:", response.data);
//       alert(
//         `Downloads have been ${
//           allowDownload ? "enabled" : "disabled"
//         } successfully.`
//       );

//       // Optionally update your UI state here
//     } catch (error) {
//       console.error("Error updating download setting:", error);
//       alert("Failed to update download setting. Please try again.");
//     }
//   };

//   const menuForDownloadAccess = (rootFolderId) => (
//     <Menu>
//       <Menu.Item
//         key="1"
//         onClick={() => handleToggleDownload(rootFolderId, true)}
//       >
//         Allow Downloads
//       </Menu.Item>
//       <Menu.Item
//         key="2"
//         onClick={() => handleToggleDownload(rootFolderId, false)}
//       >
//         Block Downloads
//       </Menu.Item>
//     </Menu>
//   );

//   if (loading) return <div>Loading courses...</div>;

//   return (
//     <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-white">
//       {courses.map((course) => (
//         <div
//           className="flex flex-col items-center"
//           key={course._id}
//           onClick={() => handleFolderClick(course.rootFolder)}
//         >
//           <FaFolder color="blue" size={100} />
//           <p className="text-center">{course.title}</p>
//           <Dropdown
//             overlay={menuForFolders(course.rootFolderId)}
//             trigger={["click"]}
//           >
//             <a
//               className="ant-dropdown-link"
//               onClick={(e) => e.preventDefault()}
//             >
//               <FaEllipsisV />
//             </a>
//           </Dropdown>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default HOC(FolderComponent);

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCourses } from "../../redux/slices/courseSlice";
import { useNavigate } from "react-router-dom";
import { FaFolder, FaEllipsisV } from "react-icons/fa";
import HOC from "../../Component/HOC/HOC";
import { Menu, Dropdown } from "antd";
import api from "../../api/axios";

function FolderComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, loading } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleFolderClick = (folderId) => {
    navigate(`/folder/${folderId}`);
  };

  const handleToggleDownload = async (rootFolderId, allowDownload) => {
    try {
      const response = await api.post("/admin/updateDownloads", {
        rootFolderId,
        allowDownload,
      });

      console.log("Download toggle updated:", response.data);
      alert(
        `Downloads have been ${
          allowDownload ? "enabled" : "disabled"
        } successfully.`
      );
    } catch (error) {
      console.error("Error updating download setting:", error);
      alert("Failed to update download setting. Please try again.");
    }
  };

  const menuForDownloadAccess = (rootFolderId) => (
    <Menu>
      <Menu.Item
        key="1"
        onClick={() => handleToggleDownload(rootFolderId, true)}
      >
        Allow Downloads
      </Menu.Item>
      <Menu.Item
        key="2"
        onClick={() => handleToggleDownload(rootFolderId, false)}
      >
        Block Downloads
      </Menu.Item>
    </Menu>
  );

  if (loading) return <div>Loading courses...</div>;

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-white">
      {courses.map((course) => (
        <div className="relative flex flex-col items-center" key={course._id}>
          <div
            className="w-full flex flex-col items-center cursor-pointer"
            onClick={() => handleFolderClick(course.rootFolder)}
          >
            <FaFolder color="blue" size={100} />
            <p className="text-center">{course.title}</p>
          </div>

          <div className="absolute top-2 right-2">
            <Dropdown
              overlay={menuForDownloadAccess(course.rootFolder)}
              trigger={["click"]}
            >
              <a onClick={(e) => e.preventDefault()}>
                <FaEllipsisV className="text-white cursor-pointer" />
              </a>
            </Dropdown>
          </div>
        </div>
      ))}
    </div>
  );
}

export default HOC(FolderComponent);
