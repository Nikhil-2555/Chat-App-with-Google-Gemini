

import React, { useState, useEffect, useContext } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import * as projectService from '../services/project.service'
import * as userService from '../services/user.service'
import { UserContext } from '../context/user.context'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import { getWebContainer } from '../config/webContainer'

const Project = () => {
    const { projectId } = useParams()
    const location = useLocation()
    const [project, setProject] = useState(location.state?.project || null)
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
    const [users, setUsers] = useState([])
    const [selectedUsers, setSelectedUsers] = useState(new Set())
    const [selectedChatUser, setSelectedChatUser] = useState(null)
    const { user } = useContext(UserContext)
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const messageBox = React.useRef(null)

    const [currentFile, setCurrentFile] = useState(null)
    const [openFiles, setOpenFiles] = useState([])
    const [webContainer, setWebContainer] = useState(null)

    const [fileTree, setFileTree] = useState({})

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
        if (!webContainer) {
            getWebContainer().then((container) => {
                setWebContainer(container)
                console.log("container started")
            })
        }
    }, [projectId])

    useEffect(() => {
        if (!projectId) return

        const socket = initializeSocket(projectId)

        sendMessage('join-project', projectId)

        const handleMessage = (data) => {
            console.log("📩 Received message:", data)

            try {
                let cleanMessage = typeof data.message === 'string' ? data.message : '';

                // Remove Markdown code blocks if present
                cleanMessage = cleanMessage.replace(/```json/g, '').replace(/```/g, '').trim();

                if (cleanMessage.startsWith('{') && cleanMessage.endsWith('}')) {
                    const parsed = JSON.parse(cleanMessage);
                    if (parsed.fileTree) {
                        setFileTree(prev => ({ ...prev, ...parsed.fileTree }));
                        data.message = parsed.text || "Updated project files.";
                    }
                }
            } catch (e) {
                console.log("Message is not a system command", e)
            }

            setMessages(prev => [...prev, data])
        }

        receiveMessage('project-message', handleMessage)
        receiveMessage('ai-message', handleMessage)

        // Listen for error messages from the server
        receiveMessage('error', (data) => {
            console.error("Socket error:", data)
            alert(data.message || "An error occurred")
        })

        // Cleanup function to remove listeners when component unmounts or projectId changes
        return () => {
            if (socket) {
                socket.off('project-message', handleMessage)
                socket.off('ai-message', handleMessage)
                socket.off('error')
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
        <main className='h-dvh w-screen flex flex-col bg-slate-50'>
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
                    <div className='bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-100'>
                        <i className="ri-folder-line text-xl"></i>
                    </div>
                    <button className='p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-600 active:scale-95'>
                        <i className="ri-settings-3-line text-xl"></i>
                    </button>
                </div>
            </header>

            {/* Main Content Area - Split Layout */}
            <div className='flex-1 flex overflow-hidden min-h-0'>
                {/* Left Side - Chat Interface (25%) */}
                <section className='w-[25%] flex flex-col relative border-r border-slate-300' style={{ backgroundColor: '#d4dae3' }}>
                    {/* Chat Header with User Icon */}
                    {/* Chat Header */}
                    <header className='flex justify-between items-center p-3 px-4 border-b border-slate-200 bg-white/60 backdrop-blur-sm sticky top-0 z-10'>
                        <div className='flex items-center gap-3'>
                            <div className='h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center'>
                                <i className="ri-group-fill text-slate-500 text-lg"></i>
                            </div>
                            <div>
                                <h3 className='font-bold text-slate-800 text-sm'>Team Chat</h3>
                                <p className='text-xs text-slate-500'>{project?.users?.length || 0} members</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsMembersModalOpen(true)}
                            className='p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-all active:scale-95'
                            title="View Members">
                            <i className="ri-more-2-fill"></i>
                        </button>
                    </header>

                    {/* Messages Area */}
                    <div className='flex-1 px-4 pb-4 overflow-y-auto' ref={messageBox}>
                        <div className='space-y-3'>
                            {messages.map((msg, index) => {
                                const senderId = msg.sender?._id;
                                const currentUserId = user?._id;
                                const isOwnMessage = senderId && currentUserId && senderId === currentUserId;
                                const isAi = msg.sender?._id === 'ai';

                                return (
                                    <div key={index} className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} animate-fadeIn mb-2`}>
                                        <div className={`rounded-xl shadow-sm p-3 max-w-[85%] border 
                                            ${isOwnMessage
                                                ? 'bg-blue-600 text-white rounded-tr-sm border-blue-600'
                                                : isAi
                                                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 text-slate-800 rounded-tl-sm border-indigo-100'
                                                    : 'bg-white text-slate-800 rounded-tl-sm border-slate-200'
                                            }`}>
                                            {!isOwnMessage && (
                                                <p className={`text-xs mb-1 font-semibold ${isAi ? 'text-indigo-600' : 'text-slate-500'}`}>
                                                    {msg.sender?.username || msg.sender?.email || 'Unknown'}
                                                </p>
                                            )}
                                            <div className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isAi ? 'markdown-content' : ''}`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                        <div className='text-[10px] text-slate-400 mt-1 px-1'>
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                )
                            })}
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

                {/* Right Side - Content Area (75%) */}
                {/* Right Side - Code Editor Area (75%) */}
                {/* Right Side - Code Editor Area (75%) */}
                <section className='flex-1 flex bg-slate-50 relative'>
                    {/* File Explorer (20% of right side) */}
                    <div className='w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-full'>
                        <header className='p-4 border-b border-slate-200 flex justify-between items-center px-4 py-2'>
                            <h2 className='text-sm font-semibold text-slate-700 uppercase tracking-wider'>Files</h2>
                            <button className='text-slate-500 hover:text-slate-800 transition-colors'>
                                <i className="ri-add-line text-lg"></i>
                            </button>
                        </header>

                        <div className='flex-1 overflow-y-auto p-2'>
                            {Object.keys(fileTree).map((file) => (
                                <button
                                    key={file}
                                    onClick={() => {
                                        if (!openFiles.includes(file)) {
                                            setOpenFiles([...openFiles, file])
                                        }
                                        setCurrentFile(file)
                                    }}
                                    className={`
                                        w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm mb-1
                                        ${currentFile === file ? 'bg-blue-100 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-200'}
                                    `}
                                >
                                    <i className={`ri-file-code-line text-lg ${currentFile === file ? 'text-blue-500' : 'text-slate-400'}`}></i>
                                    <span className='truncate'>{file}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Code Editor Area */}
                    <div className='flex-1 flex flex-col bg-white overflow-hidden'>
                        {/* Tabs Bar */}
                        {openFiles.length > 0 && (
                            <div className='flex items-center bg-slate-100 border-b border-slate-200 overflow-x-auto custom-scrollbar h-10'>
                                {openFiles.map(file => (
                                    <div
                                        key={file}
                                        onClick={() => setCurrentFile(file)}
                                        className={`
                                            group flex items-center gap-2 px-3 h-full min-w-[100px] max-w-[200px] text-sm border-r border-slate-200 cursor-pointer select-none
                                            ${currentFile === file ? 'bg-white text-slate-800 font-medium md:border-t-2 md:border-t-blue-500' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                                        `}
                                    >
                                        <span className='truncate flex-1'>{file}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newOpenFiles = openFiles.filter(f => f !== file);
                                                setOpenFiles(newOpenFiles);
                                                if (currentFile === file) {
                                                    setCurrentFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
                                                }
                                            }}
                                            className={`p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all ${currentFile === file ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-slate-700'}`}
                                        >
                                            <i className="ri-close-line"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Editor Content */}
                        {currentFile ? (
                            <div className='flex-1 relative'>
                                <textarea
                                    value={fileTree[currentFile]?.content || ''}
                                    onChange={(e) => {
                                        setFileTree({
                                            ...fileTree,
                                            [currentFile]: {
                                                ...fileTree[currentFile],
                                                content: e.target.value
                                            }
                                        })
                                    }}
                                    className='w-full h-full p-4 font-mono text-sm text-slate-800 focus:outline-none resize-none leading-relaxed'
                                    spellCheck="false"
                                />
                            </div>
                        ) : (
                            <div className='flex-1 flex items-center justify-center bg-slate-50'>
                                <div className='text-center text-slate-400'>
                                    <i className="ri-code-s-slash-line text-6xl mb-4 opacity-50 block"></i>
                                    <p className='text-lg font-medium'>Select a file to view</p>
                                    <p className='text-xs mt-2'>Or assume the AI created some files for you!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>


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

            {/* Team Members Modal */}
            {isMembersModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 flex flex-col max-h-[80vh] overflow-hidden animate-slideUp">
                        {/* Modal Header */}
                        <div className='p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50'>
                            <h2 className='text-lg font-bold text-slate-900'>Team Members</h2>
                            <button onClick={() => setIsMembersModalOpen(false)} className='text-slate-400 hover:text-slate-900 transition-all p-1 rounded-full hover:bg-slate-200'>
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>

                        {/* Members List */}
                        <div className='flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar'>
                            {project?.users?.map((user, index) => (
                                <div key={index} className='flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all'>
                                    <div className='h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm'>
                                        {user?.email?.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-bold text-slate-800 truncate'>{user?.username || user?.email}</p>
                                        <p className='text-xs text-slate-500 text-slate-400'>Full Access</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className='p-5 border-t border-slate-100 bg-slate-50'>
                            <button
                                onClick={() => {
                                    setIsMembersModalOpen(false)
                                    setIsModalOpen(true)
                                }}
                                className='w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-95'>
                                <i className="ri-user-add-line"></i>
                                <span>Add New Member</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Project
//how are you
