// Dashboard HTML files loader
// Import HTML files as strings for Cloudflare Workers deployment

import dashboardHtml from '../public/dashboard.html?raw'
import leadsDashboardHtml from '../public/leads-dashboard.html?raw'
import dataDashboardHtml from '../public/data-dashboard.html?raw'

export const Dashboards = {
  dashboard: dashboardHtml,
  leadsDashboard: leadsDashboardHtml,
  dataDashboard: dataDashboardHtml
}

export default Dashboards
