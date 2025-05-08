import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAllCoupons, deleteCoupon } from "../../redux/slices/couponSlice";
import HOC from "../../Component/HOC/HOC";

const ManageCoupons = () => {
  const dispatch = useDispatch();
  const { coupons, loading, error } = useSelector((state) => state.coupons);

  useEffect(() => {
    dispatch(fetchAllCoupons());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      dispatch(deleteCoupon(id));
    }
  };

  return (
    <div className="manage-coupons min-h-screen py-8">
      <div className="flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold text-white">Manage Coupons</h1>
        <Link
          to="/selfservice/addcoupon"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Coupon
        </Link>
      </div>

      {loading && <p className="text-center mt-4">Loading coupons...</p>}

      {/* Fix for error rendering */}
      {error && (
        <p className="text-center mt-4 text-red-500">
          {typeof error === "string"
            ? error
            : error.message || "An unknown error occurred."}
        </p>
      )}

      <div className="mt-6 px-4 text-white">
        {coupons && coupons.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Code</th>
                <th className="border border-gray-300 px-4 py-2">Type</th>
                <th className="border border-gray-300 px-4 py-2">Discount</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td className="border border-gray-300 px-4 py-2">{coupon.offerName}</td>
                  <td className="border border-gray-300 px-4 py-2">{coupon.couponCode}</td>
                  <td className="border border-gray-300 px-4 py-2">{coupon.couponType}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {coupon.discountType === "Percentage"
                      ? `${coupon.discountAmount}%`
                      : `₹${coupon.discountAmount}`}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 mr-2"
                      onClick={() => handleDelete(coupon._id)}
                    >
                      Delete
                    </button>
                    <Link
                      to={`/selfservice/editcoupon/${coupon._id}`}
                      className="bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center mt-4">No coupons available.</p>
        )}
      </div>
    </div>
  );
};

export default HOC(ManageCoupons);
