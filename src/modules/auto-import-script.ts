/**
 * AUTO-IMPORT SCRIPT - HubSpot Incremental Sync
 * 
 * Script da iniettare in tutte le dashboard per eseguire
 * auto-import incrementale silenzioso in background
 * 
 * Trigger: ogni caricamento dashboard
 * Logica: import solo lead dalle 9:00 ad ora
 */

export const autoImportScript = `
<script>
(function() {
  // Configurazione auto-import
  const AUTO_IMPORT_CONFIG = {
    enabled: true,
    silent: true, // Non mostrare notifiche se non ci sono nuovi lead
    showSuccessToast: true, // Mostra toast solo se importati nuovi lead
    minIntervalMinutes: 0 // ✅ SEMPRE ESEGUI (rimosso interval)
  };
  
  // Verifica parametro URL per forzare import
  const urlParams = new URLSearchParams(window.location.search);
  const forceImport = urlParams.get('forceImport') === 'true';
  
  // Verifica se auto-import è necessario
  async function shouldRunAutoImport() {
    // ✅ SEMPRE TRUE - Esegui ad ogni refresh
    return true;
  }
  
  // Esegui auto-import incrementale
  async function executeAutoImport() {
    try {
      if (!AUTO_IMPORT_CONFIG.enabled) {
        console.log('🔴 [AUTO-IMPORT] Disabilitato');
        return;
      }
      
      if (!(await shouldRunAutoImport())) {
        console.log('⏭️  [AUTO-IMPORT] Troppo recente, skip');
        return;
      }
      
      console.log('🔄 [AUTO-IMPORT] Inizio import incrementale silenzioso...');
      
      const response = await fetch('/api/hubspot/auto-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: true,
          startHour: 0, // ✅ Ultimi 24h (non solo dalle 9:00)
          onlyEcura: true, // ✅ RIPRISTINATO: solo lead da Form eCura
          dryRun: false
        })
      });
      
      const result = await response.json();
      
      // Salva timestamp ultimo import
      localStorage.setItem('lastAutoImportTimestamp', new Date().toISOString());
      
      if (result.success) {
        const timeFrom = new Date(result.timeRange.from).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const timeTo = new Date(result.timeRange.to).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        
        console.log(\`✅ [AUTO-IMPORT] Completato: \${result.imported} importati, \${result.skipped} già esistenti (\${timeFrom} - \${timeTo})\`);
        
        // Ricarica dati dashboard sempre (anche se 0 importati) per sincronizzare cancellazioni
        if (typeof window.refreshDashboardData === 'function') {
          console.log('🔄 [AUTO-IMPORT] Ricarico dati dashboard...');
          setTimeout(() => window.refreshDashboardData(), 1000);
        }
        
        // Mostra notifica solo se importati nuovi lead
        if (result.imported > 0 && AUTO_IMPORT_CONFIG.showSuccessToast) {
          showAutoImportToast(\`✅ \${result.imported} nuovi lead importati da HubSpot\`, 'success');
        } else if (AUTO_IMPORT_CONFIG.silent) {
          // Import silenzioso: nessuna notifica
          console.log(\`ℹ️  [AUTO-IMPORT] Nessun nuovo lead da importare\`);
        }
      } else {
        console.error('❌ [AUTO-IMPORT] Errore:', result.message || result.error);
        
        // Non mostrare errore all'utente se silenzioso
        if (!AUTO_IMPORT_CONFIG.silent) {
          showAutoImportToast(\`⚠️ Auto-import fallito: \${result.message || result.error}\`, 'error');
        }
      }
      
    } catch (error) {
      console.error('❌ [AUTO-IMPORT] Errore esecuzione:', error);
      
      if (!AUTO_IMPORT_CONFIG.silent) {
        showAutoImportToast('⚠️ Errore auto-import HubSpot', 'error');
      }
    }
  }
  
  // Mostra toast notifica
  function showAutoImportToast(message, type = 'info') {
    // Crea toast element
    const toast = document.createElement('div');
    toast.className = \`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 transition-all duration-300 \${
      type === 'success' ? 'bg-green-600' :
      type === 'error' ? 'bg-red-600' :
      'bg-blue-600'
    }\`;
    toast.innerHTML = \`
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          \${type === 'success' 
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
          }
        </svg>
        <span>\${message}</span>
      </div>
    \`;
    
    document.body.appendChild(toast);
    
    // Fade in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
  
  // Esegui auto-import quando documento è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', executeAutoImport);
  } else {
    // DOM già caricato, esegui subito
    setTimeout(executeAutoImport, 500); // Piccolo delay per lasciare caricare la dashboard
  }
  
  // Log status
  console.log('🤖 [AUTO-IMPORT] Script caricato e pronto');
  console.log(\`📊 [AUTO-IMPORT] Config: enabled=\${AUTO_IMPORT_CONFIG.enabled}, silent=\${AUTO_IMPORT_CONFIG.silent}, interval=\${AUTO_IMPORT_CONFIG.minIntervalMinutes}min\`);
  
})();
</script>
`;

export default autoImportScript;
