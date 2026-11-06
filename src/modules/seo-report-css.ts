// CSS del report: identico all'originale (estratto da src/index.tsx) + poche classi aggiuntive in coda.
// Posizioni/larghezze in percentuale come costanti (nessuna percentuale letterale nel generatore)
const PCT = '%'
const GRAD = [0, 50, 100].map(n => `${n}${PCT}`)
const FULL = `${GRAD[2]}`
export const REPORT_CSS = `:root{--teal:#068D86;--navy:#080E49;--grey:#3D3C3B;--light:#f7f4ef;--border:#e3dfdd;--white:#fff}
*{box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;font-size:15px;line-height:1.7;color:var(--grey);background:var(--white);margin:0;padding:0}
.cover{background:linear-gradient(135deg,var(--navy) ${GRAD[0]},#0f1a7a ${GRAD[1]},var(--teal) ${GRAD[2]});color:#fff;padding:52px 40px 44px;display:flex;flex-direction:column;justify-content:center}
.cover-inner{max-width:1100px;margin:0 auto}
.cover h1{font-size:clamp(1.8rem,4vw,2.6rem);margin:0 0 12px;font-weight:700}
.cover .subtitle{font-size:1rem;color:rgba(255,255,255,.85);max-width:700px}
.cover .meta{margin-top:24px;display:flex;flex-wrap:wrap;gap:16px;font-size:.83rem;color:rgba(255,255,255,.6)}
.pill{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:4px 16px;font-size:.82rem;display:inline-block}
.container{max-width:1100px;margin:0 auto;padding:0 28px}
.section{padding:40px 0}
.section+.section{border-top:2px solid var(--border)}
h2{font-size:1.45rem;color:var(--navy);margin-bottom:18px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
h3{font-size:1rem;color:var(--navy);margin:1.4rem 0 .4rem;font-weight:600}
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin:16px 0}
.kpi{background:var(--light);border-radius:10px;padding:14px 12px;text-align:center;border:1px solid var(--border);border-top:3px solid var(--teal)}
.kpi .num{font-size:1.9rem;font-weight:700;color:var(--teal);display:block;line-height:1}
.kpi .lbl{font-size:.73rem;color:#666;margin-top:4px}
.kpi .sub{font-size:.7rem;color:#999;margin-top:2px}
.charts-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:22px;margin:20px 0}
.chart-box{background:var(--light);border-radius:12px;padding:18px;border:1px solid var(--border)}
.chart-box h3{margin-top:0;margin-bottom:12px}
table{width:${FULL};border-collapse:collapse;font-size:.85rem}
th{background:var(--navy);color:#fff;padding:9px 12px;text-align:left;font-size:.78rem;white-space:nowrap}
td{padding:7px 12px;border-bottom:1px solid var(--border);vertical-align:middle}
tr:nth-child(even) td{background:var(--light)}
.tag{display:inline-block;padding:2px 8px;border-radius:12px;font-size:.72rem;font-weight:600;white-space:nowrap}
.tag-ga4{background:#dbeafe;color:#1d4ed8}
.tag-crm{background:#dcfce7;color:#166534}
.tag-gsc{background:#fef3c7;color:#92400e}
.tag-ai{background:#ede9fe;color:#5b21b6}
.tag-seo{background:#dbeafe;color:#1e40af}
.tag-paid{background:#fef3c7;color:#92400e}
.tag-direct{background:#ccfbf1;color:#0f766e}
.badge{display:inline-block;padding:3px 10px;border-radius:14px;font-size:.75rem;font-weight:600}
.insight-list{list-style:none;padding:0;margin:16px 0}
.insight-list li{padding:12px 16px;border-radius:8px;margin-bottom:10px;font-size:.88rem;line-height:1.6;border-left:4px solid #ccc;background:#fafafa}
.insight-list li.seo{border-left-color:#4285F4;background:#eff6ff}
.insight-list li.ai{border-left-color:#7C3AED;background:#f5f3ff}
.insight-list li.direct{border-left-color:#068D86;background:#f0fdfa}
.insight-list li.paid{border-left-color:#F59E0B;background:#fffbeb}
.src-badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:.72rem;font-weight:700;margin-right:4px}
footer{background:var(--navy);color:rgba(255,255,255,.6);text-align:center;padding:22px;font-size:.8rem;margin-top:48px}
@media(max-width:640px){.charts-grid{grid-template-columns:1fr}}
.banner{padding:12px 28px;font-weight:700;font-size:.92rem;text-align:left}.banner ul{margin:6px 0 0;padding-left:20px;font-weight:400;font-size:.82rem}.banner-err{background:#b91c1c;color:#fff}.banner-anom{background:#ea580c;color:#fff}
.qa-notice{color:#854d0e;font-weight:700}.qa-ok{color:#166534;font-weight:700}.qa-warn{color:#92400e;font-weight:700}.qa-fail{color:#b91c1c;font-weight:700}
.rng{font-size:.78rem;color:#6b7280;margin:-8px 0 14px}
.cap{font-size:.76rem;color:#6b7280;margin:6px 2px 0;line-height:1.45}
.note-box{background:#fff7ed;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:12px 16px;margin:14px 0;font-size:.85rem}
.info-box{background:#eff6ff;border-left:4px solid #4285F4;border-radius:0 8px 8px 0;padding:12px 16px;margin:14px 0;font-size:.85rem}
.panel+.panel{margin-top:10px}
@page{size:A4;margin:12mm}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:12.5px}.section{padding:22px 0}.chart-box,tr,.kpi,.note-box,.info-box{break-inside:avoid}.qa-page{break-before:page}.cover{padding:30px 28px}h2,h3{break-after:avoid}.section h2+p,.section h2+.cap{break-after:avoid}.geo-sec,.crm-sec{break-inside:avoid}}`
