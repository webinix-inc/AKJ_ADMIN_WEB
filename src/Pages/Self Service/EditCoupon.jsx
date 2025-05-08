import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCoupon, fetchCouponById } from "../../redux/slices/couponSlice";
import { fetchCourses } from "../../redux/slices/courseSlice";
import { useNavigate, useParams } from "react-router-dom";

import {
  Modal, Button, Input, Checkbox, Select, DatePicker, TimePicker, Spin
} from "antd";

import img5 from "../../Image/img30.png";
import HOC from "../../Component/HOC/HOC";
import dayjs from "dayjs";

const { Option } = Select;

const EditCoupon = () => {
  const [formData, setFormData] = useState({});
  const [modalShow, setModalShow] = useState(false);

  const { id } = useParams();
  console.log("Print the id:", id);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { courses, loading: coursesLoading } = useSelector((state) => state.courses);
  const { coupon, loading: couponLoading } = useSelector((state) => state.coupons);

  useEffect(() => {
    dispatch(fetchCourses());
    if (id) dispatch(fetchCouponById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (coupon) setFormData(coupon);
  }, [coupon]);

  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateCoupon({ id, formData }))
      .unwrap()
      .then(() => {
        setModalShow(true);
        setTimeout(() => {
          setModalShow(false);
          navigate("/selfservice/manage-coupons");
        }, 2000);
      })
      .catch((err) => console.error("Error updating coupon:", err));
  };

  if (couponLoading) return <Spin size="large" className="flex justify-center items-center h-screen" />;

  return (
    <>
      {/* Success Modal */}
      <Modal open={modalShow} centered footer={null} onCancel={() => navigate("/selfservice/manage-coupons")}>
        <div className="text-center">
          <img src={img5} alt="Success" className="w-20 h-20 mx-auto" />
          <p className="text-lg font-medium text-gray-800">Coupon Updated Successfully</p>
        </div>
      </Modal>

      {/* Coupon Form */}
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-md p-8 mt-6">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => navigate("/selfservice")} className="bg-blue-500 text-white">Back</Button>
          <h2 className="text-xl font-semibold text-gray-800">Edit Coupon</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <CustomInput label="Offer Name" field="offerName" formData={formData} handleChange={handleChange} required />
          <CustomInput label="Coupon Code" field="couponCode" formData={formData} handleChange={handleChange} required />

          {/* Coupon Type */}
          <CustomSelect label="Coupon Type" field="couponType" formData={formData} handleChange={handleChange} options={["Public", "Private"]} />
          {formData.couponType === "Private" && (
            <CustomInput label="Assigned Users (comma separated)" field="assignedUserIds" formData={formData} handleChange={handleChange} isArray />
          )}

          {/* Course Selection */}
          <CustomSelect label="Course Selection Type" field="courseSelectionType" formData={formData} handleChange={handleChange} options={["All", "Specific"]} />
          {formData.courseSelectionType === "Specific" && (
            <CustomMultiSelect label="Assigned Courses" field="assignedCourseIds" formData={formData} handleChange={handleChange} options={courses} loading={coursesLoading} />
          )}

          {/* Discount Settings */}
          <div className="grid grid-cols-2 gap-4">
            <CustomSelect label="Discount Type" field="discountType" formData={formData} handleChange={handleChange} options={["Flat", "Percentage"]} />
            <CustomInput label="Discount Amount" field="discountAmount" formData={formData} handleChange={handleChange} type="number" />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <CustomDatePicker label="Start Date" field="startDate" formData={formData} handleChange={handleChange} />
            <CustomTimePicker label="Start Time" field="startTime" formData={formData} handleChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustomDatePicker label="End Date" field="endDate" formData={formData} handleChange={handleChange} disabled={formData.isLifetime} />
            <CustomTimePicker label="End Time" field="endTime" formData={formData} handleChange={handleChange} disabled={formData.isLifetime} />
          </div>

          {/* Other Settings */}
          <CustomInput label="Minimum Order Value" field="minimumOrderValue" formData={formData} handleChange={handleChange} type="number" />
          <CustomCheckbox label="Make Coupon Visible" field="visibility" formData={formData} handleChange={handleChange} />
          <CustomCheckbox label="Set as Unlimited" field="isUnlimited" formData={formData} handleChange={handleChange} />

          <Button type="primary" htmlType="submit" className="w-full bg-blue-500 text-white">Update Coupon</Button>
        </form>
      </div>
    </>
  );
};

export default HOC(EditCoupon);

/* ------------------ Reusable Components ------------------ */

const CustomInput = ({ label, field, formData, handleChange, type = "text", required = false, isArray = false }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-600">{label}</label>
    <Input
      type={type}
      value={isArray ? formData[field]?.join(",") : formData[field]}
      onChange={(e) => handleChange(field, isArray ? e.target.value.split(",").map((id) => id.trim()) : e.target.value)}
      placeholder={`Enter ${label.toLowerCase()}`}
      required={required}
    />
  </div>
);

const CustomSelect = ({ label, field, formData, handleChange, options }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-600">{label}</label>
    <Select value={formData[field]} onChange={(value) => handleChange(field, value)} className="w-full">
      {options.map((option) => <Option key={option} value={option}>{option}</Option>)}
    </Select>
  </div>
);

const CustomMultiSelect = ({ label, field, formData, handleChange, options, loading }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-600">{label}</label>
    <Select mode="multiple" value={formData[field]} onChange={(value) => handleChange(field, value)} className="w-full" loading={loading}>
      {options.map((option) => <Option key={option._id} value={option._id}>{option.title}</Option>)}
    </Select>
  </div>
);

const CustomDatePicker = ({ label, field, formData, handleChange, disabled = false }) => (
  <DatePicker className="w-full" value={formData[field] ? dayjs(formData[field]) : null} onChange={(date, dateString) => handleChange(field, dateString)} disabled={disabled} />
);

const CustomTimePicker = ({ label, field, formData, handleChange, disabled = false }) => (
  <TimePicker className="w-full" value={formData[field] ? dayjs(formData[field], "HH:mm") : null} onChange={(time, timeString) => handleChange(field, timeString)} disabled={disabled} />
);

const CustomCheckbox = ({ label, field, formData, handleChange }) => (
    <Checkbox checked={formData[field]} onChange={(e) => handleChange(field, e.target.checked)}>
      {label}
    </Checkbox>
  );
  