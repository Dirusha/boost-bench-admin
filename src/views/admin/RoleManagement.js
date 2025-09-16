import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
} from "../../app/features/user/roleSlice"; // Adjust the import path as needed

export default function RoleManagement() {
  const dispatch = useDispatch();
  const { roles, permissions, loadingStates, error } = useSelector(
    (state) => state.roles
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [selectedPermissionsForRole, setSelectedPermissionsForRole] = useState(
    []
  );
  const [formError, setFormError] = useState("");

  // Fetch roles and permissions on component mount
  useEffect(() => {
    console.log(roles);
    dispatch(getRoles());
    dispatch(getPermissions());
  }, [dispatch]);

  // Filter roles based on search
  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle permission toggle for role
  const handlePermissionToggleForRole = (permissionId) => {
    setSelectedPermissionsForRole((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Handle delete action
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      dispatch(deleteRole(id));
    }
  };

  // Handle form submission for creating/updating role
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Role name is required");
      return;
    }
    setFormError("");

    const roleData = {
      name: formData.name,
      permissions: selectedPermissionsForRole,
    };

    if (isEdit) {
      dispatch(updateRole({ id: formData.id, roleData }));
    } else {
      dispatch(createRole(roleData));
    }
    closeModal();
  };

  const openModal = (item = null) => {
    if (item) {
      setIsEdit(true);
      setFormData({ id: item.id, name: item.name });
      setSelectedPermissionsForRole(item.permissions.map((p) => p.id));
    } else {
      setIsEdit(false);
      setFormData({ name: "" });
      setSelectedPermissionsForRole([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError("");
    setFormData({ name: "" });
    setSelectedPermissionsForRole([]);
  };

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-lg border-0">
        <div className="rounded-t bg-white mb-0 px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="mb-4 lg:mb-0">
              <h6 className="text-blueGray-700 text-2xl font-bold">
                Role Management
              </h6>
              <p className="text-blueGray-600 text-sm mt-2">
                Manage system roles and their associated permissions. Create,
                edit, and delete roles to control user access.
              </p>
            </div>
            <button
              className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
              type="button"
              onClick={() => openModal()}
              disabled={loadingStates.roleCreate || loadingStates.roleUpdate}
            >
              Add New Role
            </button>
          </div>
        </div>

        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Loading Indicator */}
          {loadingStates.roles && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lightBlue-500 mx-auto"></div>
              <p>Loading roles...</p>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative w-full mb-6">
            <input
              type="text"
              placeholder="Search roles by name..."
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

          {/* Roles Table */}
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Role Name
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Permissions
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {!loadingStates.roles && filteredRoles.length > 0 ? (
                  filteredRoles.map((role, index) => (
                    <tr
                      key={role.id}
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-blueGray-50"
                      }
                    >
                      <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-lightBlue-500 rounded-full flex items-center justify-center mr-4">
                            <span className="text-white font-semibold text-sm">
                              {role.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-blueGray-600 text-sm">
                              {role.name}
                            </span>
                            <br />
                            <span className="text-xs text-blueGray-500">
                              System Role
                            </span>
                          </div>
                        </div>
                      </th>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lightBlue-100 text-lightBlue-800">
                            {role.permissions.length} assigned
                          </span>
                          <div className="ml-2 flex flex-wrap gap-1">
                            {role.permissions.slice(0, 2).map((perm) => (
                              <span
                                key={perm.id}
                                className="inline-block px-2 py-1 text-xs bg-blueGray-200 text-blueGray-700 rounded"
                              >
                                {perm.name}
                              </span>
                            ))}
                            {role.permissions.length > 2 && (
                              <span className="inline-block px-2 py-1 text-xs bg-blueGray-300 text-blueGray-600 rounded">
                                +{role.permissions.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                        <div className="flex justify-end space-x-3">
                          <button
                            className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                            onClick={() => openModal(role)}
                            disabled={loadingStates.roleUpdate}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                            onClick={() => handleDelete(role.id)}
                            disabled={loadingStates.roleDelete}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : !loadingStates.roles ? (
                  <tr>
                    <td
                      colSpan={3}
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
                        No roles found. Create your first role to get started.
                      </div>
                    </td>
                  </tr>
                ) : null}
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
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          }}
        >
          <div
            className="w-80 flex flex-col shadow-2xl rounded-lg bg-white border-0 max-h-[70vh] overflow-hidden"
            style={{ width: "50rem", minWidth: "20rem", maxWidth: "50rem" }}
          >
            <div className="rounded-t bg-white mb-0 px-6 py-6 border-b border-blueGray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h6 className="text-blueGray-700 text-xl font-bold">
                  {isEdit ? "Edit Role" : "Create New Role"}
                </h6>
                <button
                  className="text-blueGray-400 hover:text-blueGray-600 text-xl font-bold outline-none focus:outline-none"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-auto px-6 py-6 overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <div className="w-full mb-4">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Enter role name"
                    disabled={
                      loadingStates.roleCreate || loadingStates.roleUpdate
                    }
                  />
                  {formError && (
                    <p className="text-red-500 text-xs mt-2">{formError}</p>
                  )}
                </div>

                <hr className="my-4 border-b-1 border-blueGray-300" />

                <div className="mb-4">
                  <h6 className="text-blueGray-600 text-sm mb-3 font-bold uppercase">
                    Assign Permissions
                  </h6>
                  {loadingStates.permissions ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lightBlue-500 mx-auto"></div>
                      <p>Loading permissions...</p>
                    </div>
                  ) : (
                    <div className="h-48 overflow-y-auto border border-blueGray-200 rounded p-3 bg-blueGray-50">
                      <div className="grid grid-cols-1 gap-2">
                        {permissions.map((permission) => (
                          <label
                            key={permission.id}
                            className="inline-flex items-center cursor-pointer hover:bg-white rounded p-2 transition-colors duration-150"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissionsForRole.includes(
                                permission.id
                              )}
                              onChange={() =>
                                handlePermissionToggleForRole(permission.id)
                              }
                              className="form-checkbox border border-blueGray-300 rounded text-lightBlue-600 w-4 h-4 ease-linear transition-all duration-150 focus:ring-2 focus:ring-lightBlue-500"
                              disabled={
                                loadingStates.roleCreate ||
                                loadingStates.roleUpdate
                              }
                            />
                            <span className="ml-3 text-sm font-medium text-blueGray-700">
                              {permission.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-blueGray-200 flex-shrink-0">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-blueGray-500 text-white active:bg-blueGray-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                    disabled={
                      loadingStates.roleCreate || loadingStates.roleUpdate
                    }
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !formData.name.trim() ||
                      loadingStates.roleCreate ||
                      loadingStates.roleUpdate
                    }
                    className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ease-linear transition-all duration-150"
                  >
                    {isEdit ? "Update Role" : "Create Role"}
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
