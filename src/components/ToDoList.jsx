import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ToDoList = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({
        company: '',
        position: '',
        link: '',
        email: '',
        date: '',
        location: '',
        received: '',
        tests: '',
        call: '',
        interview: '',
        status: '',
        candidatureFait: false,
        isFromTodoList: true,
    });

    const [editingTask, setEditingTask] = useState(null);
    const [showDone, setShowDone] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:5000/api/tasks')
            .then(response => {
                setTasks(response.data);
            })
            .catch(error => {
                console.error("Une erreur s'est produite lors de la récupération des tâches.", error);
            });
    }, [tasks]);

    const addTask = () => {
        axios.post('http://localhost:5000/api/tasks', newTask)
            .then(response => {
                setTasks([...tasks, response.data]);
                setNewTask({ company: '', position: '', link: '', email: '', date: '', location: '', received: '', tests: '', call: '', interview: '', status: '', candidatureFait: false, isFromTodoList: true });
            })
            .catch(error => {
                console.error("Une erreur s'est produite lors de l'ajout de la tâche.", error);
            });
    };

    // Fonction pour modifier une tâche
    const editTask = (taskId) => {
        const taskToEdit = tasks.find(task => task.id === taskId);
        setEditingTask(taskToEdit);
    };

    // Fonction pour annuler la modification de la tâche
    const cancelEdit = () => {
        setEditingTask(null);
    };

    const saveTask = () => {
        axios.put(`http://localhost:5000/api/tasks/${editingTask.id}`, editingTask)
            .then(response => {
                setTasks(tasks.map(task => (task.id === editingTask.id ? editingTask : task)));
                setEditingTask(null);
            })
            .catch(error => {
                console.error("Une erreur s'est produite lors de la modification de la tâche.", error);
            });
    };

    const deleteTask = (id) => {
        console.log('Deleting task with ID:', id);

        axios.delete(`http://localhost:5000/api/tasks/${id}`)
            .then(response => {
                setTasks(tasks.filter(task => task.id !== id));
            })
            .catch(error => {
                console.error("Une erreur s'est produite lors de la suppression de la tâche.", error);
            });
    };

    const updateTask = (id, updatedFields) => {
        axios.put(`http://localhost:5000/api/tasks/${id}`, updatedFields)
            .then(response => {
                setTasks(tasks.map(task => task.id === id ? response.data : task));
            })
            .catch(error => {
                console.error("Une erreur s'est produite lors de la mise à jour de la tâche.", error);
            });
    };

    const toggleCandidatureFait = (id) => {
        axios.put(`http://localhost:5000/api/tasks/${id}`, { candidatureFait: !tasks.find(task => task.id === id).candidatureFait })
            .then(response => {
                const updatedTask = { ...tasks.find(task => task.id === id), candidatureFait: !tasks.find(task => task.id === id).candidatureFait };
                const updatedTasks = tasks.map(task => (task.id === id ? updatedTask : task));

                setTasks(updatedTasks);
                updateTask(response.data.id, updatedTask); // Mettre à jour la tâche dans la base de données avec l'identifiant de candidature
            })
            .catch(error => {
                console.error("Une erreur s'est produite lors de la mise à jour de la tâche.", error);
            });
    };
    
    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const formatLink = (link) => {
        if (link && (link.startsWith('http://') || link.startsWith('https://'))) {
            return link;
        } else if (link) {
            return `http://${link}`;
        } else {
            return ''; // Retourner une chaîne vide si le lien est undefined ou null
        }
    };

    const candidaturesFaites = tasks.filter(task => task.candidatureFait);
    const candidaturesNonFaites = tasks.filter(task => !task.candidatureFait);

    return (
        <div>
            <h2>ToDo List</h2>
            <div>
                <input type="text" value={newTask.company} placeholder="Entreprise" onChange={(e) => setNewTask({ ...newTask, company: e.target.value })} />
                <input type="text" value={newTask.position} placeholder="Nom du poste" onChange={(e) => setNewTask({ ...newTask, position: e.target.value })} />
                <input type="text" value={newTask.link} placeholder="Lien internet" onChange={(e) => setNewTask({ ...newTask, link: e.target.value })} />
                <input type="text" value={newTask.email} placeholder="Email du recruteur" onChange={(e) => setNewTask({ ...newTask, email: e.target.value })} />
                <input type="date" value={newTask.date} onChange={(e) => setNewTask({ ...newTask, date: e.target.value })} />
                <input type="text" value={newTask.location} placeholder="Lieu" onChange={(e) => setNewTask({ ...newTask, location: e.target.value })} />

                <label htmlFor="candidatureFait">Candidature faite : </label>
                <select id="candidatureFait" value={newTask.candidatureFait ? 'true' : 'false'} onChange={(e) => setNewTask({ ...newTask, candidatureFait: e.target.value === 'true' })}>
                    <option value="false">Non</option>
                    <option value="true">Oui</option>
                </select>

                <button onClick={addTask}>Ajouter une tâche</button>
            </div>

            <div className="counters-container">
                <div className="counter">
                    <p>Candidatures non faites</p>
                    <span>{candidaturesNonFaites.length}</span>
                </div>
                <div className="counter">
                    <p>Candidatures faites</p>
                    <span>{candidaturesFaites.length}</span>
                </div>
            </div>

            <div>
                <select id="candidaturesSelect" onChange={(e) => setShowDone(e.target.value === 'done')}>
                    <option value="not-done">Candidatures non faites</option>
                    <option value="done">Candidatures faites</option>
                </select>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Entreprise</th>
                        <th>Nom du poste</th>
                        <th>Lien vers l'offre</th>
                        <th>Email</th>
                        <th>Date</th>
                        <th>Lieu</th>
                        <th>Candidature faite</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(task => {
                        if ((showDone && task.candidatureFait) || (!showDone && !task.candidatureFait)) {
                            return (
                                <tr key={task.id}>
                                    {editingTask && editingTask.id === task.id ? (
                                        <>
                                            <td><input type="text" value={editingTask.company} onChange={(e) => setEditingTask({ ...editingTask, company: e.target.value })} /></td>
                                            <td><input type="text" value={editingTask.position} onChange={(e) => setEditingTask({ ...editingTask, position: e.target.value })} /></td>
                                            <td><input type="text" value={editingTask.link} onChange={(e) => setEditingTask({ ...editingTask, link: e.target.value })} /></td>
                                            <td><input type="text" value={editingTask.email} onChange={(e) => setEditingTask({ ...editingTask, email: e.target.value })} /></td>
                                            <td><input type="date" value={editingTask.date} onChange={(e) => setEditingTask({ ...editingTask, date: e.target.value })} /></td>
                                            <td><input type="text" value={editingTask.location} onChange={(e) => setEditingTask({ ...editingTask, location: e.target.value })} /></td>
                                            <td>
                                                <button onClick={saveTask}>Save</button>
                                                <button onClick={cancelEdit}>Cancel</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{task.company}</td>
                                            <td>{task.position}</td>
                                            <td><a href={formatLink(task.link)} target="_blank" rel="noopener noreferrer">Site</a></td>
                                            <td>{task.email}</td>
                                            <td>{formatDate(task.date)}</td>
                                            <td>{task.location}</td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={task.candidatureFait}
                                                    onChange={() => toggleCandidatureFait(task.id)}
                                                />
                                            </td>
                                            <td>
                                                <button onClick={() => editTask(task.id)}>Edit</button>
                                                <button onClick={() => deleteTask(task.id)}>Delete</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        } else {
                            return null; // Ne pas rendre la ligne si elle ne correspond pas au filtre
                        }
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ToDoList;