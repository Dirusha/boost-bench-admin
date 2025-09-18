import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  clearError,
} from "../../app/features/orders/orderSlice";
import Restricted from "components/Restricted";

export default function OrderManagement() {
  const dispatch = useDispatch();
  const { orders, selectedOrder, loadingStates, error } = useSelector(
    (state) => state.orders
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // New state for success feedback

  // Fetch all orders on component mount
  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Filter orders based on search
  const filteredOrders = orders.filter(
    (order) =>
      order.id.toString().includes(searchTerm) ||
      `${order.customerFirstName} ${order.customerLastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Get status badge class and text
  const getStatusBadge = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-indigo-100 text-indigo-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  // Define status order and allowed transitions
  const statusOrder = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ];

  // Get allowed status transitions
  const getAllowedStatuses = (currentStatus) => {
    if (currentStatus === "CANCELLED") {
      return ["CANCELLED"];
    }

    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex === -1) {
      return [currentStatus, "CANCELLED"];
    }

    // Allow current status, next status (if exists), and CANCELLED
    const allowed = [currentStatus];
    if (currentIndex < statusOrder.length - 1) {
      allowed.push(statusOrder[currentIndex + 1]);
    }
    allowed.push("CANCELLED");
    return allowed;
  };

  // Handle view order details
  const handleViewOrder = async (orderId, userId) => {
    await dispatch(getOrderById({ orderId, userId }));
    setShowViewModal(true);
  };

  // Handle open update status modal
  const openUpdateModal = (order) => {
    setSelectedOrderForUpdate(order);
    setNewStatus(order.status);
    setFormError("");
    setSuccessMessage(""); // Clear success message
    setShowUpdateModal(true);
  };

  // Handle update status submit
  const handleUpdateStatusSubmit = (e) => {
    e.preventDefault();
    if (!newStatus) {
      setFormError("Status is required");
      return;
    }
    setFormError("");
    setSuccessMessage(""); // Clear previous success message

    dispatch(
      updateOrderStatus({
        orderId: selectedOrderForUpdate.id,
        status: newStatus,
      })
    ).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        // Show success message and refetch orders to ensure UI is up-to-date
        setSuccessMessage(
          `Order #${selectedOrderForUpdate.id} status updated to ${newStatus}`
        );
        dispatch(getAllOrders()); // Refresh orders list
        closeUpdateModal();
      } else {
        // Display error from backend or fallback
        setFormError(result.payload || "Failed to update status");
      }
    });
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    dispatch(clearError());
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setFormError("");
    setSuccessMessage("");
    setSelectedOrderForUpdate(null);
    setNewStatus("");
  };

  // Status options (all possible)
  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "PROCESSING", label: "Processing" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  // Filtered status options based on current order status
  const getFilteredStatusOptions = () => {
    if (!selectedOrderForUpdate) return [];
    const allowed = getAllowedStatuses(selectedOrderForUpdate.status);
    return statusOptions.filter((option) => allowed.includes(option.value));
  };

  const filteredStatusOptions = getFilteredStatusOptions();

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-lg border-0">
        <div className="rounded-t bg-white mb-0 px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="mb-4 lg:mb-0">
              <h6 className="text-blueGray-700 text-2xl font-bold">
                Order Management
              </h6>
              <p className="text-blueGray-600 text-sm mt-2">
                Manage orders and update their status. View order details and
                track fulfillment.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Loading Indicator */}
          {loadingStates.allOrders && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lightBlue-500 mx-auto"></div>
              <p>Loading orders...</p>
            </div>
          )}

          {/* Search Bar */}
          <Restricted permission="ORDER_READ_ALL">
            <div className="relative w-full mb-6">
              <input
                type="text"
                placeholder="Search orders by ID or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full pr-10 ease-linear transition-all duration-150"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-blueGray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ marginTop: "-35px", marginRight: "5px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </Restricted>

          {/* Orders Table */}
          <Restricted permission="ORDER_READ_ALL">
            <div className="block w-full overflow-x-auto">
              <table className="items-center w-full bg-transparent border-collapse">
                <thead>
                  <tr>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Order #
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Customer
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Total Amount
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Status
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Items
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Created At
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {!loadingStates.allOrders && filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => (
                      <tr
                        key={order.id}
                        className={
                          index % 2 === 0 ? "bg-white" : "bg-blueGray-50"
                        }
                      >
                        <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          <span className="font-bold text-blueGray-600 text-sm">
                            #{order.id}
                          </span>
                        </th>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-lightBlue-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-semibold text-xs">
                                {order.customerFirstName.charAt(0)}
                                {order.customerLastName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-blueGray-700 text-sm">
                                {order.customerFirstName}{" "}
                                {order.customerLastName}
                              </span>
                              <br />
                              <span className="text-xs text-blueGray-500">
                                {order.customerEmail}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <span className="font-bold text-blueGray-600">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lightBlue-100 text-lightBlue-800">
                            {order.items.length} items
                          </span>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <span className="text-blueGray-600 text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Restricted permission="ORDER_READ_ALL">
                              <button
                                className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                                onClick={() =>
                                  handleViewOrder(order.id, order.userId)
                                }
                                disabled={loadingStates.orderDetail}
                              >
                                View
                              </button>
                            </Restricted>
                            <Restricted permission="ORDER_STATUS_UPDATE">
                              <button
                                className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                                onClick={() => openUpdateModal(order)}
                                disabled={loadingStates.updateStatus}
                              >
                                Update Status
                              </button>
                            </Restricted>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : !loadingStates.allOrders ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-blueGray-500"
                      >
                        <div className="flex flex-col items-center">
                          <svg
                            className="w-12 h-12 text-blueGray-300 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          No orders found.
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Restricted>
        </div>
      </div>

      {/* View Order Details Modal */}
      {showViewModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-20 flex items-center justify-center z-50 p-4"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}
        >
          <div
            className="w-full max-w-4xl flex flex-col shadow-2xl rounded-lg bg-white border-0 max-h-[90vh] overflow-hidden"
            style={{ width: "80rem", minWidth: "40rem", maxWidth: "80rem" }}
          >
            <div className="rounded-t bg-white mb-0 px-6 py-6 border-b border-blueGray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h6 className="text-blueGray-700 text-xl font-bold">
                  Order Details - #{selectedOrder.id}
                </h6>
                <button
                  className="text-blueGray-400 hover:text-blueGray-600 text-xl font-bold outline-none focus:outline-none"
                  onClick={closeViewModal}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-auto px-6 py-6 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Order Info */}
                <div>
                  <h6 className="text-blueGray-600 text-sm mb-3 font-bold uppercase">
                    Order Information
                  </h6>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {getStatusBadge(selectedOrder.status)}
                    </p>
                    <p>
                      <span className="font-medium">Payment Status:</span>{" "}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedOrder.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-800"
                            : selectedOrder.paymentStatus === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedOrder.paymentStatus === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedOrder.paymentStatus}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Total Amount:</span> $
                      {selectedOrder.totalAmount.toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium">Created At:</span>{" "}
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Updated At:</span>{" "}
                      {new Date(selectedOrder.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h6 className="text-blueGray-600 text-sm mb-3 font-bold uppercase">
                    Customer Information
                  </h6>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedOrder.customerFirstName}{" "}
                      {selectedOrder.customerLastName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedOrder.customerEmail}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedOrder.customerPhone}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {selectedOrder.customerAddress},{" "}
                      {selectedOrder.customerCity},{" "}
                      {selectedOrder.customerCountry}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-6">
                <h6 className="text-blueGray-600 text-sm mb-3 font-bold uppercase">
                  Payment Information
                </h6>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Payment Method:</span>{" "}
                    {selectedOrder.paymentMethod || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Payment ID:</span>{" "}
                    {selectedOrder.paymentId || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Completed At:</span>{" "}
                    {selectedOrder.paymentCompletedAt
                      ? new Date(
                          selectedOrder.paymentCompletedAt
                        ).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h6 className="text-blueGray-600 text-sm mb-3 font-bold uppercase">
                  Order Items
                </h6>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-blueGray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-blueGray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-blueGray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-blueGray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-blueGray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr
                          key={item.id}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-blueGray-50"
                          }
                        >
                          <td className="px-4 py-2 text-sm text-blueGray-900">
                            {item.productName}
                          </td>
                          <td className="px-4 py-2 text-sm text-blueGray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 text-sm text-blueGray-900">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-blueGray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-blueGray-50">
                        <td
                          colSpan={3}
                          className="px-4 py-2 text-right font-bold text-lg"
                        >
                          Grand Total
                        </td>
                        <td className="px-4 py-2 font-bold text-lg text-blueGray-900">
                          ${selectedOrder.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-4 mt-4 border-t border-blueGray-200 flex-shrink-0">
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="bg-blueGray-500 text-white active:bg-blueGray-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && selectedOrderForUpdate && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-20 flex items-center justify-center z-50 p-4"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}
        >
          <div
            className="w-96 flex flex-col shadow-2xl rounded-lg bg-white border-0 max-h-[70vh] overflow-hidden"
            style={{ width: "30rem", minWidth: "20rem", maxWidth: "30rem" }}
          >
            <div className="rounded-t bg-white mb-0 px-6 py-6 border-b border-blueGray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h6 className="text-blueGray-700 text-xl font-bold">
                  Update Order Status - #{selectedOrderForUpdate.id}
                </h6>
                <button
                  className="text-blueGray-400 hover:text-blueGray-600 text-xl font-bold outline-none focus:outline-none"
                  onClick={closeUpdateModal}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-auto px-6 py-6 overflow-y-auto">
              <form onSubmit={handleUpdateStatusSubmit}>
                <div className="w-full mb-4">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    New Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    disabled={loadingStates.updateStatus}
                  >
                    {filteredStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formError && (
                    <p className="text-red-500 text-xs mt-2">{formError}</p>
                  )}
                  {filteredStatusOptions.length <= 1 && (
                    <p className="text-blueGray-500 text-xs mt-1">
                      No further status changes available for this order.
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 mt-4 border-blueGray-200 flex-shrink-0">
                  <button
                    type="button"
                    onClick={closeUpdateModal}
                    className="bg-blueGray-500 text-white active:bg-blueGray-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                    disabled={loadingStates.updateStatus}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newStatus || loadingStates.updateStatus}
                    className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ease-linear transition-all duration-150"
                  >
                    Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
