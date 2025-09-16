// Updated UserManagement Component
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  setSelectedUser,
  clearSelectedUser,
} from "../../app/features/user/userSlice"; // Adjust path as needed
import { getRoles } from "../../app/features/user/roleSlice"; // Import getRoles from roleSlice

export default function UserManagement() {
  const dispatch = useDispatch();
  const {
    users,
    loadingStates: userLoadingStates,
    error: userError,
    selectedUser,
  } = useSelector((state) => state.user);
  const {
    roles,
    loadingStates: roleLoadingStates,
    error: roleError,
  } = useSelector((state) => state.roles); // Access roles slice

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    workEmail: "",
    phoneNumber: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
    roleIds: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Fetch users and roles on component mount
  useEffect(() => {
    dispatch(getUsers());
    dispatch(getRoles()); // Fetch roles using roleSlice thunk
  }, [dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter users based on search
  const filteredUsers =
    users?.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.workEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Filter roles for dropdown
  const filteredRoles =
    roles?.filter((role) =>
      role.name.toLowerCase().includes(roleSearchTerm.toLowerCase())
    ) || [];

  // Get selected roles for display
  const getSelectedRoles = () => {
    return roles?.filter((role) => formData.roleIds.includes(role.id)) || [];
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(078|072|075|077|071|070|074)\d{7}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (!usernameRegex.test(formData.username)) {
      errors.username =
        "Username must be 3-20 characters and contain only letters, numbers, or underscores";
    }

    if (!isEdit && !formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!isEdit && !formData.confirmPassword.trim()) {
      errors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.workEmail.trim()) {
      errors.workEmail = "Work email is required";
    } else if (!emailRegex.test(formData.workEmail)) {
      errors.workEmail = "Please enter a valid email address";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      errors.phoneNumber =
        "Phone number must be 10 digits and start with 078, 072, 075, 077, 071, 070, or 074";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      errors.city = "City is required";
    }

    if (!formData.country.trim()) {
      errors.country = "Country is required";
    }

    if (!formData.zipCode.trim()) {
      errors.zipCode = "Zip code is required";
    }

    if (formData.roleIds.length === 0) {
      errors.roleIds = "At least one role must be selected";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle role selection
  const handleRoleToggle = (roleId) => {
    setFormData((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
    setTouched((prev) => ({ ...prev, roleIds: true }));
    if (formErrors.roleIds) {
      setFormErrors((prev) => ({ ...prev, roleIds: "" }));
    }
  };

  // Handle delete action
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(id));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      username: true,
      password: true,
      confirmPassword: true,
      fullName: true,
      workEmail: true,
      phoneNumber: true,
      address: true,
      city: true,
      country: true,
      zipCode: true,
      roleIds: true,
    });

    if (!validateForm()) {
      return;
    }

    const userData = { ...formData };
    delete userData.confirmPassword;

    if (isEdit && !userData.password.trim()) {
      delete userData.password;
    }

    if (isEdit) {
      dispatch(updateUser({ id: formData.id, userData }));
    } else {
      dispatch(createUser(userData));
    }
    closeModal();
  };

  const openModal = (user = null) => {
    if (user) {
      setIsEdit(true);
      dispatch(setSelectedUser(user));
      setFormData({
        id: user.id,
        username: user.username || "",
        password: "",
        confirmPassword: "",
        fullName: user.fullName || "",
        workEmail: user.workEmail || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        city: user.city || "",
        country: user.country || "",
        zipCode: user.zipCode || "",
        roleIds: user.roles?.map((r) => r.id) || [],
      });
    } else {
      setIsEdit(false);
      dispatch(clearSelectedUser());
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        workEmail: "",
        phoneNumber: "",
        address: "",
        city: "",
        country: "",
        zipCode: "",
        roleIds: [],
      });
    }
    setFormErrors({});
    setTouched({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormErrors({});
    setTouched({});
    setRoleSearchTerm("");
    setShowRoleDropdown(false);
    dispatch(clearSelectedUser());
  };

  const handleInputChange = (field, value) => {
    if (field === "phoneNumber") {
      value = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate the field immediately
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(078|072|075|077|071|070|074)\d{7}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (field === "username") {
      if (!value.trim()) errors.username = "Username is required";
      else if (!usernameRegex.test(value))
        errors.username =
          "Username must be 3-20 characters and contain only letters, numbers, or underscores";
    }
    if (field === "password") {
      if (!isEdit && !value.trim()) errors.password = "Password is required";
      else if (value && value.length < 6)
        errors.password = "Password must be at least 6 characters";
      if (formData.confirmPassword && value !== formData.confirmPassword)
        errors.confirmPassword = "Passwords do not match";
    }
    if (field === "confirmPassword") {
      if (!isEdit && !value.trim())
        errors.confirmPassword = "Confirm password is required";
      else if (value !== formData.password)
        errors.confirmPassword = "Passwords do not match";
    }
    if (field === "fullName" && !value.trim())
      errors.fullName = "Full name is required";
    if (field === "workEmail") {
      if (!value.trim()) errors.workEmail = "Work email is required";
      else if (!emailRegex.test(value))
        errors.workEmail = "Please enter a valid email address";
    }
    if (field === "phoneNumber") {
      if (!value.trim()) errors.phoneNumber = "Phone number is required";
      else if (!phoneRegex.test(value))
        errors.phoneNumber =
          "Phone number must be 10 digits and start with 078, 072, 075, 077, 071, 070, or 074";
    }
    if (field === "address" && !value.trim())
      errors.address = "Address is required";
    if (field === "city" && !value.trim()) errors.city = "City is required";
    if (field === "country" && !value.trim())
      errors.country = "Country is required";
    if (field === "zipCode" && !value.trim())
      errors.zipCode = "Zip code is required";

    setFormErrors((prev) => ({
      ...prev,
      [field]: errors[field] || "",
      ...(field === "password" && {
        confirmPassword: errors.confirmPassword || "",
      }),
      ...(field === "confirmPassword" && {
        confirmPassword: errors.confirmPassword || "",
      }),
    }));
  };

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-lg border-0">
        <div className="rounded-t bg-white mb-0 px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="mb-4 lg:mb-0">
              <h6 className="text-blueGray-700 text-2xl font-bold">
                User Management
              </h6>
              <p className="text-blueGray-600 text-sm mt-2">
                Manage system users and their assigned roles. Create, edit, and
                delete user accounts.
              </p>
            </div>
            <button
              className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
              type="button"
              onClick={() => openModal()}
              disabled={userLoadingStates.userCreate}
            >
              Add New User
            </button>
          </div>
          {(userError || roleError) && (
            <p className="text-red-500 text-sm mt-2">
              {userError || roleError}
            </p>
          )}
        </div>

        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          {/* Search Bar */}
          <div className="relative w-full mb-6">
            <input
              type="text"
              placeholder="Search users by name, email, or username..."
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

          {/* Users Table */}
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    User Details
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Contact Info
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Roles
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {userLoadingStates.users || roleLoadingStates.roles ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-8 text-blueGray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-blueGray-50"
                      }
                    >
                      <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-lightBlue-500 rounded-full flex items-center justify-center mr-4">
                            <span className="text-white font-semibold text-sm">
                              {user.fullName?.charAt(0) ||
                                user.username?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-blueGray-600 text-sm">
                              {user.fullName}
                            </span>
                            <br />
                            <span className="text-xs text-blueGray-500">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </th>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <div>
                          <div className="mb-1">
                            <span className="text-blueGray-600 font-medium">
                              {user.workEmail}
                            </span>
                          </div>
                          <div className="mb-1">
                            <span className="text-blueGray-500">
                              {user.phoneNumber}
                            </span>
                          </div>
                          <div>
                            <span className="text-blueGray-500 text-xs">
                              {user.city}, {user.country}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.length > 0 ? (
                            user.roles.map((role) => (
                              <span
                                key={role.id}
                                className="inline-block px-2 py-1 text-xs bg-lightBlue-100 text-lightBlue-800 rounded font-medium"
                              >
                                {role.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-blueGray-400 text-xs">
                              No roles assigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                        <div className="flex justify-end space-x-3">
                          <button
                            className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                            onClick={() => openModal(user)}
                            disabled={userLoadingStates.userUpdate}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                            onClick={() => handleDelete(user.id)}
                            disabled={userLoadingStates.userDelete}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
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
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                        No users found. Create your first user to get started.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
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
            className="flex flex-col shadow-2xl rounded-lg bg-white border-0 overflow-y-auto"
            style={{
              width: "50rem",
              minWidth: "20rem",
              maxWidth: "90vw",
              height: "90vh",
            }}
          >
            <div className="rounded-t bg-white mb-0 px-6 py-6 border-b border-blueGray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h6 className="text-blueGray-700 text-xl font-bold">
                  {isEdit ? "Edit User" : "Create New User"}
                </h6>
                <button
                  className="text-blueGray-400 hover:text-blueGray-600 text-xl font-bold outline-none focus:outline-none"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-auto px-6 py-6 h-[70vh] max-h-[70vh] overflow-y-scroll bg-white rounded-lg">
              <div>
                {/* Account Information */}
                <div className="mb-6">
                  <h6 className="text-blueGray-600 text-sm mb-4 font-bold uppercase">
                    Account Information
                  </h6>
                  <div className="flex flex-row gap-4 mb-4">
                    <div className="w-full">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                          touched.username && formErrors.username
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        placeholder="Enter username"
                        disabled={
                          userLoadingStates.userCreate ||
                          userLoadingStates.userUpdate
                        }
                      />
                      {touched.username && formErrors.username && (
                        <p className="text-red-500 text-xs mt-2">
                          {formErrors.username}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row gap-4 mb-4">
                    <div className="w-full">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Password {!isEdit && "*"}
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                          touched.password && formErrors.password
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        placeholder={
                          isEdit
                            ? "Leave blank to keep current password"
                            : "Enter password"
                        }
                        disabled={
                          userLoadingStates.userCreate ||
                          userLoadingStates.userUpdate
                        }
                      />
                      {touched.password && formErrors.password && (
                        <p className="text-red-500 text-xs mt-2">
                          {formErrors.password}
                        </p>
                      )}
                    </div>
                    <div className="w-full">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Confirm Password {!isEdit && "*"}
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                          touched.confirmPassword && formErrors.confirmPassword
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        placeholder="Confirm password"
                        disabled={
                          userLoadingStates.userCreate ||
                          userLoadingStates.userUpdate
                        }
                      />
                      {touched.confirmPassword &&
                        formErrors.confirmPassword && (
                          <p className="text-red-500 text-xs mt-2">
                            {formErrors.confirmPassword}
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="mb-6">
                  <h6 className="text-blueGray-600 text-sm mb-4 font-bold uppercase">
                    Personal Information
                  </h6>
                  <div className="flex flex-row gap-4 mb-4">
                    <div className="w-full">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                          touched.fullName && formErrors.fullName
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        placeholder="Enter full name"
                        disabled={
                          userLoadingStates.userCreate ||
                          userLoadingStates.userUpdate
                        }
                      />
                      {touched.fullName && formErrors.fullName && (
                        <p className="text-red-500 text-xs mt-2">
                          {formErrors.fullName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row gap-4 mb-4">
                    <div className="w-full">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        value={formData.workEmail}
                        onChange={(e) =>
                          handleInputChange("workEmail", e.target.value)
                        }
                        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                          touched.workEmail && formErrors.workEmail
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        placeholder="Enter work email"
                        disabled={
                          userLoadingStates.userCreate ||
                          userLoadingStates.userUpdate
                        }
                      />
                      {touched.workEmail && formErrors.workEmail && (
                        <p className="text-red-500 text-xs mt-2">
                          {formErrors.workEmail}
                        </p>
                      )}
                    </div>
                    <div className="w-full">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => {
                          let value = e.target.value
                            .replace(/[^0-9]/g, "")
                            .slice(0, 10);
                          handleInputChange("phoneNumber", value);
                        }}
                        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                          touched.phoneNumber && formErrors.phoneNumber
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        placeholder="e.g., 0726831994"
                        disabled={
                          userLoadingStates.userCreate ||
                          userLoadingStates.userUpdate
                        }
                      />
                      {touched.phoneNumber && formErrors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-2">
                          {formErrors.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row gap-4 mb-4">
                    <div className="w-full">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                          touched.city && formErrors.city
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        placeholder="Enter city"
                        disabled={
                          userLoadingStates.userCreate ||
                          userLoadingStates.userUpdate
                        }
                      />
                      {touched.city && formErrors.city && (
                        <p className="text-red-500 text-xs mt-2">
                          {formErrors.city}
                        </p>
                      )}
                    </div>
                    <div className="w-full">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Country *
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) =>
                          handleInputChange("country", e.target.value)
                        }
                        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                          touched.country && formErrors.country
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        placeholder="Enter country"
                        disabled={
                          userLoadingStates.userCreate ||
                          userLoadingStates.userUpdate
                        }
                      />
                      {touched.country && formErrors.country && (
                        <p className="text-red-500 text-xs mt-2">
                          {formErrors.country}
                        </p>
                      )}
                    </div>
                    <div className="w-full">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Zip Code *
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) =>
                          handleInputChange("zipCode", e.target.value)
                        }
                        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                          touched.zipCode && formErrors.zipCode
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        placeholder="Enter zip code"
                        disabled={
                          userLoadingStates.userCreate ||
                          userLoadingStates.userUpdate
                        }
                      />
                      {touched.zipCode && formErrors.zipCode && (
                        <p className="text-red-500 text-xs mt-2">
                          {formErrors.zipCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row gap-4 mb-4">
                    <div className="w-full">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                          touched.address && formErrors.address
                            ? "border-2 border-red-500"
                            : ""
                        }`}
                        placeholder="Enter address"
                        disabled={
                          userLoadingStates.userCreate ||
                          userLoadingStates.userUpdate
                        }
                      />
                      {touched.address && formErrors.address && (
                        <p className="text-red-500 text-xs mt-2">
                          {formErrors.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="my-4 border-b-1 border-blueGray-200" />

                {/* Role Assignment */}
                <div className="mb-4">
                  <h6 className="text-blueGray-600 text-sm mb-3 font-bold uppercase">
                    Assign Roles *
                  </h6>

                  {/* Selected Roles Display */}
                  {getSelectedRoles().length > 0 ? (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {getSelectedRoles().map((role) => (
                          <span
                            key={role.id}
                            className="inline-flex items-center px-3 py-1 text-sm bg-lightBlue-100 text-lightBlue-800 rounded-full"
                          >
                            {role.name}
                            <button
                              type="button"
                              onClick={() => handleRoleToggle(role.id)}
                              className="ml-2 text-lightBlue-600 hover:text-lightBlue-800 focus:outline-none"
                              disabled={
                                userLoadingStates.userCreate ||
                                userLoadingStates.userUpdate
                              }
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-blueGray-500 text-sm">
                      No roles selected.
                    </p>
                  )}

                  {/* Role Search Dropdown */}
                  {roles.length > 0 ? (
                    <div className="flex flex-row gap-4">
                      <div className="w-full relative" ref={dropdownRef}>
                        <input
                          type="text"
                          value={roleSearchTerm}
                          onChange={(e) => setRoleSearchTerm(e.target.value)}
                          onFocus={() => setShowRoleDropdown(true)}
                          className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                            touched.roleIds && formErrors.roleIds
                              ? "border-2 border-red-500"
                              : ""
                          }`}
                          placeholder="Search and select roles..."
                          disabled={
                            userLoadingStates.userCreate ||
                            userLoadingStates.userUpdate
                          }
                        />
                        {showRoleDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-blueGray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                            {filteredRoles.length > 0 ? (
                              filteredRoles.map((role) => (
                                <div
                                  key={role.id}
                                  className="px-3 py-2 hover:bg-blueGray-50 cursor-pointer border-b border-blueGray-100 last:border-b-0"
                                  onClick={() => {
                                    handleRoleToggle(role.id);
                                    setRoleSearchTerm("");
                                    setShowRoleDropdown(false);
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="text-sm font-medium text-blueGray-600">
                                        {role.name}
                                      </span>
                                      {role.permissions && (
                                        <p className="text-xs text-blueGray-500">
                                          {role.permissions.length} permissions
                                        </p>
                                      )}
                                    </div>
                                    {formData.roleIds.includes(role.id) && (
                                      <svg
                                        className="w-4 h-4 text-lightBlue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-4 text-center text-blueGray-500 text-sm">
                                No roles found
                              </div>
                            )}
                          </div>
                        )}
                        {touched.roleIds && formErrors.roleIds && (
                          <p className="text-red-500 text-xs mt-2">
                            {formErrors.roleIds}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : roleLoadingStates.roles ? (
                    <p className="text-blueGray-500 text-sm">
                      Loading roles...
                    </p>
                  ) : (
                    <p className="text-blueGray-500 text-sm">
                      No roles available.
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-blueGray-200 flex-shrink-0">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-blueGray-500 text-white active:bg-blueGray-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                    disabled={
                      userLoadingStates.userCreate ||
                      userLoadingStates.userUpdate
                    }
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ease-linear transition-all duration-150"
                    disabled={
                      userLoadingStates.userCreate ||
                      userLoadingStates.userUpdate
                    }
                  >
                    {isEdit ? "Update User" : "Create User"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
