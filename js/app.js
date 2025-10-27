/**
 * Main Application Module
 * Handles all user interactions and dashboard functionality for the Statistics Dashboard
 */

class StatsDashboardApp {
    constructor() {
        this.currentTab = 'individual';
        this.selectedTeam = 'all';
        this.refreshInterval = null;
        this.isLoading = false;
        this.config = {
            refreshRate: 30000, // 30 seconds
            animationDuration: 300,
            autoRefresh: true
        };
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.showLoading(true);
            
            // Initialize event listeners
            this.initializeEventListeners();
            
            // Load configuration
            await this.loadConfiguration();
            
            // Initialize database manager
            if (!window.dbManager) {
                console.error('Database manager not found');
                return;
            }
            
            // Initialize charts manager
            if (!window.chartsManager) {
                console.error('Charts manager not found');
                return;
            }
            
            // Load initial data
            await this.loadInitialData();
            
            // Start auto-refresh if enabled
            if (this.config.autoRefresh) {
                this.startAutoRefresh();
            }
            
            this.showLoading(false);
            
            console.log('StatsDashboard initialized successfully');
        } catch (error) {
            console.error('Error initializing StatsDashboard:', error);
            this.showLoading(false);
            this.showError('Failed to initialize dashboard. Please refresh the page.');
        }
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Tab navigation
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleTabSwitch(e));
        });

        // Team selection
        const teamSelect = document.getElementById('teamSelect');
        if (teamSelect) {
            teamSelect.addEventListener('change', (e) => this.handleTeamChange(e));
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }

        // Export buttons
        const exportBtns = document.querySelectorAll('.export-btn');
        exportBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleExport(e));
        });

        // Window resize
        window.addEventListener('resize', () => this.handleWindowResize());

        // Visibility change (for pausing auto-refresh when tab is hidden)
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

        // Period selectors
        const periodSelectors = document.querySelectorAll('.period-selector');
        periodSelectors.forEach(selector => {
            selector.addEventListener('change', (e) => this.handlePeriodChange(e));
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    /**
     * Load configuration
     */
    async loadConfiguration() {
        try {
            const config = await window.dbManager.getDashboardConfig();
            this.config = { ...this.config, ...config };
        } catch (error) {
            console.warn('Using default configuration');
        }
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        try {
            // Load teams list
            await this.loadTeamsList();
            
            // Show Individual Performance by default (as requested)
            await this.showIndividualPerformance();
            
            // Initialize charts
            await window.chartsManager.initializeCharts();
            
            // Update last refresh time
            this.updateLastRefreshTime();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            throw error;
        }
    }

    /**
     * Handle tab switching
     */
    async handleTabSwitch(event) {
        const targetTab = event.target.closest('.tab-btn').dataset.tab;
        
        if (targetTab === this.currentTab) return;
        
        try {
            this.showLoading(true);
            
            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            event.target.closest('.tab-btn').classList.add('active');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show target tab content
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            this.currentTab = targetTab;
            
            // Load tab-specific data
            await this.loadTabData(targetTab);
            
            this.showLoading(false);
        } catch (error) {
            console.error('Error switching tabs:', error);
            this.showLoading(false);
            this.showError('Failed to load tab data');
        }
    }

    /**
     * Load data for specific tab
     */
    async loadTabData(tab) {
        switch (tab) {
            case 'individual':
                await this.showIndividualPerformance();
                break;
            case 'team':
                await this.showTeamPerformance();
                break;
            case 'incidents':
                await this.showIncidentStatistics();
                break;
            case 'system':
                await this.showSystemHealth();
                break;
            default:
                console.warn(`Unknown tab: ${tab}`);
        }
    }

    /**
     * Show Individual Performance Metrics (displayed by default)
     */
    async showIndividualPerformance() {
        try {
            const data = await window.dbManager.getIndividualPerformance();
            
            if (data.success) {
                const stats = data.data;
                
                // Update KPI cards
                this.updateElement('totalEmployees', stats.totalEmployees);
                this.updateElement('avgPerformance', stats.avgPerformance + '%');
                this.updateElement('completedTasks', stats.completedTasks);
                this.updateElement('avgResponseTime', stats.avgResponseTime + 'h');
                
                // Update top performers list
                this.updateTopPerformers(stats.topPerformers);
                
                // Update performance chart
                await window.chartsManager.createPerformanceChart();
            }
        } catch (error) {
            console.error('Error loading individual performance:', error);
            this.showError('Failed to load individual performance data');
        }
    }

    /**
     * Show Team Performance (combined statistics by default, specific team when selected)
     */
    async showTeamPerformance() {
        try {
            const data = await window.dbManager.getTeamStatistics(this.selectedTeam);
            
            if (data.success) {
                const stats = data.data;
                
                // Update team KPI cards
                this.updateElement('totalMembers', stats.totalMembers);
                this.updateElement('avgTeamPerformance', stats.avgTeamPerformance + '%');
                this.updateElement('projectsCompleted', stats.projectsCompleted);
                this.updateElement('collaborationScore', stats.collaborationScore + '%');
                
                // Update team comparison chart
                await window.chartsManager.createTeamComparisonChart();
                
                // Update workload distribution chart
                await window.chartsManager.createWorkloadDistributionChart();
                
                // Update top team performers
                this.updateTopTeamPerformers(stats.topTeamPerformers);
            }
        } catch (error) {
            console.error('Error loading team performance:', error);
            this.showError('Failed to load team performance data');
        }
    }

    /**
     * Show Incident Statistics
     */
    async showIncidentStatistics() {
        try {
            const data = await window.dbManager.getIncidentStatistics();
            
            if (data.success) {
                const stats = data.data;
                
                // Update incident KPI cards
                this.updateElement('totalIncidents', stats.totalIncidents);
                this.updateElement('resolvedIncidents', stats.resolvedIncidents);
                this.updateElement('avgResolutionTime', stats.avgResolutionTime + 'h');
                this.updateElement('criticalIncidents', stats.criticalIncidents);
                
                // Update incident charts
                await window.chartsManager.createIncidentTrendsChart();
                await window.chartsManager.createIncidentCategoriesChart();
            }
        } catch (error) {
            console.error('Error loading incident statistics:', error);
            this.showError('Failed to load incident statistics');
        }
    }

    /**
     * Show System Health
     */
    async showSystemHealth() {
        try {
            const data = await window.dbManager.getSystemHealth();
            
            if (data.success) {
                const stats = data.data;
                
                // Update system health KPI cards
                this.updateElement('systemUptime', stats.uptime + '%');
                this.updateElement('cpuUsage', stats.cpuUsage + '%');
                this.updateElement('memoryUsage', stats.memoryUsage + '%');
                this.updateElement('networkLatency', stats.networkLatency + 'ms');
                
                // Update system health chart
                await window.chartsManager.createSystemHealthChart();
            }
        } catch (error) {
            console.error('Error loading system health:', error);
            this.showError('Failed to load system health data');
        }
    }

    /**
     * Handle team selection change
     */
    async handleTeamChange(event) {
        this.selectedTeam = event.target.value;
        
        if (this.currentTab === 'team') {
            this.showLoading(true);
            await this.showTeamPerformance();
            this.showLoading(false);
        }
    }

    /**
     * Load teams list
     */
    async loadTeamsList() {
        try {
            const teams = await window.dbManager.getTeamsList();
            const teamSelect = document.getElementById('teamSelect');
            
            if (teamSelect && teams) {
                teamSelect.innerHTML = '<option value="all">All Teams (Combined)</option>';
                
                teams.forEach(team => {
                    const option = document.createElement('option');
                    option.value = team.id;
                    option.textContent = `${team.name} (${team.members} members)`;
                    teamSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading teams list:', error);
        }
    }

    /**
     * Update top performers list
     */
    updateTopPerformers(performers) {
        const container = document.getElementById('topPerformersList');
        if (!container || !performers) return;
        
        container.innerHTML = performers.map(performer => `
            <div class="performer-item">
                <div class="performer-info">
                    <div class="performer-name">${performer.name}</div>
                    <div class="performer-department">${performer.department}</div>
                </div>
                <div class="performer-stats">
                    <div class="performer-score">${performer.score}%</div>
                    <div class="performer-tasks">${performer.tasksCompleted} tasks</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update top team performers list
     */
    updateTopTeamPerformers(teamPerformers) {
        const container = document.getElementById('topTeamPerformersList');
        if (!container || !teamPerformers) return;
        
        container.innerHTML = teamPerformers.map(team => `
            <div class="team-performer-item">
                <div class="team-info">
                    <div class="team-name">${team.teamName}</div>
                    <div class="team-members">${team.members} members</div>
                </div>
                <div class="team-stats">
                    <div class="team-score">${team.avgScore}%</div>
                    <div class="team-projects">${team.projectsCompleted} projects</div>
                    <div class="team-trend ${team.trend}">
                        <i class="fas fa-arrow-${team.trend === 'up' ? 'up' : 'down'}"></i>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update element content
     */
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
        
        if (mainContent) {
            mainContent.classList.toggle('sidebar-collapsed');
        }
        
        // Resize charts after sidebar toggle
        setTimeout(() => {
            window.chartsManager.resizeCharts();
        }, 300);
    }

    /**
     * Handle search
     */
    async handleSearch(event) {
        const query = event.target.value.trim();
        
        if (query.length < 2) return;
        
        try {
            const results = await window.dbManager.searchEmployees(query);
            this.showSearchResults(results);
        } catch (error) {
            console.error('Error searching:', error);
        }
    }

    /**
     * Show search results
     */
    showSearchResults(results) {
        // Implementation for search results display
        console.log('Search results:', results);
    }

    /**
     * Refresh dashboard
     */
    async refreshDashboard() {
        try {
            this.showLoading(true);
            
            // Clear cache
            window.dbManager.clearCache();
            
            // Reload current tab data
            await this.loadTabData(this.currentTab);
            
            // Update charts
            await window.chartsManager.initializeCharts();
            
            // Update last refresh time
            this.updateLastRefreshTime();
            
            this.showLoading(false);
            this.showSuccess('Dashboard refreshed successfully');
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
            this.showLoading(false);
            this.showError('Failed to refresh dashboard');
        }
    }

    /**
     * Handle export
     */
    handleExport(event) {
        const exportType = event.target.dataset.export;
        
        switch (exportType) {
            case 'pdf':
                this.exportToPDF();
                break;
            case 'excel':
                this.exportToExcel();
                break;
            case 'image':
                this.exportToImage();
                break;
            default:
                console.warn(`Unknown export type: ${exportType}`);
        }
    }

    /**
     * Export to PDF
     */
    exportToPDF() {
        // Implementation for PDF export
        console.log('Exporting to PDF...');
        this.showInfo('PDF export feature coming soon');
    }

    /**
     * Export to Excel
     */
    exportToExcel() {
        // Implementation for Excel export
        console.log('Exporting to Excel...');
        this.showInfo('Excel export feature coming soon');
    }

    /**
     * Export to Image
     */
    exportToImage() {
        // Implementation for image export
        console.log('Exporting to Image...');
        this.showInfo('Image export feature coming soon');
    }

    /**
     * Handle window resize
     */
    handleWindowResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            window.chartsManager.resizeCharts();
        }, 250);
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.stopAutoRefresh();
        } else if (this.config.autoRefresh) {
            this.startAutoRefresh();
        }
    }

    /**
     * Handle period change
     */
    async handlePeriodChange(event) {
        const period = event.target.value;
        
        try {
            this.showLoading(true);
            
            // Reload data with new period
            await this.loadTabData(this.currentTab);
            
            this.showLoading(false);
        } catch (error) {
            console.error('Error changing period:', error);
            this.showLoading(false);
        }
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const body = document.body;
        const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        body.classList.toggle('dark-theme');
        window.chartsManager.applyTheme(newTheme);
        
        // Save theme preference
        localStorage.setItem('dashboard-theme', newTheme);
    }

    /**
     * Start auto-refresh
     */
    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        this.refreshInterval = setInterval(async () => {
            if (!document.hidden && !this.isLoading) {
                await this.refreshDashboard();
            }
        }, this.config.refreshRate);
    }

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Show loading overlay
     */
    showLoading(show = true) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
        this.isLoading = show;
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show info message
     */
    showInfo(message) {
        this.showNotification(message, 'info');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Get notification icon
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * Update last refresh time
     */
    updateLastRefreshTime() {
        const timeElement = document.getElementById('lastRefreshTime');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString();
        }
    }

    /**
     * Get real-time updates
     */
    async getRealTimeUpdates() {
        try {
            const updates = await window.dbManager.getRealTimeUpdates();
            if (updates) {
                // Process real-time updates
                console.log('Real-time updates received:', updates);
            }
        } catch (error) {
            console.error('Error getting real-time updates:', error);
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.stopAutoRefresh();
        window.chartsManager.destroyAllCharts();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    const savedTheme = localStorage.getItem('dashboard-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Initialize the stats dashboard
    window.statsDashboard = new StatsDashboardApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.statsDashboard) {
        window.statsDashboard.cleanup();
    }
});

// Export for global access
window.StatsDashboardApp = StatsDashboardApp;