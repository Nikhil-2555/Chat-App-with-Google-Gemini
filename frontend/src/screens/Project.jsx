

import React, { useState, useEffect, useContext } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import * as projectService from '../services/project.service'
import * as userService from '../services/user.service'
import { UserContext } from '../context/user.context'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'

const Project = () => {
    const { projectId } = useParams()
    const location = useLocation()
    const [project, setProject] = useState(location.state?.project || null)
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isChatUserModalOpen, setIsChatUserModalOpen] = useState(false)
    const [users, setUsers] = useState([])
    const [selectedUsers, setSelectedUsers] = useState(new Set())
    const [selectedChatUser, setSelectedChatUser] = useState(null)
    const { user } = useContext(UserContext)
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const messageBox = React.useRef(null)

    useEffect(() => {
        // Only fetch project if projectId is provided
        if (projectId && (!project || !project.users || typeof project.users[0] === 'string')) {
            projectService.getProjectById(projectId).then((data) => {
                setProject(data)
            }).catch(err => {
                console.log(err)
            })
        }

        // Fetch users from API, or use mock users if API fails
        userService.getAllUsers().then((data) => {
            setUsers(data)
        }).catch(err => {
            console.log('Failed to fetch users from API, using mock users:', err)
            // Add mock users for testing when backend is not available
            const mockUsers = [
                {
                    _id: 'user1',
                    email: 'alice@example.com',
                    name: 'Alice Johnson'
                },
                {
                    _id: 'user2',
                    email: 'bob@example.com',
                    name: 'Bob Smith'
                },
                {
                    _id: 'user3',
                    email: 'charlie@example.com',
                    name: 'Charlie Davis'
                }
            ]
            setUsers(mockUsers)
        })
    }, [projectId])

    useEffect(() => {
        if (!projectId) return

        const socket = initializeSocket(projectId)

        sendMessage('join-project', projectId)

        const handleMessage = (data) => {
            console.log("Received message:", data)
            setMessages(prev => [...prev, data])
        }

        receiveMessage('project-message', handleMessage)

        // Cleanup function to remove listeners when component unmounts or projectId changes
        return () => {
            if (socket) {
                socket.off('project-message', handleMessage)
                sendMessage('leave-project', projectId)
            }
        }
    }, [projectId])

    const send = () => {
        if (!message) return

        sendMessage('project-message', {
            message,
            projectId
        })
        setMessage('')
    }

    useEffect(() => {
        if (messageBox.current) {
            messageBox.current.scrollTop = messageBox.current.scrollHeight
        }
    }, [messages])


    const handleUserClick = (userId) => {
        setSelectedUsers((prevSelectedUsers) => {
            const newSelectedUsers = new Set(prevSelectedUsers);
            if (newSelectedUsers.has(userId)) {
                newSelectedUsers.delete(userId);
            } else {
                newSelectedUsers.add(userId);
            }
            return newSelectedUsers;
        });
    }

    const addMembers = () => {
        if (!projectId) {
            // If no projectId, just add users locally for testing
            const selectedUserObjects = users.filter(u => selectedUsers.has(u._id))
            setProject(prev => ({
                ...prev,
                users: [...(prev?.users || []), ...selectedUserObjects]
            }))
            setIsModalOpen(false)
            setSelectedUsers(new Set())
            console.log('Added members locally (no projectId):', selectedUserObjects)
            return
        }

        projectService.addUserToProject(projectId, Array.from(selectedUsers))
            .then((data) => {
                setProject(data.project)
                setIsModalOpen(false)
                setSelectedUsers(new Set())
            })
            .catch(err => {
                console.log('Failed to add members via API, adding locally:', err)
                // Fallback: Add users locally when API fails
                const selectedUserObjects = users.filter(u => selectedUsers.has(u._id))
                setProject(prev => ({
                    ...prev,
                    users: [...(prev?.users || []), ...selectedUserObjects]
                }))
                setIsModalOpen(false)
                setSelectedUsers(new Set())
            })
    }

    const handleChatUserSelect = (userId) => {
        setSelectedChatUser(userId)
        setIsChatUserModalOpen(false)
    }

    return (
        <main className='h-screen w-screen flex flex-col bg-slate-50'>
            {/* Header */}
            <header className='flex justify-between items-center p-4 px-6 bg-white border-b border-slate-200 shadow-sm'>
                <div className='flex items-center gap-4'>
                    <div className='bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-100'>
                        <i className="ri-folder-line text-xl"></i>
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-slate-900 capitalize'>{project?.name}</h1>
                        <div className='flex items-center gap-2 text-xs text-slate-500 font-medium'>
                            <span className='flex items-center gap-1'>
                                <i className="ri-user-line"></i>
                                {project?.users?.length} Members
                            </span>
                            <span className='h-1 w-1 bg-slate-300 rounded-full'></span>
                            <span className='text-blue-600'>Active Now</span>
                        </div>
                    </div>
                </div>

                <div className='flex items-center gap-3'>
                    <button
                        onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                        className='p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-600 active:scale-95'>
                        <i className="ri-group-line text-xl"></i>
                    </button>
                    <button className='p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-600 active:scale-95'>
                        <i className="ri-settings-3-line text-xl"></i>
                    </button>
                </div>
            </header>

            {/* Main Content Area - Split Layout */}
            <div className='flex-1 flex overflow-hidden'>
                {/* Left Side - Chat Interface (40%) */}
                <section className='w-[40%] flex flex-col relative border-r border-slate-300' style={{ backgroundColor: '#d4dae3' }}>
                    {/* Chat Header with User Icon */}
                    <div
                        onClick={() => setIsChatUserModalOpen(true)}
                        className='flex justify-center items-center gap-3 py-4 bg-transparent cursor-pointer hover:bg-white/20 transition-all group'>
                        <div className='bg-white p-3 rounded-full shadow-md group-hover:shadow-lg transition-all'>
                            <i className="ri-group-fill text-2xl text-slate-800"></i>
                        </div>
                        {selectedChatUser && (
                            <div className='bg-white px-4 py-2 rounded-full shadow-md'>
                                <p className='text-sm font-bold text-slate-800'>
                                    {users.find(u => u._id === selectedChatUser)?.username || users.find(u => u._id === selectedChatUser)?.email || 'User'}
                                </p>
                            </div>
                        )}
                        {!selectedChatUser && (
                            <div className='bg-white px-4 py-2 rounded-full shadow-md'>
                                <p className='text-sm font-medium text-slate-500'>
                                    Click to select user
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Messages Area */}
                    <div className='flex-1 px-4 pb-4 overflow-y-auto' ref={messageBox}>
                        <div className='space-y-3'>
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex flex-col ${msg.sender._id === user?._id ? 'items-end' : 'items-start'}`}>
                                    <div className={`rounded-2xl shadow-sm p-3 max-w-[85%] ${msg.sender._id === user?._id ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-slate-800 rounded-tl-sm'}`}>
                                        <p className={`text-xs mb-1 ${msg.sender._id === user?._id ? 'text-blue-200' : 'text-slate-500'}`}>{msg.sender.username || msg.sender.email}</p>
                                        <p className='text-sm'>{msg.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className='px-4 pb-4'>
                        <div className='flex gap-2 items-center'>
                            <div className='flex-1 relative'>
                                <input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    type="text"
                                    placeholder='Enter message'
                                    className='w-full py-2.5 px-3 bg-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-sm text-slate-800 placeholder:text-slate-400'
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            send()
                                        }
                                    }}
                                />
                            </div>
                            <button
                                onClick={send}
                                className='bg-slate-700 text-white p-2.5 rounded-lg hover:bg-slate-800 transition-all active:scale-95'>
                                <i className="ri-send-plane-fill text-lg"></i>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Right Side - Content Area (60%) */}
                <section className='w-[60%] flex flex-col bg-white relative'>
                    {/* Placeholder for Code Editor / File Viewer */}
                    <div className='flex-1 flex items-center justify-center bg-slate-50'>
                        <div className='text-center text-slate-400'>
                            <div className='bg-white p-8 rounded-full shadow-sm mb-4 inline-block'>
                                <i className="ri-code-box-line text-5xl text-slate-300"></i>
                            </div>
                            <p className='text-lg font-medium'>Code Editor / File Viewer</p>
                            <p className='text-sm'>This area will contain your project files and editor</p>
                        </div>
                    </div>
                </section>

                {/* Side Panel (Members) - Overlays on top */}
                <aside className={`absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-slate-200 shadow-xl transition-all duration-300 z-10 ${isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className='p-6 h-full flex flex-col'>
                        <div className='flex justify-between items-center mb-6'>
                            <h2 className='text-lg font-bold text-slate-900'>Team Members</h2>
                            <button onClick={() => setIsSidePanelOpen(false)} className='text-slate-400 hover:text-slate-900'>
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>

                        <div className='space-y-4 overflow-y-auto flex-1'>
                            {project?.users?.map((user, index) => (
                                <div key={index} className='flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group'>
                                    <div className='h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md'>
                                        {user?.email?.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-bold text-slate-800 truncate'>{user?.username || user?.email}</p>
                                        <p className='text-xs text-slate-500 truncate'>Member</p>
                                    </div>
                                    <div className='h-2 w-2 bg-emerald-500 rounded-full border-2 border-white shadow-[0_0_0_2px_#fff]'></div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className='mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2'>
                            <i className="ri-user-add-line"></i>
                            <span>Add Member</span>
                        </button>
                    </div>
                </aside>
            </div>

            {/* Select User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Select Users</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                <i className="ri-close-line text-2xl"></i>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 mb-6">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => handleUserClick(user._id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer border-2 ${selectedUsers.has(user._id) ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}>
                                    <div className='h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold'>
                                        {user.email.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-bold text-slate-800 truncate'>{user.username || user.email}</p>
                                    </div>
                                    {selectedUsers.has(user._id) && (
                                        <i className="ri-check-line text-blue-600 text-xl"></i>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addMembers}
                            disabled={selectedUsers.size === 0}
                            className='w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100'>
                            Add Selected Members ({selectedUsers.size})
                        </button>
                    </div>
                </div>
            )}

            {/* Chat User Selection Modal */}
            {isChatUserModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 flex flex-col max-h-[85vh] sm:max-h-[90vh] animate-slideUp relative pb-20">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-200">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Select Chat User</h2>
                                <p className="text-sm text-slate-500 mt-1">Choose a user to start chatting</p>
                            </div>
                            <button
                                onClick={() => setIsChatUserModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900 active:scale-95">
                                <i className="ri-close-line text-2xl"></i>
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="px-6 pt-4">
                            <div className="relative">
                                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
                                />
                            </div>
                        </div>

                        {/* Users List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-2">
                            {users.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <i className="ri-user-search-line text-5xl mb-3"></i>
                                    <p className="text-lg font-medium">No users found</p>
                                </div>
                            ) : (
                                users.map((user) => (
                                    <div
                                        key={user._id}
                                        onClick={() => handleChatUserSelect(user._id)}
                                        className={`flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer border-2 group
                                            ${selectedChatUser === user._id
                                                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                                                : 'border-transparent hover:bg-slate-50 hover:shadow-sm'
                                            }`}>
                                        {/* User Avatar */}
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold shadow-md transition-all
                                            ${selectedChatUser === user._id
                                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 scale-105'
                                                : 'bg-gradient-to-br from-slate-500 to-slate-600 group-hover:scale-105'
                                            }`}>
                                            {user.email.substring(0, 1).toUpperCase()}
                                        </div>

                                        {/* User Info */}
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-base font-bold text-slate-800 truncate'>
                                                {user.username || user.email}
                                            </p>
                                            <p className='text-xs text-slate-500 truncate'>
                                                {selectedChatUser === user._id ? 'Selected' : 'Click to select'}
                                            </p>
                                        </div>

                                        {/* Check Icon */}
                                        {selectedChatUser === user._id && (
                                            <div className="bg-blue-600 rounded-full p-1 animate-scaleIn">
                                                <i className="ri-check-line text-white text-lg"></i>
                                            </div>
                                        )}

                                        {/* Hover Arrow */}
                                        {selectedChatUser !== user._id && (
                                            <i className="ri-arrow-right-s-line text-slate-400 text-xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-3xl">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsChatUserModalOpen(false)}
                                    className="flex-1 py-3 px-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95">
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setIsChatUserModalOpen(false)}
                                    disabled={!selectedChatUser}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100 active:scale-95">
                                    {selectedChatUser ? 'Start Chat' : 'Select User'}
                                </button>
                            </div>
                        </div>

                        {/* Fixed Add Collaborators Button */}
                        <button
                            onClick={() => {
                                setIsChatUserModalOpen(false)
                                setIsModalOpen(true)
                            }}
                            className="absolute bottom-0 left-0 right-0 w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-b-3xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 border-t-2 border-emerald-500/20">
                            <i className="ri-user-add-line text-xl"></i>
                            <span>Add Collaborators</span>
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Project
