import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CandidatureTable = () => {
    const [candidatures, setCandidatures] = useState([]);
    const [file, setFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalCandidatures, setTotalCandidatures] = useState(0);
    const [currentCount, setCurrentCount] = useState(0);

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const fetchCandidatures = useCallback(() => {
        axios.get(`http://localhost:5000/api/candidatures?page=${page}&limit=${limit}`)
            .then(response => {
                setCandidatures(response.data.displayedCandidatures);
                setTotalCandidatures(response.data.totalCandidatures);
                setCurrentCount(response.data.currentCount);
            })
            .catch(error => {
                console.error("Une erreur s'est produite lors de la récupération des candidatures.", error);
            });
    }, [page, limit]);

    useEffect(() => {
        fetchCandidatures();
    }, [fetchCandidatures, candidatures]);

    const formatLink = (link) => {
        return link.startsWith('http://') || link.startsWith('https://') ? link : `http://${link}`;
    };

    const handleFieldChange = (id, field, value) => {
        const updatedCandidatures = candidatures.map(candidature => {
            if (candidature.id === id && !candidature.isFromTodoList) {
                return { ...candidature, [field]: value };
            }
            return candidature;
        });
    
        setCandidatures(updatedCandidatures);
    
        // Vérifier si la candidature est modifiable (pas de isFromTodoList pour les champs sensibles)
        const candidatureToUpdate = candidatures.find(candidature => candidature.id === id);
        if (!candidatureToUpdate.isFromTodoList || !['id', 'company', 'position', 'link', 'email', 'date', 'location'].includes(field)) {
            axios.put(`http://localhost:5000/api/candidatures/${id}`, { [field]: value })
                .then(response => {
                    console.log("Mise à jour réussie de la candidature.", response.data);
                })
                .catch(error => {
                    console.error("Une erreur s'est produite lors de la mise à jour de la candidature.", error);

                    fetchCandidatures();
                });
        }
    };    

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setErrorMessage('');
    };

    const handleFileUpload = () => {
        if (!file) {
            setErrorMessage('Veuillez sélectionner un fichier Excel avant de télécharger.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        axios.post('http://localhost:5000/api/uploadFileExcel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(response => {
            console.log(response.data);

            fetchCandidatures();

            setFile(null);
            document.getElementById('fileInput').value = '';
        }).catch(error => {
            console.error('Une erreur s\'est produite lors de l\'envoi du fichier :', error);
        });
    };

    // Pagination des données
    const totalPages = Math.ceil(totalCandidatures / limit);

    const nextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const previousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const getPageNumbers = () => {
        if (totalPages <= 3) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            let startPage = Math.max(1, page - 1);
            let endPage = Math.min(totalPages, page + 1);
            
            if (endPage - startPage < 2) {
                if (page === 1) {
                    endPage = Math.min(totalPages, startPage + 2);
                } else if (page === totalPages) {
                    startPage = Math.max(1, endPage - 2);
                }
            } else {
                if (page > 2) {
                    startPage = page - 1;
                }
                if (page < totalPages - 1) {
                    endPage = page + 1;
                }
            }
            
            return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
        }
    };

    return (
        <div>
            <h2>Table des candidatures</h2>

            <input id="fileInput" type="file" onChange={handleFileChange} accept=".xlsx, .xls" />
            <button onClick={handleFileUpload}>Uploader le fichier</button>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            <p>Nombre de candidatures affichées : {currentCount} sur {totalCandidatures}</p>

            <table>
                <thead>
                    <tr>
                        <th>Entreprise</th>
                        <th>Nom du poste</th>
                        <th>Lien offre emploi</th>
                        <th>Email</th>
                        <th>Date</th>
                        <th>Lieu</th>
                        <th>Candidature reçu</th>
                        <th>Tests internet</th>
                        <th>Appels</th>
                        <th>Entretiens</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {candidatures && candidatures.length > 0 ? (
                        candidatures.map(candidature => (
                            <tr key={candidature.id}>
                                <td>{candidature.company}</td>
                                <td>{candidature.position}</td>
                                <td><a href={formatLink(candidature.link)} target="_blank" rel="noopener noreferrer">Lien</a></td>
                                <td>{candidature.email}</td>
                                <td>{formatDate(candidature.date)}</td>
                                <td>{candidature.location}</td>
                                <td>
                                    <select value={candidature.received || ''} onChange={(e) => handleFieldChange(candidature.id, 'received', e.target.value)}>
                                        <option value=""></option>
                                        <option value="Oui">Oui</option>
                                        <option value="Non">Non</option>
                                    </select>
                                </td>
                                <td>
                                    <select value={candidature.tests || ''} onChange={(e) => handleFieldChange(candidature.id, 'tests', e.target.value)}>
                                        <option value=""></option>
                                        <option value="Oui">Oui</option>
                                        <option value="Non">Non</option>
                                    </select>
                                </td>
                                <td>
                                    <select value={candidature.call || ''} onChange={(e) => handleFieldChange(candidature.id, 'call', e.target.value)}>
                                        <option value=""></option>
                                        <option value="Oui">Oui</option>
                                        <option value="Non">Non</option>
                                    </select>
                                </td>
                                <td>
                                    <select value={candidature.interview || ''} onChange={(e) => handleFieldChange(candidature.id, 'interview', e.target.value)}>
                                        <option value=""></option>
                                        <option value="Oui">Oui</option>
                                        <option value="Non">Non</option>
                                    </select>
                                </td>
                                <td>
                                    <select value={candidature.status || ''} onChange={(e) => handleFieldChange(candidature.id, 'status', e.target.value)}>
                                        <option value=""></option>
                                        <option value="Accepté">Accepté</option>
                                        <option value="Refusé">Refusé</option>
                                    </select>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="11">Aucune candidature disponible</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                {page > 1 && <button onClick={previousPage}>&lt;</button>}
                {getPageNumbers().map(num => (
                    <span key={num} style={{ margin: '0 5px', fontWeight: num === page ? 'bold' : 'normal' }}>{num}</span>
                ))}
                {page < totalPages && <button onClick={nextPage}>&gt;</button>}
            </div>
        </div>
    );
};

export default CandidatureTable;