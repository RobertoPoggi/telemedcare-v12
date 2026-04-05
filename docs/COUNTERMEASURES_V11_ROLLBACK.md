# 🚨 CONTROMISURE ANTI-ROLLBACK V11

**Priorità**: CRITICA  
**Problema**: Sistema torna a V11 3 volte in 24h  
**Data**: 2026-02-12  

---

## 🎯 ROOT CAUSE ANALYSIS

### Cosa significa "torna a V11"?

**Sintomo**: La pagina `/contract-signature.html` mostra versione vecchia (V11) invece di V12.

**Analisi tecnica**:
- ✅ File `contract-signature.html` ESISTE in commit 9865958 (19 KB, V11)
- ✅ File `contract-signature.html` esiste anche nei commit successivi (21 KB, V12)  
- ❌ Cloudflare serve la **versione cached V11** anche dopo deploy V12

### Pattern identificato

| Evento | Timestamp | Azione | Risultato |
|--------|-----------|--------|-----------|
| #1 | ~8h fa | Deploy V12 iniziale | CF cache serve V11 |
| #2 | ~4h fa | Deploy V12 fix | CF cache serve V11 |
| #3 | Ora | Deploy V12 finale | CF cache serve V11 |

**Conclusione**: NON è rollback Git, ma **Cloudflare cache persistente**.

---

## 🔍 VERO PROBLEMA: Cloudflare CDN Cache

### Perché la cache persiste?

1. **Cache-Control headers**: Default Cloudflare (max-age=300, 5 min)
2. **ETag/Last-Modified**: Se stesso ETag, cache non invalida
3. **Edge Locations**: Cache replicata su ~300 datacenter, tempo propagazione
4. **Purge parziale**: Purge singolo file non sempre istantaneo

---

## ✅ SOLUZIONE RACCOMANDATA: Approccio 5-Layer

### Layer 1: Version Injection (Build Time)
Inietta metadata versione in TUTTI gli HTML durante build.

### Layer 2: Cache Headers Aggressivi
Force no-cache su file critici via `_headers`.

### Layer 3: Query Parameter Versioning
Aggiungi `?v=timestamp` ai link email per invalidare cache.

### Layer 4: Cloudflare Purge Automatico
Purge cache dopo ogni deploy via GitHub Actions.

### Layer 5: Monitoring & Verification
Verifica automatica post-deploy che versione corretta sia live.

---

## 🚀 IMPLEMENTAZIONE IMMEDIATA (15 minuti)

### 1. Cache Headers (public/_headers)
```
/contract-signature.html
  Cache-Control: no-cache, no-store, must-revalidate, max-age=0
  Pragma: no-cache
  X-Content-Version: V12
```

### 2. Query Parameter (workflow-email-manager.ts)
```typescript
LINK_FIRMA: `${baseUrl}/contract-signature.html?v=${Date.now()}&contractId=${id}`
```

### 3. Version Injection Plugin (vite.config.ts)
```typescript
function injectVersionPlugin() {
  return {
    name: 'inject-version',
    closeBundle() {
      // Inietta <!-- BUILD: {version, commit, date} --> in tutti gli HTML
    }
  }
}
```

---

## 📊 SUCCESS METRICS

| Metric | Target |
|--------|--------|
| No V11 rollback | 48h zero incidents |
| Cache headers | Present in all HTML |
| Version visible | In HTML source |
| User complaints | Zero |

---

## 🔧 TROUBLESHOOTING

### Se problema persiste:

1. **Purge manual**: Cloudflare Dashboard → Cache → Purge Everything
2. **Hard reload**: Ctrl+Shift+R (Chrome), Ctrl+F5 (Firefox)
3. **Check edge**: `curl -I url | grep cf-ray`
4. **Emergency**: Rename file (instant cache bypass)

---

**Status**: READY FOR IMPLEMENTATION  
**ETA**: 15 minuti  
**Risk**: LOW (backward compatible)
