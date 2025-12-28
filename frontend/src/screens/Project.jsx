import React, { useState, useEffect, useContext } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import * as projectService from '../services/project.service'
import * as userService from '../services/user.service'
import { UserContext } from '../context/user.context'

const Project = () => {
    const { projectId } = useParams()
    const location = useLocation()
    const [project, setProject] = useState(location.state?.project || null)
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [users, setUsers] = useState([])
    const [selectedUsers, setSelectedUsers] = useState(new Set())

    useEffect(() => {
        if (!project || !project.users || typeof project.users[0] === 'string') {
            projectService.getProjectById(projectId).then((data) => {
                setProject(data)
            }).catch(err => {
                console.log(err)
            })
        }

        userService.getAllUsers().then((data) => {
            setUsers(data)
        }).catch(err => {
            console.log(err)
        })
    }, [projectId])

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
        projectService.addUserToProject(projectId, Array.from(selectedUsers))
            .then((data) => {
                setProject(data.project)
                setIsModalOpen(false)
                setSelectedUsers(new Set())
            })
            .catch(err => {
                console.log(err)
            })
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

            {/* Main Content Area */}
            <div className='flex-1 flex overflow-hidden'>
                {/* Chat Section (Placeholder) */}
                <section className='flex-1 flex flex-col bg-slate-50 relative'>
                    <div className='flex-1 p-6 overflow-y-auto space-y-4'>
                        <div className='flex flex-col items-center justify-center h-full text-slate-400'>
                            <div className='bg-white p-6 rounded-full shadow-sm mb-4'>
                                <i className="ri-chat-history-line text-4xl text-blue-500"></i>
                            </div>
                            <p className='text-lg font-medium'>No messages yet</p>
                            <p className='text-sm'>Start the conversation with your team!</p>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className='p-6 bg-white border-t border-slate-200'>
                        <div className='max-w-4xl mx-auto flex gap-3'>
                            <div className='flex-1 relative'>
                                <input
                                    type="text"
                                    placeholder='Type your message...'
                                    className='w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-medium'
                                />
                                <button className='absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors'>
                                    <i className="ri-attachment-2"></i>
                                </button>
                            </div>
                            <button className='bg-blue-600 text-white p-4 px-6 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 flex items-center gap-2 font-bold'>
                                <span>Send</span>
                                <i className="ri-send-plane-2-line"></i>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Side Panel (Members) */}
                <aside className={`w-80 bg-white border-l border-slate-200 transition-all duration-300 ${isSidePanelOpen ? 'mr-0' : '-mr-80'}`}>
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
                                        <p className='text-sm font-bold text-slate-800 truncate'>{user?.email}</p>
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
                                        <p className='text-sm font-bold text-slate-800 truncate'>{user.email}</p>
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
        </main>
    )
}

export default Project
