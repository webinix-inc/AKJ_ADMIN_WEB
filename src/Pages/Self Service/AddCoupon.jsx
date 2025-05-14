import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCoupon } from "../../redux/slices/couponSlice"; // Redux action
import {
  Modal,
  Button,
  Input,
  Checkbox,
  Select,
  DatePicker,
  TimePicker,
} from "antd";
import { useNavigate } from "react-router-dom";
import img5 from "../../Image/img30.png";
import HOC from "../../Component/HOC/HOC";
import dayjs from "dayjs";
import { fetchCourses } from "../../redux/slices/courseSlice";

const { Option } = Select;

const AddCoupon = () => {
  const [formData, setFormData] = useState({
    offerName: "",
    couponCode: "",
    couponType: "Public",
    assignedUserIds: [],
    courseSelectionType: "All",
    assignedCourseIds: [],
    usageLimit: "",
    isUnlimited: false,
    usagePerStudent: "",
    visibility: true,
    discountType: "Flat",
    discountAmount: "",
    discountPercentage: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    isLifetime: true,
    minimumOrderValue: "",
    usageCount: 0,
    userUsage: [],
  });

  const [modalShow, setModalShow] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch courses from Redux
  const { courses, loading: coursesLoading } = useSelector(
    (state) => state.courses
  );

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (date, dateString, fieldName) => {
    setFormData({ ...formData, [fieldName]: dateString });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createCoupon(formData))
      .unwrap()
      .then(() => {
        setModalShow(true);
        setTimeout(() => {
          setModalShow(false);
          navigate("/selfservice/manage-coupons");
        }, 2000);
      })
      .catch((err) => console.error("Error creating coupon:", err));
  };

  return (
    <>
      {/* Success Modal */}
      <Modal
        open={modalShow}
        centered
        footer={null}
        onCancel={() => navigate("/selfservice/manage-coupons")}
        className="text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <img src={img5} alt="Success" className="w-20 h-20" />
          <p className="text-lg font-medium text-gray-800">
            Coupon Added Successfully
          </p>
        </div>
      </Modal>

      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-md p-8 mt-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            type="primary"
            onClick={() => navigate("/selfservice")}
            className="bg-blue-500 text-white"
          >
            Back
          </Button>
          <h2 className="text-xl font-semibold text-gray-800">
            Create Coupon Code
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Offer Name */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Offer Name
            </label>
            <Input
              name="offerName"
              value={formData.offerName}
              onChange={(e) => handleChange("offerName", e.target.value)}
              placeholder="Enter offer name"
              required
            />
          </div>

          {/* Coupon Code */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Coupon Code
            </label>
            <Input
              name="couponCode"
              value={formData.couponCode}
              onChange={(e) => handleChange("couponCode", e.target.value)}
              placeholder="Enter coupon code"
              required
            />
          </div>

          {/* Coupon Type */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Coupon Type
            </label>
            <Select
              name="couponType"
              value={formData.couponType}
              onChange={(value) => handleChange("couponType", value)}
              className="w-full"
            >
              <Option value="Public">Public</Option>
              <Option value="Private">Private</Option>
            </Select>
          </div>

          {/* Assigned Users */}
          {formData.couponType === "Private" && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Assigned Users
              </label>
              <Input
                name="assignedUserIds"
                value={formData.assignedUserIds.join(",")}
                onChange={(e) =>
                  handleChange(
                    "assignedUserIds",
                    e.target.value.split(",").map((id) => id.trim())
                  )
                }
                placeholder="Enter user IDs (comma separated)"
              />
            </div>
          )}

          {/* Course Selection Type */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Course Selection Type
            </label>
            <Select
              name="courseSelectionType"
              value={formData.courseSelectionType}
              onChange={(value) => handleChange("courseSelectionType", value)}
              className="w-full"
            >
              <Option value="All">Assign to All Courses</Option>
              <Option value="Specific">Assign to Specific Courses</Option>
            </Select>
          </div>

          {/* Assigned Courses */}
          {formData.courseSelectionType === "Specific" && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Assigned Courses
              </label>
              <Select
                mode="multiple"
                placeholder="Select courses"
                value={formData.assignedCourseIds}
                onChange={(value) => handleChange("assignedCourseIds", value)}
                className="w-full"
                loading={coursesLoading}
              >
                {courses.map((course) => (
                  <Option key={course._id} value={course._id}>
                    {course.title}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          {/* Usage Limit */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Usage Limit
              </label>
              <Input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={(e) => handleChange("usageLimit", e.target.value)}
                disabled={formData.isUnlimited}
              />
            </div>
            {/* <Checkbox
              name="isUnlimited"
              checked={formData.isUnlimited}
              onChange={(e) => handleChange("isUnlimited", e.target.checked)}
            >
              Set as Unlimited
            </Checkbox> */}
          </div>

          {/* Usage Per Student */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Usage Per Student
            </label>
            <Input
              type="number"
              name="usagePerStudent"
              value={formData.usagePerStudent}
              onChange={(e) => handleChange("usagePerStudent", e.target.value)}
            />
          </div>

          {/* Visibility */}
          <div>
            <Checkbox
              name="visibility"
              checked={formData.visibility}
              onChange={(e) => handleChange("visibility", e.target.checked)}
            >
              Make Coupon Visible
            </Checkbox>
          </div>

          {/* Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Discount Type
              </label>
              <Select
                name="discountType"
                value={formData.discountType}
                onChange={(value) => handleChange("discountType", value)}
                className="w-full"
              >
                <Option value="Flat">Flat Discount</Option>
                <Option value="Percentage">Percentage Discount</Option>
              </Select>
            </div>
            {/* <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Discount Amount
              </label>
              <Input
                type="number"
                name="discountAmount"
                value={formData.discountAmount}
                onChange={(e) =>
                  handleChange("discountAmount", e.target.value)
                }
              />
            </div> */}
            {formData.discountType === "Flat" ? (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Discount Amount
                </label>
                <Input
                  type="number"
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={(e) =>
                    handleChange("discountAmount", e.target.value)
                  }
                />
              </div>
            ) : (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Discount Percentage
                </label>
                <Input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    handleChange("discountPercentage", e.target.value)
                  }
                />
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Start Date
              </label>
              <DatePicker
                className="w-full"
                value={formData.startDate ? dayjs(formData.startDate) : null}
                onChange={(date, dateString) =>
                  handleDateChange(date, dateString, "startDate")
                }
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Start Time
              </label>
              <TimePicker
                className="w-full"
                value={
                  formData.startTime ? dayjs(formData.startTime, "HH:mm") : null
                }
                onChange={(time, timeString) =>
                  handleDateChange(time, timeString, "startTime")
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                End Date
              </label>
              <DatePicker
                className="w-full"
                value={formData.endDate ? dayjs(formData.endDate) : null}
                onChange={(date, dateString) =>
                  handleDateChange(date, dateString, "endDate")
                }
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                End Time
              </label>
              <TimePicker
                className="w-full"
                value={
                  formData.endTime ? dayjs(formData.endTime, "HH:mm") : null
                }
                onChange={(time, timeString) =>
                  handleDateChange(time, timeString, "endTime")
                }
              />
            </div>
          </div>

          {/* Minimum Order Value */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Minimum Order Value
            </label>
            <Input
              type="number"
              name="minimumOrderValue"
              value={formData.minimumOrderValue}
              onChange={(e) =>
                handleChange("minimumOrderValue", e.target.value)
              }
            />
          </div>

          {/* Submit */}
          <Button
            type="primary"
            htmlType="submit"
            className="w-full bg-blue-500 text-white"
          >
            Create Coupon
          </Button>
        </form>
      </div>
    </>
  );
};

export default HOC(AddCoupon);
