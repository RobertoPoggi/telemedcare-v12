// ========================================
// TeleMedCare V12.0 - CRUD Functions
// Funzioni JavaScript per operazioni CRUD
// ========================================

// ========================================
// CRUD LEADS
// ========================================

async function createLead(leadData) {
    try {
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Lead creato con successo!');
            return result;
        } else {
            alert('❌ Errore: ' + result.error);
            return null;
        }
    } catch (error) {
        alert('❌ Errore di comunicazione: ' + error.message);
        return null;
    }
}

async function viewLead(leadId) {
    try {
        const response = await fetch(`/api/leads/${leadId}`);
        const result = await response.json();
        
        if (result && result.id) {
            return result;
        } else {
            alert('❌ Lead non trovato');
            return null;
        }
    } catch (error) {
        alert('❌ Errore: ' + error.message);
        return null;
    }
}

async function updateLead(leadId, leadData) {
    try {
        const response = await fetch(`/api/leads/${leadId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Lead aggiornato con successo!');
            return result;
        } else {
            alert('❌ Errore: ' + result.error);
            return null;
        }
    } catch (error) {
        alert('❌ Errore: ' + error.message);
        return null;
    }
}

async function deleteLead(leadId) {
    if (!confirm('Sei sicuro di voler eliminare questo lead?')) {
        return null;
    }
    
    try {
        const response = await fetch(`/api/leads/${leadId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Lead eliminato con successo!');
            return result;
        } else {
            if (result.hasContracts) {
                alert('❌ Impossibile eliminare: il lead ha contratti associati');
            } else {
                alert('❌ Errore: ' + result.error);
            }
            return null;
        }
    } catch (error) {
        alert('❌ Errore: ' + error.message);
        return null;
    }
}

// ========================================
// CRUD CONTRATTI
// ========================================

async function viewContratto(contrattoId) {
    try {
        const response = await fetch(`/api/contratti/${contrattoId}`);
        const result = await response.json();
        
        if (result.success && result.contratto) {
            return result.contratto;
        } else {
            alert('❌ Contratto non trovato');
            return null;
        }
    } catch (error) {
        alert('❌ Errore: ' + error.message);
        return null;
    }
}

async function updateContratto(contrattoId, contrattoData) {
    try {
        const response = await fetch(`/api/contratti/${contrattoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contrattoData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Contratto aggiornato con successo!');
            return result;
        } else {
            alert('❌ Errore: ' + result.error);
            return null;
        }
    } catch (error) {
        alert('❌ Errore: ' + error.message);
        return null;
    }
}

async function deleteContratto(contrattoId) {
    if (!confirm('Sei sicuro di voler eliminare questo contratto?')) {
        return null;
    }
    
    try {
        const response = await fetch(`/api/contratti/${contrattoId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Contratto eliminato con successo!');
            return result;
        } else {
            if (result.isSigned) {
                alert('❌ Impossibile eliminare: contratto già firmato');
            } else {
                alert('❌ Errore: ' + result.error);
            }
            return null;
        }
    } catch (error) {
        alert('❌ Errore: ' + error.message);
        return null;
    }
}

async function downloadContrattoPDF(contrattoId, codiceContratto) {
    try {
        window.open(`/api/contratti/${contrattoId}/download`, '_blank');
    } catch (error) {
        alert('❌ Errore download: ' + error.message);
    }
}

// ========================================
// CRUD PROFORMA
// ========================================

async function viewProforma(proformaId) {
    try {
        const response = await fetch(`/api/proforma/${proformaId}`);
        const result = await response.json();
        
        if (result.success && result.proforma) {
            return result.proforma;
        } else {
            alert('❌ Proforma non trovata');
            return null;
        }
    } catch (error) {
        alert('❌ Errore: ' + error.message);
        return null;
    }
}

async function updateProforma(proformaId, proformaData) {
    try {
        const response = await fetch(`/api/proforma/${proformaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proformaData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Proforma aggiornata con successo!');
            return result;
        } else {
            alert('❌ Errore: ' + result.error);
            return null;
        }
    } catch (error) {
        alert('❌ Errore: ' + error.message);
        return null;
    }
}

async function deleteProforma(proformaId) {
    if (!confirm('Sei sicuro di voler eliminare questa proforma?')) {
        return null;
    }
    
    try {
        const response = await fetch(`/api/proforma/${proformaId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Proforma eliminata con successo!');
            return result;
        } else {
            if (result.isPaid) {
                alert('❌ Impossibile eliminare: proforma già pagata');
            } else {
                alert('❌ Errore: ' + result.error);
            }
            return null;
        }
    } catch (error) {
        alert('❌ Errore: ' + error.message);
        return null;
    }
}

// ========================================
// MODAL HELPERS
// ========================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// Close modal on backdrop click
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
});
