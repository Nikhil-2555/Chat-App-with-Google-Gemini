import React, { useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate } from 'react-router-dom'
import * as projectService from '../services/project.service'

const Home = () => {
    const { user } = useContext(UserContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [projects, setProjects] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        projectService.getAllProjects().then((data) => {
            setProjects(data || [])
        }).catch(err => {
            console.log(err)
        })
    }, [])

    function createProject(e) {
        e.preventDefault()
        console.log('Creating project:', projectName);
        projectService.createProject(projectName)
            .then((res) => {
                console.log('Project created:', res)
                setProjects([...projects, res])
                setIsModalOpen(false)
                setProjectName('')
            })
            .catch((err) => {
                console.error('Error creating project:', err)
            })
    }

    return (
        <main className='p-4 flex flex-wrap gap-3'>
            <div className="projects flex flex-wrap gap-3">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="project border-2 border-slate-300 rounded-md p-4 min-w-52 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                    <span className='text-2xl font-semibold'>New Project</span>
                    <i className="ri-link text-2xl font-semibold"></i>
                </button>

                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/login');
                    }}
                    className="project border-2 border-red-300 text-red-500 rounded-md p-4 min-w-52 flex items-center justify-center gap-2 hover:bg-red-50 transition-all">
                    <span className='text-2xl font-semibold'>Logout</span>
                    <i className="ri-logout-box-r-line text-2xl font-semibold"></i>
                </button>

                {
                    projects.map((project) => (
                        <div key={project._id}
                            onClick={() => navigate(`/project/${project._id}`, {
                                state: { project }
                            })}
                            className="project flex flex-col gap-2 cursor-pointer p-4 border-2 border-slate-300 rounded-md min-w-52 bg-[#e2e8f0] hover:bg-[#cbd5e1] transition-all">
                            <h2 className='font-bold text-2xl'>
                                {project.name}
                            </h2>
                            <div className='flex items-center gap-2 text-slate-700'>
                                <i className="ri-user-line text-lg"></i>
                                <span className='font-semibold text-lg'>Collaborators :</span>
                                <span className='font-bold text-lg'>{project.users.length}</span>
                            </div>
                        </div>
                    ))
                }
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-80">
                        <h2 className="text-xl font-bold mb-4">Project Name</h2>
                        <form onSubmit={createProject}>
                            <input
                                onChange={(e) => setProjectName(e.target.value)}
                                value={projectName}
                                type="text"
                                placeholder="Enter project name"
                                className="w-full p-2 border border-slate-300 rounded mb-4 outline-none focus:border-blue-500"
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 font-semibold">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Home