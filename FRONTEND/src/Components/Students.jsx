import React, { useState } from 'react';
import './Students.css';
import { Plus, Search, Edit2, Trash2, X, User, Book, Mail, ShieldAlert } from 'lucide-react';
import { apiService } from '../api/service';

const Students = ({ students, setStudents }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '',
        rollNo: '',
        className: '',
        email: '',
        gender: 'Male'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState('All');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStudent({ ...newStudent, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newStudent.name && newStudent.rollNo && newStudent.className) {
            try {
                // Prepare exactly what the backend needs (ignoring email/gender since they are dummy for now)
                const payload = {
                    name: newStudent.name,
                    rollNo: newStudent.rollNo,
                    className: newStudent.className,
                    email: newStudent.email
                }
                
                if (isEditing) {
                    const updated = await apiService.updateStudent(editId, payload);
                    setStudents(students.map(s => s._id === editId ? updated : s));
                    setIsEditing(false);
                    setEditId(null);
                } else {
                    const added = await apiService.addStudent(payload);
                    setStudents([...students, added]);
                    
                    if (added.generatedEmail) {
                        alert(`Success! Student Added.\n\nLogin Credentials:\nEmail: ${added.generatedEmail}\nPassword: ${added.generatedPassword}\n\nPlease share these with the student!`);
                    }
                }
                setNewStudent({ name: '', rollNo: '', className: '', email: '', gender: 'Male' });
                setShowAddForm(false);
            } catch (error) {
                alert('Error processing student: ' + error.message);
            }
        }
    };

    const handleEdit = (student) => {
        setNewStudent({ name: student.name, rollNo: student.rollNo, className: student.className, email: '', gender: 'Male' });
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
        setNewStudent({ name: '', rollNo: '', className: '', email: '', gender: 'Male' });
        setIsEditing(false);
        setEditId(null);
        setShowAddForm(false);
    };

    const uniqueClasses = Array.isArray(students) 
        ? [...new Set(students.map(s => s.className))].filter(Boolean)
        : [];

    const filteredStudents = Array.isArray(students) ? students.filter(student => {
        const matchesSearch = (student.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                              (student.rollNo?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesClass = selectedClass === 'All' || student.className === selectedClass;
        return matchesSearch && matchesClass;
    }) : [];

    return (
        <div className="students-container">
            {/* Header Section */}
            <div className="students-header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                     <h1 className="students-title">Student Management</h1>
                     <p className="students-subtitle">{students.length} students enrolled</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                    <Plus size={18} />
                    Add Student
                </button>
            </div>

            {/* Student List Section */}
            <div className="student-list-card card-section" style={{ border: 'none', boxShadow: 'none', padding: '0', background: 'transparent' }}>
                
                {/* Search Bar */}
                <div className="search-filters" style={{ display: 'flex', gap: '15px', marginBottom: '20px', background: 'white', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div className="search-container" style={{ flex: 1, position: 'relative' }}>
                        <Search className="search-icon" size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by name, roll number or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                        />
                    </div>
                    <select 
                        className="class-selector" 
                        style={{ padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', background: 'white', minWidth: '150px' }}
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="All">All Classes</option>
                        {uniqueClasses.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                        ))}
                    </select>
                </div>


                {/* Table wrapper */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{filteredStudents.length} of {students.length} students shown</span>
                    </div>
                    
                    <table className="table student-table">
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc',  }}>
                                <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STUDENT</th>
                                <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ROLL NO.</th>
                                <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CLASS</th>
                                <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EMAIL</th>
                                <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student._id}>
                                        <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>
                                                {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: '500', color: '#1e293b' }}>{student.name}</span>
                                        </td>
                                        <td style={{ color: '#64748b' }}>{student.rollNo}</td>
                                        <td>
                                            <span style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500' }}>{student.className}</span>
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                            {student.email || (student.name.split(' ')[0].toLowerCase() + '@school.edu')}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button className="action-btn edit" onClick={() => handleEdit(student)} title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDelete(student._id)} title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
                                        No students found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Student Modal */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">{isEditing ? 'Edit Student' : 'Add New Student'}</h2>
                            <button className="btn-icon" onClick={handleCancel}>
                                <X size={20} />
                            </button>
                        </div>

                        <form className="modal-form" onSubmit={handleSubmit}>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label className="form-label">Full Name *</label>
                                <div className="input-with-icon">
                                    <User size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control with-icon"
                                        value={newStudent.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Full student name"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label className="form-label">Roll Number *</label>
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
                                    <label className="form-label">Class *</label>
                                    <div className="input-with-icon">
                                        <Book size={18} className="input-icon" />
                                        <input
                                            type="text"
                                            name="className"
                                            className="form-control with-icon"
                                            value={newStudent.className}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Class 10A"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <div className="input-with-icon">
                                        <Mail size={18} className="input-icon" />
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control with-icon"
                                            value={newStudent.email}
                                            onChange={handleInputChange}
                                            placeholder="student@school.edu"
                                        />
                                    </div>
                                </div>
                                {/* Omitted Parent Phone per user request */}
                                <div className="form-group">
                                    <label className="form-label">Gender</label>
                                    <select 
                                        name="gender" 
                                        className="form-control"
                                        value={newStudent.gender}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-actions border-top">
                                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? 'Update Student' : 'Add Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
