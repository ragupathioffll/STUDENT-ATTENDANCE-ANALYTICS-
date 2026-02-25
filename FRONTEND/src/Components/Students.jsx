import React, { useState } from 'react';
import './Students.css';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { apiService } from '../api/service';

const Students = ({ students, setStudents }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '',
        rollNo: '',
        className: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStudent({ ...newStudent, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newStudent.name && newStudent.rollNo && newStudent.className) {
            try {
                if (isEditing) {
                    const updated = await apiService.updateStudent(editId, newStudent);
                    setStudents(students.map(s => s._id === editId ? updated : s));
                    setIsEditing(false);
                    setEditId(null);
                } else {
                    const added = await apiService.addStudent(newStudent);
                    setStudents([...students, added]);
                }
                setNewStudent({ name: '', rollNo: '', className: '' });
                setShowAddForm(false);
            } catch (error) {
                alert('Error processing student: ' + error.message);
            }
        }
    };

    const handleEdit = (student) => {
        setNewStudent({ name: student.name, rollNo: student.rollNo, className: student.className });
        setEditId(student._id);
        setIsEditing(true);
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await apiService.deleteStudent(id);
                setStudents(students.filter(student => student._id !== id));
            } catch (error) {
                alert('Error deleting student: ' + error.message);
            }
        }
    };

    const handleCancel = () => {
        setNewStudent({ name: '', rollNo: '', className: '' });
        setIsEditing(false);
        setEditId(null);
        setShowAddForm(false);
    };

    // Filter students based on search query
    const filteredStudents = Array.isArray(students) ? students.filter(student =>
        (student.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (student.rollNo?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    ) : [];

    return (
        <div className="students-container">
            {/* Header Section */}
            <div className="students-header-section">
                <h1 className="students-title">Student Management</h1>
                <p className="students-subtitle">Add, edit, and manage student records</p>
            </div>

            {/* Add Student Section */}
            <div className="add-student-section card-section">
                {!showAddForm ? (
                    <div className="add-student-header">
                        <h2 className="add-student-title">Add New Student</h2>
                        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                            <Plus size={18} />
                            Add Student
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="add-student-header">
                            <h2 className="add-student-title">{isEditing ? 'Edit Student' : 'Add New Student'}</h2>
                            <button className="btn-icon" onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} color="#6b7280" />
                            </button>
                        </div>

                        <form className="add-student-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        value={newStudent.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Alice Johnson"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Roll Number</label>
                                    <input
                                        type="text"
                                        name="rollNo"
                                        className="form-control"
                                        value={newStudent.rollNo}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. 101"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Class</label>
                                    <input
                                        type="text"
                                        name="className"
                                        className="form-control"
                                        value={newStudent.className}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Class 10A"
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? 'Update Student' : 'Save Student'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>

            {/* Student List Section */}
            <div className="student-list-card card-section">
                <div className="list-header">
                    <h3 className="list-title">Student List</h3>
                    <div className="search-container">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <table className="table student-table">
                    <thead>
                        <tr>
                            <th>Roll Number</th>
                            <th>Name</th>
                            <th>Class</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr key={student._id}>
                                    <td style={{ fontWeight: '500', color: '#111827' }}>{student.rollNo}</td>
                                    <td>{student.name}</td>
                                    <td>{student.className}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn edit"
                                                onClick={() => handleEdit(student)}
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDelete(student._id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Students;
