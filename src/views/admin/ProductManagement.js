import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setSelectedProduct,
  clearSelectedProduct,
  setFilters,
  clearFilters,
  clearError,
} from "../../app/features/products/productSlice";
import {
  getCategories,
  setSelectedCategory,
  clearSelectedCategory,
} from "../../app/features/categories/categorySlice";
import {
  getTags,
  setSelectedTag,
  clearSelectedTag,
} from "../../app/features/tags/tagSlice";
import Restricted from "components/Restricted";

export default function ProductManagement() {
  const dispatch = useDispatch();

  // Redux state selectors
  const {
    products,
    selectedProduct,
    filters,
    loadingStates,
    error: productError,
  } = useSelector((state) => state.products);
  const {
    categories,
    loadingStates: categoryLoading,
    error: categoryError,
  } = useSelector((state) => state.categories);
  const {
    tags,
    loadingStates: tagLoading,
    error: tagError,
  } = useSelector((state) => state.tags);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    price: "",
    quantity: "",
    discount: "",
    color: "",
    sku: "",
    categoryIds: [],
    tagIds: [],
    images: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [showFilterCategoryDropdown, setShowFilterCategoryDropdown] =
    useState(false);
  const [showFilterTagDropdown, setShowFilterTagDropdown] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef(null);
  const dropdownRefs = useRef({
    category: null,
    tag: null,
    filterCategory: null,
    filterTag: null,
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getProducts(filters));
    dispatch(getCategories());
    dispatch(getTags());
  }, [dispatch]);

  // Update products when filters change
  useEffect(() => {
    dispatch(getProducts(filters));
  }, [filters, dispatch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRefs.current.category &&
        !dropdownRefs.current.category.contains(event.target) &&
        dropdownRefs.current.tag &&
        !dropdownRefs.current.tag.contains(event.target) &&
        dropdownRefs.current.filterCategory &&
        !dropdownRefs.current.filterCategory.contains(event.target) &&
        dropdownRefs.current.filterTag &&
        !dropdownRefs.current.filterTag.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
        setShowTagDropdown(false);
        setShowFilterCategoryDropdown(false);
        setShowFilterTagDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter products locally for search term
  const filteredProducts =
    products?.filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    }) || [];

  // Filter categories and tags for dropdowns
  const filteredCategories =
    categories?.filter((cat) =>
      cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    ) || [];

  const filteredTags =
    tags?.filter((tag) =>
      tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
    ) || [];

  // Get selected categories and tags for display
  const getSelectedCategories = () => {
    return (
      categories?.filter((cat) => formData.categoryIds.includes(cat.id)) || []
    );
  };

  const getSelectedTags = () => {
    return tags?.filter((tag) => formData.tagIds.includes(tag.id)) || [];
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity < 0) {
      errors.quantity = "Quantity must be 0 or greater";
    }

    const discount = parseFloat(formData.discount);
    if (!isNaN(discount) && discount < 0) {
      errors.discount = "Discount must be 0 or greater";
    }

    if (!formData.color.trim()) {
      errors.color = "Color is required";
    }

    if (!formData.sku.trim()) {
      errors.sku = "SKU is required";
    }

    if (formData.categoryIds.length === 0) {
      errors.categoryIds = "At least one category must be selected";
    }

    if (formData.images.length === 0) {
      errors.images = "At least one image must be uploaded";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handleFilterCategoryToggle = (catId) => {
    dispatch(
      setFilters({
        categoryIds: filters.categoryIds.includes(catId)
          ? filters.categoryIds.filter((id) => id !== catId)
          : [...filters.categoryIds, catId],
      })
    );
  };

  const handleFilterTagToggle = (tagId) => {
    dispatch(
      setFilters({
        tagIds: filters.tagIds.includes(tagId)
          ? filters.tagIds.filter((id) => id !== tagId)
          : [...filters.tagIds, tagId],
      })
    );
  };

  // Handle category/tag selection for form
  const handleCategoryToggle = (catId) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(catId)
        ? prev.categoryIds.filter((id) => id !== catId)
        : [...prev.categoryIds, catId],
    }));
    setTouched((prev) => ({ ...prev, categoryIds: true }));
    if (formErrors.categoryIds) {
      setFormErrors((prev) => ({ ...prev, categoryIds: "" }));
    }
  };

  const handleTagToggle = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
    setTouched((prev) => ({ ...prev, tagIds: true }));
  };

  // Image handling
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, { url, file }],
        }));
      }
    });
    fileInputRef.current.value = "";
  };

  const handleDropZoneDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDropZoneDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDropZoneDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, { url, file }],
        }));
      }
    });
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (dragIndex === dropIndex) return;
    setFormData((prev) => {
      const newImages = [...prev.images];
      const [dragged] = newImages.splice(dragIndex, 1);
      newImages.splice(dropIndex, 0, dragged);
      return { ...prev, images: newImages };
    });
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const img = prev.images[index];
      if (img.file) {
        URL.revokeObjectURL(img.url);
      }
      const newImages = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: newImages };
    });
    if (touched.images && formData.images.length <= 1) {
      setFormErrors((prev) => ({
        ...prev,
        images: "At least one image must be uploaded",
      }));
    }
  };

  // Image carousel navigation
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? formData.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === formData.images.length - 1 ? 0 : prev + 1
    );
  };

  // Handle delete product
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === "view") return;

    setTouched({
      name: true,
      description: true,
      price: true,
      quantity: true,
      discount: true,
      color: true,
      sku: true,
      categoryIds: true,
      images: true,
    });

    if (!validateForm()) {
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      availableQuantity: parseInt(formData.quantity),
      discount: parseFloat(formData.discount) || 0,
      color: formData.color,
      sku: formData.sku,
      categoryIds: formData.categoryIds,
      tagIds: formData.tagIds,
    };

    const images = formData.images.map((img) => img.file).filter(Boolean);

    if (modalMode === "create") {
      dispatch(createProduct({ productData, images }));
    } else {
      dispatch(updateProduct({ id: formData.id, productData, images }));
    }

    closeModal();
  };

  const openModal = (product = null, mode = "create") => {
    if (mode === "view" || mode === "edit") {
      dispatch(setSelectedProduct(product));
      setFormData({
        id: product.id,
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        quantity: product.quantity || "",
        discount: product.discount || "",
        color: product.color || "",
        sku: product.sku || "",
        categoryIds: product.categoryIds || [],
        tagIds: product.tagIds || [],
        images: product.imageUrls.map((url) => ({ url, file: null })),
      });
      setCurrentImageIndex(0);
      setModalMode(mode);
    } else {
      setFormData({
        id: null,
        name: "",
        description: "",
        price: "",
        quantity: "",
        discount: "",
        color: "",
        sku: "",
        categoryIds: [],
        tagIds: [],
        images: [],
      });
      setModalMode("create");
    }
    setFormErrors({});
    setTouched({});
    setCategorySearchTerm("");
    setShowCategoryDropdown(false);
    setTagSearchTerm("");
    setShowTagDropdown(false);
    setShowModal(true);
  };

  const closeModal = () => {
    formData.images.forEach((img) => {
      if (img.file) {
        URL.revokeObjectURL(img.url);
      }
    });
    setShowModal(false);
    dispatch(clearSelectedProduct());
    dispatch(clearError());
  };

  const handleInputChange = (field, value) => {
    if (modalMode === "view") return;

    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    const errors = {};
    const price = parseFloat(value);
    const quantity = parseInt(value);

    if (field === "name" && !value.trim()) {
      errors.name = "Name is required";
    }
    if (field === "description" && !value.trim()) {
      errors.description = "Description is required";
    }
    if (field === "price") {
      if (isNaN(price) || price <= 0) {
        errors.price = "Price must be greater than 0";
      }
    }
    if (field === "quantity") {
      if (isNaN(quantity) || quantity < 0) {
        errors.quantity = "Quantity must be 0 or greater";
      }
    }
    if (field === "discount") {
      const disc = parseFloat(value);
      if (!isNaN(disc) && disc < 0) {
        errors.discount = "Discount must be 0 or greater";
      }
    }
    if (field === "color" && !value.trim()) {
      errors.color = "Color is required";
    }
    if (field === "sku" && !value.trim()) {
      errors.sku = "SKU is required";
    }

    setFormErrors((prev) => ({
      ...prev,
      [field]: errors[field] || "",
    }));
  };

  const getCategoryChips = (catIds) => {
    return (
      categories
        ?.filter((cat) => catIds.includes(cat.id))
        ?.map((cat) => (
          <span
            key={cat.id}
            className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded font-medium"
          >
            {cat.name}
          </span>
        )) || []
    );
  };

  const getTagChips = (tagIds) => {
    return (
      tags
        ?.filter((tag) => tagIds.includes(tag.id))
        ?.map((tag) => (
          <span
            key={tag.id}
            className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded font-medium"
          >
            {tag.name}
          </span>
        )) || []
    );
  };

  const getFinalPrice = () => {
    const price = parseFloat(formData.price);
    const discount = parseFloat(formData.discount) || 0;
    return (price * (1 - discount / 100)).toFixed(2);
  };

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-lg border-0">
        <div className="rounded-t bg-white mb-0 px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="mb-4 lg:mb-0">
              <h6 className="text-blueGray-700 text-2xl font-bold">
                Product Management
              </h6>
              <p className="text-blueGray-600 text-sm mt-2">
                Manage system products and their details. Create, edit, and
                delete product entries.
              </p>
            </div>
            <Restricted permission={"PRODUCT_CREATE"}>
              <button
                className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                type="button"
                onClick={() => openModal(null, "create")}
              >
                Add New Product
              </button>
            </Restricted>
          </div>
        </div>

        <Restricted permission={"PRODUCT_READ"}>
          <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
            {/* Error Display */}
            {(productError || categoryError || tagError) && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                {productError || categoryError || tagError}
              </div>
            )}

            {/* Loading Indicator */}
            {loadingStates.products && (
              <div className="text-center py-8 text-blueGray-500">
                Loading products...
              </div>
            )}

            {/* Filters Section */}
            <div className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm relative z-10">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                    />
                  </svg>
                  <h6 className="text-gray-700 font-semibold">Filters</h6>
                  {(filters.minPrice ||
                    filters.maxPrice ||
                    filters.period ||
                    filters.specialOffers ||
                    filters.bestsellers ||
                    filters.categoryIds.length > 0 ||
                    filters.tagIds.length > 0) && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <button
                  onClick={() => dispatch(clearFilters())}
                  className="text-sm text-gray-500 hover:text-red-500 focus:text-red-500 focus:outline-none
                transition-colors duration-200"
                >
                  Clear All
                </button>
              </div>

              <div className="p-4 relative z-20">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 min-w-fit">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={filters.minPrice || ""}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                      placeholder="Min"
                      className="w-16 bg-transparent border-0 text-sm focus:outline-none placeholder-gray-400"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={filters.maxPrice || ""}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                      placeholder="Max"
                      className="w-16 bg-transparent border-0 text-sm focus:outline-none placeholder-gray-400"
                    />
                  </div>
                  <div className="relative z-30">
                    <select
                      value={filters.period || ""}
                      onChange={(e) =>
                        handleFilterChange("period", e.target.value)
                      }
                      style={{
                        border: "1px solid #e5e7eb", // gray-200
                        backgroundColor: "#f9fafb", // gray-50
                        borderRadius: "0.5rem", // rounded-lg
                        padding: "1rem 0.75rem", // same as py-2 px-3
                        fontSize: "0.875rem", // text-sm
                        cursor: "pointer",
                      }}
                      className="appearance-none focus:outline-none transition-colors duration-200"
                    >
                      <option value="">📅 All Time</option>
                      <option value="week">📅 Last Week</option>
                      <option value="month">📅 Last Month</option>
                      <option value="year">📅 Last Year</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleFilterChange(
                          "specialOffers",
                          !filters.specialOffers
                        )
                      }
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        duration-200 ${
                          filters.specialOffers
                            ? "bg-orange-100 text-orange-700 border border-orange-200"
                            : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-orange-50 hover:border-orange-200"
                        }`}
                    >
                      🎁 Special Offers
                    </button>
                    <button
                      onClick={() =>
                        handleFilterChange("bestsellers", !filters.bestsellers)
                      }
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        duration-200 ${
                          filters.bestsellers
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-green-50 hover:border-green-200"
                        }`}
                    >
                      🔥 Bestsellers
                    </button>
                  </div>

                  <div
                    className="relative z-40"
                    ref={(el) => (dropdownRefs.current.filterCategory = el)}
                  >
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 min-w-48 hover:bg-white hover:border-gray-300 transition-colors duration-200">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <input
                        type="text"
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        onFocus={() => setShowFilterCategoryDropdown(true)}
                        placeholder="Search categories..."
                        className="flex-1 bg-transparent border-0 text-sm focus:outline-none placeholder-gray-400"
                      />
                      {filters.categoryIds.length > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                          {filters.categoryIds.length}
                        </span>
                      )}
                    </div>
                    {showFilterCategoryDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((cat) => (
                            <div
                              key={cat.id}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                              onClick={() => {
                                handleFilterCategoryToggle(cat.id);
                                setCategorySearchTerm("");
                                setShowFilterCategoryDropdown(false);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">
                                  {cat.name}
                                </span>
                                {filters.categoryIds.includes(cat.id) && (
                                  <svg
                                    className="w-4 h-4 text-blue-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    width={25}
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
                          <div className="px-3 py-4 text-center text-gray-500 text-sm">
                            No categories found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className="relative z-40"
                    ref={(el) => (dropdownRefs.current.filterTag = el)}
                  >
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 min-w-48 hover:bg-white hover:border-gray-300 transition-colors duration-200">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      <input
                        type="text"
                        value={tagSearchTerm}
                        onChange={(e) => setTagSearchTerm(e.target.value)}
                        onFocus={() => setShowFilterTagDropdown(true)}
                        placeholder="Search tags..."
                        className="flex-1 bg-transparent border-0 text-sm focus:outline-none placeholder-gray-400"
                      />
                      {filters.tagIds.length > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
                          {filters.tagIds.length}
                        </span>
                      )}
                    </div>
                    {showFilterTagDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredTags.length > 0 ? (
                          filteredTags.map((tag) => (
                            <div
                              key={tag.id}
                              className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                              onClick={() => {
                                handleFilterTagToggle(tag.id);
                                setTagSearchTerm("");
                                setShowFilterTagDropdown(false);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">
                                  {tag.name}
                                </span>
                                {filters.tagIds.includes(tag.id) && (
                                  <svg
                                    className="w-4 h-4 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    width={25}
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
                          <div className="px-3 py-4 text-center text-gray-500 text-sm">
                            No tags found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {(filters.categoryIds.length > 0 ||
                  filters.tagIds.length > 0) && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                    {categories
                      ?.filter((cat) => filters.categoryIds.includes(cat.id))
                      .map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                        >
                          📁 {cat.name}
                          <button
                            type="button"
                            onClick={() => handleFilterCategoryToggle(cat.id)}
                            className="text-blue-500 hover:text-blue-700 focus:outline-none ml-1 hover:bg-blue-200
                        rounded-full w-4 h-4 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                    {tags
                      ?.filter((tag) => filters.tagIds.includes(tag.id))
                      .map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full"
                        >
                          🏷️ {tag.name}
                          <button
                            type="button"
                            onClick={() => handleFilterTagToggle(tag.id)}
                            className="text-green-500 hover:text-green-700 focus:outline-none ml-1 hover:bg-green-200
                        rounded-full w-4 h-4 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full mb-6 z-0">
              <input
                type="text"
                placeholder="Search products by name, SKU, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow
        focus:outline-none focus:ring-2 focus:ring-blue-500 w-full pr-10 ease-linear transition-all duration-150"
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

            {/* Products Table */}
            <div className="block w-full overflow-x-auto">
              <table className="items-center w-full bg-transparent border-collapse">
                <thead>
                  <tr>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Product Details
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Pricing & Stock
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Categories & Tags
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                      <tr
                        key={product.id}
                        className={`cursor-pointer hover:bg-blueGray-50 transition-colors duration-150 ${
                          index % 2 === 0 ? "bg-white" : "bg-blueGray-50"
                        }`}
                        onClick={() => openModal(product, "view")}
                      >
                        <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-lightBlue-500 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                              {product.imageUrls[0] ? (
                                <img
                                  src={product.imageUrls[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-semibold text-sm">
                                  {product.name?.charAt(0) || "P"}
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-blueGray-600 text-sm">
                                {product.name}
                              </span>
                              <br />
                              <span className="text-xs text-blueGray-500">
                                SKU: {product.sku}
                              </span>
                            </div>
                          </div>
                        </th>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <div>
                            <div className="mb-1">
                              <span className="text-blueGray-600 font-medium">
                                ${product.price}
                                {product.discount > 0 && (
                                  <span className="text-red-500 ml-1">
                                    -{product.discount}%
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="mb-1">
                              <span className="text-blueGray-500">
                                Stock: {product.quantity}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                          <div className="flex flex-wrap gap-1">
                            <div className="flex flex-wrap gap-1 mb-1">
                              {getCategoryChips(product.categoryIds)}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {getTagChips(product.tagIds)}
                            </div>
                            {product.categoryIds.length === 0 &&
                              product.tagIds.length === 0 && (
                                <span className="text-blueGray-400 text-xs">
                                  No categories or tags
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                          <div className="flex justify-end space-x-3">
                            <Restricted permission={"PRODUCT_UPDATE"}>
                              <button
                                className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150 mr-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal(product, "edit");
                                }}
                              >
                                Edit
                              </button>
                            </Restricted>
                            <Restricted permission={"PRODUCT_DELETE"}>
                              <button
                                className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(product.id);
                                }}
                              >
                                Delete
                              </button>
                            </Restricted>
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
                          No products found. Create your first product to get
                          started.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Restricted>
      </div>

      {/* Modal */}
      <Restricted
        permissions={["PRODUCT_READ", "PRODUCT_CREATE", "PRODUCT_UPDATE"]}
      >
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
                width: modalMode === "view" ? "80rem" : "60rem",
                minWidth: "20rem",
                maxWidth: "90vw",
                maxHeight: "90vh",
              }}
            >
              <div className="rounded-t bg-white mb-0 px-6 py-6 border-b border-blueGray-200 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h6 className="text-blueGray-700 text-xl font-bold">
                    {modalMode === "view"
                      ? formData.name
                      : modalMode === "create"
                      ? "Create New Product"
                      : "Edit Product"}
                  </h6>
                  <div className="flex space-x-3">
                    {modalMode === "view" && (
                      <button
                        className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                        onClick={() => setModalMode("edit")}
                      >
                        Edit Product
                      </button>
                    )}
                    <button
                      className="text-blueGray-400 hover:text-blueGray-600 text-xl font-bold outline-none focus:outline-none"
                      onClick={closeModal}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-auto px-6 py-6 max-h-[70vh] overflow-y-auto bg-white rounded-lg">
                {modalMode === "view" ? (
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/2">
                      {formData.images.length > 0 ? (
                        <div className="relative">
                          <img
                            src={formData.images[currentImageIndex]?.url}
                            alt={formData.name}
                            className="w-full h-96 object-contain rounded-lg"
                          />
                          {formData.images.length > 1 && (
                            <>
                              <button
                                onClick={handlePrevImage}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                              >
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={handleNextImage}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                              >
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                              <div className="flex justify-center mt-4 gap-2">
                                {formData.images.map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full ${
                                      index === currentImageIndex
                                        ? "bg-lightBlue-500"
                                        : "bg-blueGray-300"
                                    }`}
                                    onClick={() => setCurrentImageIndex(index)}
                                  ></div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-96 bg-blueGray-100 rounded-lg flex items-center justify-center">
                          <span className="text-blueGray-500 text-lg">
                            No images available
                          </span>
                        </div>
                      )}
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {formData.images.map((img, index) => (
                          <img
                            key={index}
                            src={img.url}
                            alt={`Thumbnail ${index + 1}`}
                            className={`w-full h-20
                            object-cover rounded cursor-pointer ${
                              index === currentImageIndex
                                ? "border-2 border-lightBlue-500"
                                : ""
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="lg:w-1/2">
                      <h2 className="text-3xl font-bold text-blueGray-800 mb-4">
                        {formData.name}
                      </h2>
                      <div className="flex items-center mb-4">
                        <span className="text-2xl font-semibold text-blueGray-700">
                          ${getFinalPrice()}
                        </span>
                        {formData.discount > 0 && (
                          <span className="ml-4 text-lg text-blueGray-500 line-through">
                            ${parseFloat(formData.price).toFixed(2)}
                          </span>
                        )}
                        {formData.discount > 0 && (
                          <span className="ml-4 bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                            {formData.discount}% OFF
                          </span>
                        )}
                      </div>
                      <p className="text-blueGray-600 mb-4">
                        {formData.description}
                      </p>
                      <div className="mb-4">
                        <span className="font-semibold text-blueGray-700">
                          Availability:
                        </span>
                        <span className="ml-2 text-blueGray-600">
                          {formData.quantity > 0
                            ? `In Stock (${formData.quantity})`
                            : "Out of Stock"}
                        </span>
                      </div>
                      <div className="mb-4">
                        <span className="font-semibold text-blueGray-700">
                          Color:
                        </span>
                        <span className="ml-2 text-blueGray-600">
                          {formData.color}
                        </span>
                      </div>
                      <div className="mb-4">
                        <span className="font-semibold text-blueGray-700">
                          SKU:
                        </span>
                        <span className="ml-2 text-blueGray-600">
                          {formData.sku}
                        </span>
                      </div>
                      <div className="mb-4">
                        <span className="font-semibold text-blueGray-700">
                          Categories:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {getCategoryChips(formData.categoryIds)}
                          {formData.categoryIds.length === 0 && (
                            <span className="text-blueGray-500">None</span>
                          )}
                        </div>
                      </div>
                      <div className="mb-4">
                        <span className="font-semibold text-blueGray-700">
                          Tags:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {getTagChips(formData.tagIds)}
                          {formData.tagIds.length === 0 && (
                            <span className="text-blueGray-500">None</span>
                          )}
                        </div>
                      </div>
                      <div className="mb-4">
                        <span className="font-semibold text-blueGray-700">
                          Last Updated:
                        </span>
                        <span className="ml-2 text-blueGray-600">
                          {new Date(formData.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                      <h6 className="text-blueGray-600 text-sm mb-4 font-bold uppercase">
                        Product Information
                      </h6>
                      <div className="flex flex-row gap-4 mb-4">
                        <div className="w-full">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded
                            text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150
                            ${
                              touched.name && formErrors.name
                                ? "border-2 border-red-500"
                                : ""
                            }`}
                            placeholder="Enter product name"
                          />
                          {touched.name && formErrors.name && (
                            <p className="text-red-500 text-xs mt-2">
                              {formErrors.name}
                            </p>
                          )}
                        </div>
                        <div className="w-full">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                            SKU *
                          </label>
                          <input
                            type="text"
                            value={formData.sku}
                            onChange={(e) =>
                              handleInputChange("sku", e.target.value)
                            }
                            className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded
                            text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150
                            ${
                              touched.sku && formErrors.sku
                                ? "border-2 border-red-500"
                                : ""
                            }`}
                            placeholder="Enter SKU"
                          />
                          {touched.sku && formErrors.sku && (
                            <p className="text-red-500 text-xs mt-2">
                              {formErrors.sku}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-full mb-4">
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                          Description *
                        </label>
                        <textarea
                          rows={3}
                          value={formData.description}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                            touched.description && formErrors.description
                              ? "border-2 border-red-500"
                              : ""
                          }`}
                          placeholder="Enter product description"
                        />
                        {touched.description && formErrors.description && (
                          <p className="text-red-500 text-xs mt-2">
                            {formErrors.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-row gap-4 mb-4">
                        <div className="w-full">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                            Color *
                          </label>
                          <input
                            type="text"
                            value={formData.color}
                            onChange={(e) =>
                              handleInputChange("color", e.target.value)
                            }
                            className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                              touched.color && formErrors.color
                                ? "border-2 border-red-500"
                                : ""
                            }`}
                            placeholder="Enter color"
                          />
                          {touched.color && formErrors.color && (
                            <p className="text-red-500 text-xs mt-2">
                              {formErrors.color}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h6 className="text-blueGray-600 text-sm mb-4 font-bold uppercase">
                        Pricing & Stock
                      </h6>
                      <div className="flex flex-row gap-4 mb-4">
                        <div className="w-1/3">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                            Price * ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) =>
                              handleInputChange("price", e.target.value)
                            }
                            className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                              touched.price && formErrors.price
                                ? "border-2 border-red-500"
                                : ""
                            }`}
                            placeholder="0.00"
                          />
                          {touched.price && formErrors.price && (
                            <p className="text-red-500 text-xs mt-2">
                              {formErrors.price}
                            </p>
                          )}
                        </div>
                        <div className="w-1/3">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                            Discount (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.discount}
                            onChange={(e) =>
                              handleInputChange("discount", e.target.value)
                            }
                            className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                              touched.discount && formErrors.discount
                                ? "border-2 border-red-500"
                                : ""
                            }`}
                            placeholder="0"
                          />
                          {touched.discount && formErrors.discount && (
                            <p className="text-red-500 text-xs mt-2">
                              {formErrors.discount}
                            </p>
                          )}
                        </div>
                        <div className="w-1/3">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.quantity}
                            onChange={(e) =>
                              handleInputChange("quantity", e.target.value)
                            }
                            className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                              touched.quantity && formErrors.quantity
                                ? "border-2 border-red-500"
                                : ""
                            }`}
                            placeholder="0"
                          />
                          {touched.quantity && formErrors.quantity && (
                            <p className="text-red-500 text-xs mt-2">
                              {formErrors.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <hr className="my-4 border-b-1 border-blueGray-200" />

                    <div className="mb-4">
                      <h6 className="text-blueGray-600 text-sm mb-3 font-bold uppercase">
                        Categories *
                      </h6>
                      {getSelectedCategories().length > 0 ? (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2">
                            {getSelectedCategories().map((cat) => (
                              <span
                                key={cat.id}
                                className="inline-flex items-center px-3 py-1 text-sm bg-lightBlue-100 text-lightBlue-800 rounded-full"
                              >
                                {cat.name}
                                <button
                                  type="button"
                                  onClick={() => handleCategoryToggle(cat.id)}
                                  className="ml-2 text-lightBlue-600 hover:text-lightBlue-800 focus:outline-none"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-blueGray-500 text-sm mb-3">
                          No categories selected.
                        </p>
                      )}

                      <div
                        className="relative w-full"
                        ref={(el) => (dropdownRefs.current.category = el)}
                      >
                        <input
                          type="text"
                          value={categorySearchTerm}
                          onChange={(e) =>
                            setCategorySearchTerm(e.target.value)
                          }
                          onFocus={() => setShowCategoryDropdown(true)}
                          className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                            touched.categoryIds && formErrors.categoryIds
                              ? "border-2 border-red-500"
                              : ""
                          }`}
                          placeholder="Search and select categories..."
                        />
                        {showCategoryDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-blueGray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                            {filteredCategories.length > 0 ? (
                              filteredCategories.map((cat) => (
                                <div
                                  key={cat.id}
                                  className="px-3 py-2 hover:bg-blueGray-50 cursor-pointer border-b border-blueGray-100 last:border-b-0"
                                  onClick={() => {
                                    handleCategoryToggle(cat.id);
                                    setCategorySearchTerm("");
                                    setShowCategoryDropdown(false);
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blueGray-600">
                                      {cat.name}
                                    </span>
                                    {formData.categoryIds.includes(cat.id) && (
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
                                No categories found
                              </div>
                            )}
                          </div>
                        )}
                        {touched.categoryIds && formErrors.categoryIds && (
                          <p className="text-red-500 text-xs mt-2">
                            {formErrors.categoryIds}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="text-blueGray-600 text-sm mb-3 font-bold uppercase">
                        Tags
                      </h6>
                      {getSelectedTags().length > 0 ? (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2">
                            {getSelectedTags().map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full"
                              >
                                {tag.name}
                                <button
                                  type="button"
                                  onClick={() => handleTagToggle(tag.id)}
                                  className="ml-2 text-green-600 hover:text-green-800 focus:outline-none"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-blueGray-500 text-sm mb-3">
                          No tags selected.
                        </p>
                      )}

                      <div
                        className="relative w-full"
                        ref={(el) => (dropdownRefs.current.tag = el)}
                      >
                        <input
                          type="text"
                          value={tagSearchTerm}
                          onChange={(e) => setTagSearchTerm(e.target.value)}
                          onFocus={() => setShowTagDropdown(true)}
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          placeholder="Search and select tags..."
                        />
                        {showTagDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-blueGray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                            {filteredTags.length > 0 ? (
                              filteredTags.map((tag) => (
                                <div
                                  key={tag.id}
                                  className="px-3 py-2 hover:bg-blueGray-50 cursor-pointer border-b border-blueGray-100 last:border-b-0"
                                  onClick={() => {
                                    handleTagToggle(tag.id);
                                    setTagSearchTerm("");
                                    setShowTagDropdown(false);
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blueGray-600">
                                      {tag.name}
                                    </span>
                                    {formData.tagIds.includes(tag.id) && (
                                      <svg
                                        className="w-4 h-4 text-green-600"
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
                                No tags found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="text-blueGray-600 text-sm mb-3 font-bold uppercase">
                        Images *
                      </h6>
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center ${
                          isDragOver
                            ? "border-blue-300 bg-blue-50"
                            : "border-blueGray-300 bg-blueGray-50"
                        }`}
                        onDragOver={handleDropZoneDragOver}
                        onDragLeave={handleDropZoneDragLeave}
                        onDrop={handleDropZoneDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileSelect}
                          style={{ display: "none" }}
                        />
                        <p className="text-blueGray-500 mb-2">
                          Drop images here or click to select
                        </p>
                        <p className="text-xs text-blueGray-400">
                          Supports multiple images (JPG, PNG, etc.)
                        </p>
                      </div>

                      {formData.images.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">
                            Images ({formData.images.length}) - Drag to reorder
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {formData.images.map((img, index) => (
                              <div
                                key={index}
                                className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-move"
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                              >
                                <img
                                  src={img.url}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(index);
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          {touched.images && formErrors.images && (
                            <p className="text-red-500 text-xs mt-2">
                              {formErrors.images}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 mt-4 border-blueGray-200 flex-shrink-0">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="bg-blueGray-500 text-black active:bg-blueGray-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                        disabled={
                          loadingStates.productCreate ||
                          loadingStates.productUpdate
                        }
                      >
                        {modalMode === "create"
                          ? loadingStates.productCreate
                            ? "Creating..."
                            : "Create Product"
                          : loadingStates.productUpdate
                          ? "Updating..."
                          : "Update Product"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </Restricted>
    </>
  );
}
