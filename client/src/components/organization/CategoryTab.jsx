import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Search, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';

const CategoryTab = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [customFields, setCustomFields] = useState([]);
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/categories');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cat = null) => {
    setFormError('');
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setDescription(cat.description || '');
      setCustomFields(cat.customFields || []);
    } else {
      setEditingCategory(null);
      setName('');
      setDescription('');
      setCustomFields([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  // Custom Field Form Operations
  const handleAddField = () => {
    setCustomFields([...customFields, { label: '', fieldType: 'text' }]);
  };

  const handleRemoveField = (index) => {
    const updated = [...customFields];
    updated.splice(index, 1);
    setCustomFields(updated);
  };

  const handleFieldChange = (index, key, value) => {
    const updated = [...customFields];
    updated[index][key] = value;
    setCustomFields(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitLoading(true);

    if (!name.trim()) {
      setFormError('Category name is required');
      setSubmitLoading(false);
      return;
    }

    // Validate custom fields
    for (let i = 0; i < customFields.length; i++) {
      if (!customFields[i].label.trim()) {
        setFormError(`Custom field #${i + 1} must have a label name`);
        setSubmitLoading(false);
        return;
      }
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      customFields: customFields.map((f) => ({
        label: f.label.trim(),
        fieldType: f.fieldType,
      })),
    };

    try {
      let res;
      if (editingCategory) {
        res = await axiosInstance.put(`/categories/${editingCategory._id}`, payload);
      } else {
        res = await axiosInstance.post('/categories', payload);
      }

      if (res.data?.success) {
        fetchCategories();
        handleCloseModal();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred while saving category');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All assets belonging to this category will lose custom field definitions.')) return;
    try {
      const res = await axiosInstance.delete(`/categories/${id}`);
      if (res.data?.success) {
        fetchCategories();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl">
          {error}
        </div>
      )}

      {/* Grid Layout of Categories */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
          Loading asset categories...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
          No asset categories found.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{cat.name}</h3>
                  <div className="flex space-x-2 shrink-0">
                    <button
                      onClick={() => handleOpenModal(cat)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 h-8">
                  {cat.description || <span className="italic">No description provided</span>}
                </p>

                {/* Custom Fields Preview */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Custom Metadata Fields ({cat.customFields?.length || 0})
                  </span>
                  {cat.customFields && cat.customFields.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {cat.customFields.map((field, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-3xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {field.label}{' '}
                          <span className="text-slate-400 ml-1">({field.fieldType})</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-3xs italic text-slate-400">None defined</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingCategory ? 'Edit Asset Category' : 'Create Asset Category'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 p-1.5 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50 rounded-lg">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g. Laptops, Vehicles, Office Chairs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  rows="3"
                  placeholder="Describe items mapped under this category..."
                />
              </div>

              {/* Dynamic Custom Fields Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Category-Specific Custom Fields
                  </span>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    <span>Add Field</span>
                  </button>
                </div>

                {customFields.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-center border border-dashed border-slate-200 dark:border-slate-800">
                    No custom fields defined yet. Defining custom fields lets you capture specific attributes (like Warranty End Date for laptops, or Engine size for vehicles) during asset registrations.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customFields.map((field, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/55 dark:border-slate-800/60">
                        <input
                          type="text"
                          required
                          value={field.label}
                          onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                          placeholder="Field Label (e.g. Warranty Expiration)"
                          className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                        <select
                          value={field.fieldType}
                          onChange={(e) => handleFieldChange(idx, 'fieldType', e.target.value)}
                          className="px-2 py-1.5 border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(idx)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  {submitLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryTab;
