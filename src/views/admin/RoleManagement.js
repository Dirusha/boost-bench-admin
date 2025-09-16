// src/views/admin/RoleManagement.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getPermissions,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getRoleById,
  clearSelectedRole,
  createPermission,
  updatePermission,
  deletePermission,
  clearSelectedPermission,
  setSelectedPermission,
} from "../../app/features/user/roleSlice";
import debounce from "lodash/debounce";

// Sub-component for Table
const DataTable = ({ data, columns, onEdit, onDelete, emptyMessage }) => (
  <div className="block w-full overflow-x-auto">
    <table className="w-full align-middle border-blueGray-100 bg-white dark:bg-blueGray-800 shadow-lg rounded-lg">
      <thead className="bg-blueGray-50 dark:bg-blueGray-700">
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-4 sm:px-6 py-3 text-xs uppercase font-bold text-blueGray-700 dark:text-blueGray-200 text-left"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-blueGray-200 dark:divide-blueGray-600">
        {data.length > 0 ? (
          data.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-blueGray-50 dark:hover:bg-blueGray-700 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 sm:px-6 py-4 text-sm border-blueGray-200 dark:border-blueGray-600"
                >
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={columns.length}
              className="text-center py-8 text-blueGray-500 dark:text-blueGray-400"
            >
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// Sub-component for Modal
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  isSubmitDisabled,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-blueGray-800 rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-blueGray-700 dark:text-blueGray-200">
          {title}
        </h3>
        <form onSubmit={onSubmit}>
          {children}
          <div className="flex justify-end space-x-3 pt-4 border-t border-blueGray-200 dark:border-blueGray-600">
            <button
              type="button"
              onClick={onClose}
              className="bg-blueGray-500 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md transition-all"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Submit"
            >
              {title.includes("Edit") ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function RoleManagement() {
  const dispatch = useDispatch();
  const {
    roles,
    permissions,
    selectedRole,
    selectedPermission,
    loading,
    error,
  } = useSelector((state) => state.roles);
  const { token } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("roles");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({ name: "" });
  const [selectedPermissionsForRole, setSelectedPermissionsForRole] = useState(
    []
  );
  const [formError, setFormError] = useState("");

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => setSearchTerm(value), 300),
    []
  );

  useEffect(() => {
    if (token) {
      dispatch(getPermissions());
      dispatch(getRoles());
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (selectedRole) {
      setFormData({ name: selectedRole.name });
      setSelectedPermissionsForRole(selectedRole.permissions.map((p) => p.id));
    } else {
      setFormData({ name: "" });
      setSelectedPermissionsForRole([]);
    }
  }, [selectedRole]);

  useEffect(() => {
    if (selectedPermission) {
      setFormData({ name: selectedPermission.name });
    } else {
      setFormData({ name: "" });
    }
  }, [selectedPermission]);

  // Memoized filtered data
  const filteredRoles = useMemo(
    () =>
      roles.filter((role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [roles, searchTerm]
  );

  const filteredPermissions = useMemo(
    () =>
      permissions.filter((perm) =>
        perm.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [permissions, searchTerm]
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
  const handleDelete = (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === "role") {
        dispatch(deleteRole(id));
        toast.success("Role deleted successfully!");
      } else {
        dispatch(deletePermission(id));
        toast.success("Permission deleted successfully!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError(`${modalType} name is required`);
      return;
    }
    setFormError("");
    try {
      if (modalType === "role") {
        const roleData = {
          name: formData.name,
          permissions: selectedPermissionsForRole,
        };
        if (isEdit && selectedRole) {
          await dispatch(
            updateRole({ id: selectedRole.id, roleData })
          ).unwrap();
          toast.success("Role updated successfully!");
        } else {
          await dispatch(createRole(roleData)).unwrap();
          toast.success("Role created successfully!");
        }
      } else {
        const permissionData = { name: formData.name };
        if (isEdit && selectedPermission) {
          await dispatch(
            updatePermission({ id: selectedPermission.id, permissionData })
          ).unwrap();
          toast.success("Permission updated successfully!");
        } else {
          await dispatch(createPermission(permissionData)).unwrap();
          toast.success("Permission created successfully!");
        }
      }
      closeModal();
    } catch (err) {
      toast.error(`Error: ${err.message || "Operation failed"}`);
    }
  };

  const openModal = (item = null, type = "role") => {
    setModalType(type);
    setActiveTab(type + "s");
    if (item) {
      setIsEdit(true);
      if (type === "role") {
        dispatch(getRoleById(item.id));
      } else {
        dispatch(setSelectedPermission(item));
      }
    } else {
      setIsEdit(false);
      if (type === "role") {
        dispatch(clearSelectedRole());
      } else {
        dispatch(clearSelectedPermission());
      }
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError("");
    if (modalType === "role") {
      dispatch(clearSelectedRole());
    } else {
      dispatch(clearSelectedPermission());
    }
  };

  const roleColumns = [
    {
      key: "name",
      label: "Name",
      render: (role) => (
        <div className="font-bold text-blueGray-700 dark:text-blueGray-200">
          {role.name}
        </div>
      ),
    },
    {
      key: "permissions",
      label: "Assigned Permissions",
      render: (role) => (
        <span className="text-blueGray-600 dark:text-blueGray-400">
          {role.permissions.length} assigned
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (role) => (
        <div className="flex justify-end space-x-2">
          <button
            className="bg-blue-500 text-white font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md transition-all"
            onClick={() => openModal(role, "role")}
            aria-label={`Edit ${role.name}`}
          >
            Edit
          </button>
          <button
            className="bg-red-500 text-white font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md transition-all"
            onClick={() => handleDelete(role.id, "role")}
            aria-label={`Delete ${role.name}`}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const permissionColumns = [
    {
      key: "name",
      label: "Name",
      render: (perm) => (
        <div className="font-bold text-blueGray-700 dark:text-blueGray-200">
          {perm.name}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (perm) => (
        <div className="flex justify-end space-x-2">
          <button
            className="bg-blue-500 text-white font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md transition-all"
            onClick={() => openModal(perm, "permission")}
            aria-label={`Edit ${perm.name}`}
          >
            Edit
          </button>
          <button
            className="bg-red-500 text-white font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md transition-all"
            onClick={() => handleDelete(perm.id, "permission")}
            aria-label={`Delete ${perm.name}`}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg
          className="animate-spin h-8 w-8 text-lightBlue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
          ></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 dark:bg-blueGray-900 border-0">
      <div className="rounded-t bg-white dark:bg-blueGray-800 mb-0 px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h6 className="text-blueGray-700 dark:text-blueGray-200 text-xl font-bold">
            Role & Permission Management
          </h6>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <button
              className={`px-4 py-2 rounded font-bold text-xs uppercase transition-all ${
                activeTab === "roles"
                  ? "bg-lightBlue-500 text-white"
                  : "bg-blueGray-200 dark:bg-blueGray-700 text-blueGray-700 dark:text-blueGray-200 hover:bg-blueGray-300 dark:hover:bg-blueGray-600"
              }`}
              onClick={() => setActiveTab("roles")}
              aria-label="View Roles"
            >
              Roles
            </button>
            <button
              className={`px-4 py-2 rounded font-bold text-xs uppercase transition-all ${
                activeTab === "permissions"
                  ? "bg-lightBlue-500 text-white"
                  : "bg-blueGray-200 dark:bg-blueGray-700 text-blueGray-700 dark:text-blueGray-200 hover:bg-blueGray-300 dark:hover:bg-blueGray-600"
              }`}
              onClick={() => setActiveTab("permissions")}
              aria-label="View Permissions"
            >
              Permissions
            </button>
          </div>
        </div>
      </div>
      <div className="flex-auto px-4 sm:px-10 py-10 pt-0">
        {/* Search Bar */}
        <div className="relative w-full mb-6">
          <input
            type="text"
            placeholder={`Search ${
              activeTab === "roles" ? "roles" : "permissions"
            } by name...`}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="border-0 px-3 py-3 placeholder-blueGray-300 dark:placeholder-blueGray-400 text-blueGray-600 dark:text-blueGray-200 bg-white dark:bg-blueGray-700 rounded text-sm shadow focus:outline-none focus:ring w-full pr-10 transition-all"
            aria-label={`Search ${activeTab}`}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-blueGray-400 dark:text-blueGray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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

        {/* Content based on tab */}
        {activeTab === "roles" ? (
          <>
            <DataTable
              data={filteredRoles}
              columns={roleColumns}
              onEdit={(role) => openModal(role, "role")}
              onDelete={(id) => handleDelete(id, "role")}
              emptyMessage="No roles found."
            />
            <button
              className="mt-4 bg-lightBlue-500 text-white font-bold uppercase text-xs px-6 py-2 rounded shadow hover:shadow-md transition-all"
              onClick={() => openModal(null, "role")}
              aria-label="Add New Role"
            >
              Add New Role
            </button>
          </>
        ) : (
          <>
            <DataTable
              data={filteredPermissions}
              columns={permissionColumns}
              onEdit={(perm) => openModal(perm, "permission")}
              onDelete={(id) => handleDelete(id, "permission")}
              emptyMessage="No permissions found."
            />
            <button
              className="mt-4 bg-lightBlue-500 text-white font-bold uppercase text-xs px-6 py-2 rounded shadow hover:shadow-md transition-all"
              onClick={() => openModal(null, "permission")}
              aria-label="Add New Permission"
            >
              Add New Permission
            </button>
          </>
        )}
      </div>

      {/* Unified Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={isEdit ? `Edit ${modalType}` : `Create New ${modalType}`}
        onSubmit={handleSubmit}
        isSubmitDisabled={!formData.name.trim()}
      >
        <div className="mb-4">
          <label
            className="block text-blueGray-700 dark:text-blueGray-200 text-sm font-bold mb-2"
            htmlFor={`${modalType}-name`}
          >
            {modalType === "role" ? "Role Name" : "Permission Name"} *
          </label>
          <input
            id={`${modalType}-name`}
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border-0 px-3 py-2 placeholder-blueGray-300 dark:placeholder-blueGray-400 text-blueGray-600 dark:text-blueGray-200 bg-white dark:bg-blueGray-700 rounded text-sm shadow w-full focus:outline-none focus:ring focus:border-lightBlue-500"
            placeholder={`Enter ${modalType} name`}
            required
            aria-required="true"
          />
          {formError && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-2">
              {formError}
            </p>
          )}
        </div>
        {modalType === "role" && (
          <div className="mb-6">
            <label className="block text-blueGray-700 dark:text-blueGray-200 text-sm font-bold mb-2">
              Assign Permissions
            </label>
            <div className="max-h-48 overflow-y-auto border border-blueGray-200 dark:border-blueGray-600 rounded-md p-3 bg-blueGray-50 dark:bg-blueGray-700">
              {permissions.length > 0 ? (
                permissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-center p-2 hover:bg-white dark:hover:bg-blueGray-600 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissionsForRole.includes(
                        permission.id
                      )}
                      onChange={() =>
                        handlePermissionToggleForRole(permission.id)
                      }
                      className="mr-3 h-4 w-4 text-lightBlue-600 focus:ring-lightBlue-500 border-blueGray-300 dark:border-blueGray-500 rounded"
                      aria-label={`Assign ${permission.name}`}
                    />
                    <span className="text-sm text-blueGray-700 dark:text-blueGray-200">
                      {permission.name}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-blueGray-500 dark:text-blueGray-400 text-sm">
                  No permissions available.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}