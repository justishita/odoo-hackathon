import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Search, Plus, Edit2, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

const DepartmentTab = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [head, setHead] = useState('');
  const [parentDepartment, setParentDepartment] = useState('');
  const [status, setStatus] = useState('Active');
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/departments');
      if (res.data?.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch departments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/users?limit=200');
      if (res.data?.success) {
        setUsers(res.data.data.users || []);
      }
    } catch (err) {
      console.warn('Failed to load user list for department head dropdown:', err);
    }
  };

  const handleOpenModal = (dept = null) => {
    setFormError('');
    if (dept) {
      setEditingDept(dept);
      setName(dept.name);
      setHead(dept.head?._id || '');
      setParentDepartment(dept.parentDepartment?._id || '');
      setStatus(dept.status);
    } else {
      setEditingDept(null);
      setName('');
      setHead('');
      setParentDepartment('');
      setStatus('Active');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitLoading(true);

    if (!name.trim()) {
      setFormError('Department name is required');
      setSubmitLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      head: head || null,
      parentDepartment: parentDepartment || null,
      status,
    };

    try {
      let res;
      if (editingDept) {
        res = await axiosInstance.put(`/departments/${editingDept._id}`, payload);
      } else {
        res = await axiosInstance.post('/departments', payload);
      }

      if (res.data?.success) {
        fetchDepartments();
        handleCloseModal();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred while saving department');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this department?')) return;
    try {
      const res = await axiosInstance.delete(`/departments/${id}`);
      if (res.data?.success) {
        fetchDepartments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate department');
    }
  };

  // Helper to construct indented tree hierarchy for display
  const buildDepartmentTree = () => {
    // Filter departments by search / status
    let filtered = departments.filter((d) => {
      const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter ? d.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });

    // If active search or filter, show flat representation
    if (search || statusFilter) {
      return filtered.map((d) => ({ ...d, depth: 0 }));
    }

    // Build hierarchical tree
    const map = {};
    departments.forEach((d) => {
      map[d._id] = { ...d, children: [], depth: 0 };
    });

    const roots = [];
    departments.forEach((d) => {
      const mapped = map[d._id];
      if (d.parentDepartment?._id && map[d.parentDepartment._id]) {
        map[d.parentDepartment._id].children.push(mapped);
      } else {
        roots.push(mapped);
      }
    });

    // Flatten tree back with calculated depth levels
    const result = [];
    const traverse = (node, currentDepth) => {
      node.depth = currentDepth;
      result.push(node);
      node.children.forEach((child) => traverse(child, currentDepth + 1));
    };

    roots.forEach((root) => traverse(root, 0));
    return result;
  };

  const deptTree = buildDepartmentTree();

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Department</span>
        </button>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl">
          {error}
        </div>
      )}

      {/* Departments Table */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading departments...</div>
        ) : deptTree.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No departments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/55">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Department Head
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Parent Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                {deptTree.map((dept) => (
                  <tr key={dept._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span
                        className="inline-block"
                        style={{ paddingLeft: `${dept.depth * 20}px` }}
                      >
                        {dept.depth > 0 && <span className="text-slate-400 mr-2">└─</span>}
                        {dept.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {dept.head ? dept.head.name : <span className="text-slate-400 italic">Not Assigned</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {dept.parentDepartment ? dept.parentDepartment.name : <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          dept.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50'
                        }`}
                      >
                        {dept.status === 'Active' ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>{dept.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button
                        onClick={() => handleOpenModal(dept)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      {dept.status === 'Active' && (
                        <button
                          onClick={() => handleDeactivate(dept._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span>Deactivate</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingDept ? 'Edit Department' : 'Create Department'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 p-1.5 rounded-lg"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50 rounded-lg">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Engineering, Sales, HR"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Department Head
                </label>
                <select
                  value={head}
                  onChange={(e) => setHead(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Department Head (Optional)</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Parent Department
                </label>
                <select
                  value={parentDepartment}
                  onChange={(e) => setParentDepartment(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">None (Top Level)</option>
                  {departments
                    .filter((d) => !editingDept || d._id !== editingDept._id) // Remove self
                    .map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
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

export default DepartmentTab;
