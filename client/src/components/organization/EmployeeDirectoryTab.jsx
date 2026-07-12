import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Search, ShieldAlert, Award, ToggleLeft, ToggleRight, Building, CheckCircle, HelpCircle } from 'lucide-react';

const EmployeeDirectoryTab = () => {
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Filters and Pagination
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit states
  const [editingUser, setEditingUser] = useState(null);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [search, roleFilter, statusFilter, deptFilter, page]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
      });
      if (search) params.append('q', search);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (deptFilter) params.append('department', deptFilter);

      const res = await axiosInstance.get(`/users?${params.toString()}`);
      if (res.data?.success) {
        setEmployees(res.data.data.users);
        setTotalPages(res.data.data.pagination.pages);
      }
    } catch (err) {
      setError('Failed to fetch employee directory');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get('/departments');
      if (res.data?.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load departments', err);
    }
  };

  const handleRoleChange = async (userId, targetRole) => {
    if (!window.confirm(`Are you sure you want to change this employee's role to ${targetRole.replace('_', ' ')}?`)) return;

    try {
      const res = await axiosInstance.put(`/users/${userId}/role`, { role: targetRole });
      if (res.data?.success) {
        fetchEmployees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update employee role');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    if (!window.confirm(`Are you sure you want to mark this employee as ${nextStatus}?`)) return;

    try {
      const res = await axiosInstance.put(`/users/${userId}/status`, { status: nextStatus });
      if (res.data?.success) {
        fetchEmployees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle employee status');
    }
  };

  const handleOpenDeptModal = (emp) => {
    setEditingUser(emp);
    setSelectedDeptId(emp.department?._id || '');
    setIsDeptModalOpen(true);
  };

  const handleCloseDeptModal = () => {
    setIsDeptModalOpen(false);
    setEditingUser(null);
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const res = await axiosInstance.put(`/users/${editingUser._id}`, {
        departmentId: selectedDeptId || null,
      });
      if (res.data?.success) {
        fetchEmployees();
        handleCloseDeptModal();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update department assignment');
    } finally {
      setSubmitLoading(false);
    }
  };

  const formattedRole = (role) => {
    if (!role) return '';
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-4 py-2 w-full border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 sm:text-sm focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="employee">Employee</option>
            <option value="department_head">Department Head</option>
            <option value="asset_manager">Asset Manager</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 sm:text-sm focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 sm:text-sm focus:outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl">
          {error}
        </div>
      )}

      {/* Employees Table */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading directory...</div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No employees match this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/55">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Role
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
                {employees.map((emp) => {
                  const isSelf = currentUser && currentUser._id === emp._id;
                  const isAdmin = emp.role === 'admin';
                  return (
                    <tr key={emp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                            {emp.name}
                            {isSelf && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200 text-3xs font-semibold text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                                You
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-slate-500">{emp.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {emp.department ? (
                          <span className="inline-flex items-center space-x-1">
                            <Building className="h-3.5 w-3.5 text-slate-400" />
                            <span>{emp.department.name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {isAdmin || isSelf ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200">
                            {formattedRole(emp.role)}
                          </span>
                        ) : (
                          <select
                            value={emp.role}
                            onChange={(e) => handleRoleChange(emp._id, e.target.value)}
                            className="text-xs px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 focus:outline-none"
                          >
                            <option value="employee">Employee</option>
                            <option value="department_head">Department Head</option>
                            <option value="asset_manager">Asset Manager</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                            emp.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/50'
                          }`}
                        >
                          <span>{emp.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        {!isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenDeptModal(emp)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <Building className="h-3.5 w-3.5" />
                              <span>Assign Dept</span>
                            </button>

                            {!isSelf && (
                              <button
                                onClick={() => handleStatusToggle(emp._id, emp.status)}
                                className={`inline-flex items-center space-x-1 cursor-pointer ${
                                  emp.status === 'Active'
                                    ? 'text-amber-600 hover:text-amber-900'
                                    : 'text-emerald-600 hover:text-emerald-900'
                                }`}
                              >
                                {emp.status === 'Active' ? (
                                  <>
                                    <ToggleRight className="h-4 w-4" />
                                    <span>Suspend</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="h-4 w-4" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Edit Department Assignment Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Assign Department</h3>
              <button
                onClick={handleCloseDeptModal}
                className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 p-1.5 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleDeptSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-3">
                  Select department assignment for{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {editingUser?.name
                  }</span>:
                </p>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="">Unassigned (No Department)</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseDeptModal}
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

export default EmployeeDirectoryTab;
