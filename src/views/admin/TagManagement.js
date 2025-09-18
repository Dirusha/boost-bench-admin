import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  clearError,
} from "../../app/features/tags/tagSlice"; // Adjust the import path as needed
import Restricted from "components/Restricted";

export default function TagManagement() {
  const dispatch = useDispatch();
  const { tags, loadingStates, error } = useSelector((state) => state.tags);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [formError, setFormError] = useState("");

  // Fetch tags on component mount
  useEffect(() => {
    dispatch(getTags());
    return () => {
      dispatch(clearError()); // Clear errors on unmount
    };
  }, [dispatch]);

  // Refresh tags after create, update, or delete
  useEffect(() => {
    if (
      !loadingStates.tagCreate &&
      !loadingStates.tagUpdate &&
      !loadingStates.tagDelete
    ) {
      dispatch(getTags());
    }
  }, [
    loadingStates.tagCreate,
    loadingStates.tagUpdate,
    loadingStates.tagDelete,
    dispatch,
  ]);

  // Filter tags based on search
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete action
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      dispatch(deleteTag(id));
    }
  };

  // Handle form submission for creating/updating tag
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Tag name is required");
      return;
    }
    setFormError("");

    const tagData = { name: formData.name };

    if (isEdit) {
      dispatch(updateTag({ id: formData.id, tagData }));
    } else {
      dispatch(createTag(tagData));
    }
    // Modal will close after successful operation via useEffect
  };

  const openModal = (item = null) => {
    if (item) {
      setIsEdit(true);
      setFormData({ id: item.id, name: item.name });
    } else {
      setIsEdit(false);
      setFormData({ name: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError("");
    setFormData({ name: "" });
    dispatch(clearError());
  };

  // Close modal after successful create or update
  useEffect(() => {
    if (
      (isEdit && !loadingStates.tagUpdate && !error) ||
      (!isEdit && !loadingStates.tagCreate && !error)
    ) {
      closeModal();
    }
  }, [loadingStates.tagUpdate, loadingStates.tagCreate, error, isEdit]);

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-lg border-0">
        <div className="rounded-t bg-white mb-0 px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="mb-4 lg:mb-0">
              <h6 className="text-blueGray-700 text-2xl font-bold">
                Tag Management
              </h6>
              <p className="text-blueGray-600 text-sm mt-2">
                Manage system tags. Create, edit, and delete tags to organize
                content.
              </p>
            </div>
            <Restricted permission={"TAG_CREATE"}>
              <button
                className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                type="button"
                onClick={() => openModal()}
                disabled={loadingStates.tagCreate || loadingStates.tagUpdate}
              >
                Add New Tag
              </button>
            </Restricted>
          </div>
        </div>

        <Restricted permission={"TAG_READ"}>
          <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Loading Indicator */}
            {loadingStates.tags && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lightBlue-500 mx-auto"></div>
                <p>Loading tags...</p>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative w-full mb-6">
              <input
                type="text"
                placeholder="Search tags by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow
        focus:outline-none focus:ring w-full pr-10 ease-linear transition-all duration-150"
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

            {/* Tags Table */}
            <div className="block w-full overflow-x-auto">
              <table className="items-center w-full bg-transparent border-collapse">
                <thead>
                  <tr>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Tag Name
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {!loadingStates.tags && filteredTags.length > 0 ? (
                    filteredTags.map((tag, index) => (
                      <tr
                        key={tag.id}
                        className={
                          index % 2 === 0 ? "bg-white" : "bg-blueGray-50"
                        }
                      >
                        <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-lightBlue-500 rounded-full flex items-center justify-center mr-4">
                              <span className="text-white font-semibold text-sm">
                                {tag.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold text-blueGray-600 text-sm">
                                {tag.name}
                              </span>
                              <br />
                              <span className="text-xs text-blueGray-500">
                                System Tag
                              </span>
                            </div>
                          </div>
                        </th>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                          <div className="flex justify-end space-x-3">
                            <Restricted permission={"TAG_UPDATE"}>
                              <button
                                className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150 mr-2"
                                onClick={() => openModal(tag)}
                                disabled={loadingStates.tagUpdate}
                              >
                                Edit
                              </button>
                            </Restricted>
                            <Restricted permission={"TAG_DELETE"}>
                              <button
                                className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                                onClick={() => handleDelete(tag.id)}
                                disabled={loadingStates.tagDelete}
                              >
                                Delete
                              </button>
                            </Restricted>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : !loadingStates.tags ? (
                    <tr>
                      <td
                        colSpan={2}
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
                              Ever
                              strokeWidth={1}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          No tags found. Create your first tag to get started.
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </Restricted>
      </div>

      {/* Modal */}
      <Restricted permissions={["TAG_READ", "TAG_CREATE", "TAG_UPDATE"]}>
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
              className="w-80 flex flex-col shadow-2xl rounded-lg bg-white border-0 max-h-[70vh] overflow-hidden"
              style={{ width: "50rem", minWidth: "20rem", maxWidth: "50rem" }}
            >
              <div className="rounded-t bg-white mb-0 px-6 py-6 border-b border-blueGray-200 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h6 className="text-blueGray-700 text-xl font-bold">
                    {isEdit ? "Edit Tag" : "Create New Tag"}
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
                      Tag Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm
                    shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Enter tag name"
                      disabled={
                        loadingStates.tagCreate || loadingStates.tagUpdate
                      }
                    />
                    {formError && (
                      <p className="text-red-500 text-xs mt-2">{formError}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 mt-4 border-black-200 flex-shrink-0">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="bg-blueGray-500 text-black active:bg-blueGray-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                      disabled={
                        loadingStates.tagCreate || loadingStates.tagUpdate
                      }
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        !formData.name.trim() ||
                        loadingStates.tagCreate ||
                        loadingStates.tagUpdate
                      }
                      className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ease-linear transition-all duration-150"
                    >
                      {isEdit ? "Update Tag" : "Create Tag"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </Restricted>
    </>
  );
}