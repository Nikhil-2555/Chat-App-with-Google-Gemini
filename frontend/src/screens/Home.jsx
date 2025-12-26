import React, { useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/user.context'
import axios from '../config/axios'

const Home = () => {

    const { user } = useContext(UserContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projectName, setProjectName] = useState(null)
    const [project, setProject] = useState([])

    function createProject(e) {
        e.preventDefault()
        console.log({ projectName })

        axios.post('/projects/create', {
            name: projectName,
        })
            .then((res) => {
                console.log(res)
                setProject([...project, res.data]) // Update state
                setProjectName('') // Reset name
                setIsModalOpen(false)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    useEffect(() => {
        axios.get('/projects/all').then((res) => {
            setProject(res.data.projects || [])
        }).catch(err => {
            console.log(err)
        })

    }, [])

    return (
        <main className='p-6 min-h-screen bg-slate-50'>
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My Projects</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
                        <i className="ri-add-line text-lg"></i>
                        <span>New Project</span>
                    </button>
                </header>

                <div className="projects grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {
                        project.map((project) => (
                            <div key={project._id}
                                className="project-card group flex flex-col gap-4 cursor-pointer p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                                <div className="flex justify-between items-start">
                                    <h2 className='font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors capitalize'>
                                        {project.name}
                                    </h2>
                                    <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                                        <i className="ri-folder-line text-xl"></i>
                                    </div>
                                </div>

                                <div className='flex items-center gap-4 mt-auto'>
                                    <div className='flex items-center gap-1.5 text-sm text-slate-500 font-medium'>
                                        <i className="ri-user-line"></i>
                                        <span>{project.users.length} Collaborators</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-md z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Start New Project</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                                <i className="ri-close-line text-2xl"></i>
                            </button>
                        </div>
                        <form onSubmit={createProject}>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Project Name</label>
                                <input
                                    onChange={(e) => setProjectName(e.target.value)}
                                    type="text"
                                    placeholder="e.g. Portfolio Website"
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95 transition-all">
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Home