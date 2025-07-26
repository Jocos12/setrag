/**
 * Database Communication Module
 * Handles all database operations for the Statistics Dashboard
 */

class DatabaseManager {
    constructor() {
        this.baseURL = window.location.origin;
        this.apiEndpoint = '/api';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Generic API request handler
     */
    async makeRequest(endpoint, options = {}) {
        const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const url = `${this.baseURL}${this.apiEndpoint}${endpoint}`;
            const config = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                ...options
            };

            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error(`Database request failed for ${endpoint}:`, error);
            return this.getFallbackData(endpoint);
        }
    }

    /**
     * Get fallback data when database is unavailable
     */
    getFallbackData(endpoint) {
        const fallbackData = {
            '/employees/performance': {
                success: true,
                data: {
                    totalEmployees: 150,
                    avgPerformance: 85.7,
                    completedTasks: 2847,
                    avgResponseTime: 2.3,
                    performanceMetrics: this.generatePerformanceData(),
                    topPerformers: this.generateTopPerformers()
                }
            },
            '/teams/statistics': {
                success: true,
                data: {
                    totalMembers: 150,
                    avgTeamPerformance: 87.2,
                    projectsCompleted: 45,
                    collaborationScore: 92.1,
                    teamComparison: this.generateTeamComparison(),
                    topTeamPerformers: this.generateTopTeamPerformers()
                }
            },
            '/incidents/statistics': {
                success: true,
                data: {
                    totalIncidents: 127,
                    resolvedIncidents: 115,
                    avgResolutionTime: 4.2,
                    criticalIncidents: 8,
                    incidentTrends: this.generateIncidentTrends(),
                    incidentCategories: this.generateIncidentCategories()
                }
            },
            '/system/health': {
                success: true,
                data: {
                    uptime: 99.7,
                    cpuUsage: 45.2,
                    memoryUsage: 67.8,
                    networkLatency: 12,
                    healthTimeline: this.generateSystemHealthData()
                }
            }
        };

        return fallbackData[endpoint] || { success: false, error: 'No fallback data available' };
    }

    /**
     * Get Individual Performance Metrics
     */
    async getIndividualPerformance(period = 30) {
        const endpoint = `/employees/performance?period=${period}`;
        return await this.makeRequest(endpoint);
    }

    /**
     * Get Team Statistics
     */
    async getTeamStatistics(teamId = 'all') {
        const endpoint = teamId === 'all' 
            ? '/teams/statistics' 
            : `/teams/statistics?team_id=${teamId}`;
        return await this.makeRequest(endpoint);
    }

    /**
     * Get All Teams List
     */
    async getTeamsList() {
        const endpoint = '/teams/list';
        try {
            const response = await this.makeRequest(endpoint);
            return response.success ? response.data : this.getFallbackTeams();
        } catch (error) {
            return this.getFallbackTeams();
        }
    }

    /**
     * Get Incident Statistics
     */
    async getIncidentStatistics(period = 30) {
        const endpoint = `/incidents/statistics?period=${period}`;
        return await this.makeRequest(endpoint);
    }

    /**
     * Get System Health Data
     */
    async getSystemHealth(period = 24) {
        const endpoint = `/system/health?period=${period}`;
        return await this.makeRequest(endpoint);
    }

    /**
     * Get Employee Details
     */
    async getEmployeeDetails(employeeId) {
        const endpoint = `/employees/${employeeId}`;
        return await this.makeRequest(endpoint);
    }

    /**
     * Get Team Details
     */
    async getTeamDetails(teamId) {
        const endpoint = `/teams/${teamId}`;
        return await this.makeRequest(endpoint);
    }

    /**
     * Get Performance Trends
     */
    async getPerformanceTrends(type = 'individual', period = 90) {
        const endpoint = `/performance/trends?type=${type}&period=${period}`;
        return await this.makeRequest(endpoint);
    }

    /**
     * Generate Performance Data for Charts
     */
    generatePerformanceData() {
        const data = [];
        const labels = [];
        const now = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            // Simulate realistic performance data
            const basePerformance = 75 + Math.random() * 20;
            const weekendFactor = [0, 6].includes(date.getDay()) ? 0.8 : 1;
            data.push(Math.round(basePerformance * weekendFactor * 100) / 100);
        }
        
        return { labels, data };
    }

    /**
     * Generate Top Performers Data
     */
    generateTopPerformers() {
        const names = [
            'Alex Johnson', 'Sarah Davis', 'Michael Chen', 'Emma Wilson', 
            'David Rodriguez', 'Lisa Thompson', 'James Anderson', 'Maria Garcia',
            'Robert Kim', 'Jennifer Lee'
        ];
        
        const departments = ['Engineering', 'Sales', 'Marketing', 'Support', 'Design'];
        
        return names.slice(0, 8).map((name, index) => ({
            id: index + 1,
            name: name,
            department: departments[Math.floor(Math.random() * departments.length)],
            score: Math.round((95 - index * 2 - Math.random() * 5) * 100) / 100,
            tasksCompleted: Math.floor(Math.random() * 50) + 30,
            efficiency: Math.round((90 - index * 1.5 - Math.random() * 3) * 100) / 100
        }));
    }

    /**
     * Generate Team Comparison Data
     */
    generateTeamComparison() {
        const teams = ['Engineering', 'Sales', 'Marketing', 'Support', 'Design', 'Operations'];
        
        return teams.map(team => ({
            name: team,
            performance: Math.round((70 + Math.random() * 25) * 100) / 100,
            members: Math.floor(Math.random() * 20) + 10,
            projects: Math.floor(Math.random() * 10) + 3,
            satisfaction: Math.round((80 + Math.random() * 15) * 100) / 100
        }));
    }

    /**
     * Generate Top Team Performers
     */
    generateTopTeamPerformers() {
        const teams = ['Engineering', 'Sales', 'Marketing', 'Support', 'Design'];
        
        return teams.map((team, index) => ({
            teamName: team,
            avgScore: Math.round((90 - index * 2 - Math.random() * 3) * 100) / 100,
            members: Math.floor(Math.random() * 15) + 8,
            projectsCompleted: Math.floor(Math.random() * 8) + 5,
            trend: Math.random() > 0.3 ? 'up' : 'down'
        }));
    }

    /**
     * Generate Incident Trends Data
     */
    generateIncidentTrends() {
        const data = [];
        const labels = [];
        const categories = ['Critical', 'High', 'Medium', 'Low'];
        const now = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        
        categories.forEach(category => {
            const categoryData = [];
            for (let i = 0; i < 30; i++) {
                let incidents;
                switch (category) {
                    case 'Critical':
                        incidents = Math.floor(Math.random() * 3);
                        break;
                    case 'High':
                        incidents = Math.floor(Math.random() * 8) + 2;
                        break;
                    case 'Medium':
                        incidents = Math.floor(Math.random() * 15) + 5;
                        break;
                    case 'Low':
                        incidents = Math.floor(Math.random() * 25) + 10;
                        break;
                }
                categoryData.push(incidents);
            }
            data.push({
                label: category,
                data: categoryData,
                borderColor: this.getIncidentColor(category),
                backgroundColor: this.getIncidentColor(category, 0.2)
            });
        });
        
        return { labels, datasets: data };
    }

    /**
     * Generate Incident Categories Data
     */
    generateIncidentCategories() {
        const categories = [
            { name: 'System Outage', count: 23, color: '#e74c3c' },
            { name: 'Performance Issues', count: 45, color: '#f39c12' },
            { name: 'Security Alerts', count: 12, color: '#8e44ad' },
            { name: 'Network Problems', count: 31, color: '#3498db' },
            { name: 'Database Issues', count: 16, color: '#27ae60' }
        ];
        
        return categories;
    }

    /**
     * Generate System Health Timeline Data
     */
    generateSystemHealthData() {
        const data = [];
        const labels = [];
        const metrics = ['CPU Usage', 'Memory Usage', 'Network Latency', 'Disk Usage'];
        const now = new Date();
        
        // Generate hourly data for the last 24 hours
        for (let i = 23; i >= 0; i--) {
            const date = new Date(now);
            date.setHours(date.getHours() - i);
            labels.push(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        }
        
        metrics.forEach(metric => {
            const metricData = [];
            let baseValue;
            
            switch (metric) {
                case 'CPU Usage':
                    baseValue = 45;
                    break;
                case 'Memory Usage':
                    baseValue = 65;
                    break;
                case 'Network Latency':
                    baseValue = 12;
                    break;
                case 'Disk Usage':
                    baseValue = 78;
                    break;
            }
            
            for (let i = 0; i < 24; i++) {
                const variation = (Math.random() - 0.5) * 20;
                const value = Math.max(0, Math.min(100, baseValue + variation));
                metricData.push(Math.round(value * 100) / 100);
            }
            
            data.push({
                label: metric,
                data: metricData,
                borderColor: this.getMetricColor(metric),
                backgroundColor: this.getMetricColor(metric, 0.1),
                fill: false
            });
        });
        
        return { labels, datasets: data };
    }

    /**
     * Get Fallback Teams Data
     */
    getFallbackTeams() {
        return [
            { id: 1, name: 'Engineering Team', members: 25 },
            { id: 2, name: 'Sales Team', members: 18 },
            { id: 3, name: 'Marketing Team', members: 12 },
            { id: 4, name: 'Support Team', members: 15 },
            { id: 5, name: 'Design Team', members: 8 },
            { id: 6, name: 'Operations Team', members: 10 }
        ];
    }

    /**
     * Get Color for Incident Types
     */
    getIncidentColor(category, alpha = 1) {
        const colors = {
            'Critical': `rgba(231, 76, 60, ${alpha})`,
            'High': `rgba(243, 156, 18, ${alpha})`,
            'Medium': `rgba(52, 152, 219, ${alpha})`,
            'Low': `rgba(39, 174, 96, ${alpha})`
        };
        return colors[category] || `rgba(149, 165, 166, ${alpha})`;
    }

    /**
     * Get Color for System Metrics
     */
    getMetricColor(metric, alpha = 1) {
        const colors = {
            'CPU Usage': `rgba(231, 76, 60, ${alpha})`,
            'Memory Usage': `rgba(243, 156, 18, ${alpha})`,
            'Network Latency': `rgba(52, 152, 219, ${alpha})`,
            'Disk Usage': `rgba(155, 89, 182, ${alpha})`
        };
        return colors[metric] || `rgba(149, 165, 166, ${alpha})`;
    }

    /**
     * Clear Cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get Real-time Updates
     */
    async getRealTimeUpdates() {
        const endpoints = [
            '/employees/performance',
            '/teams/statistics', 
            '/incidents/statistics',
            '/system/health'
        ];
        
        const promises = endpoints.map(endpoint => this.makeRequest(endpoint));
        
        try {
            const results = await Promise.all(promises);
            return {
                individual: results[0],
                team: results[1], 
                incidents: results[2],
                system: results[3]
            };
        } catch (error) {
            console.error('Failed to get real-time updates:', error);
            return null;
        }
    }

    /**
     * Submit Performance Feedback
     */
    async submitFeedback(employeeId, feedback) {
        const endpoint = '/employees/feedback';
        return await this.makeRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify({ employeeId, feedback })
        });
    }

    /**
     * Update Team Assignment
     */
    async updateTeamAssignment(employeeId, newTeamId) {
        const endpoint = '/employees/team';
        return await this.makeRequest(endpoint, {
            method: 'PUT',
            body: JSON.stringify({ employeeId, teamId: newTeamId })
        });
    }

    /**
     * Generate Report
     */
    async generateReport(type, period, format = 'json') {
        const endpoint = `/reports/generate?type=${type}&period=${period}&format=${format}`;
        return await this.makeRequest(endpoint);
    }

    /**
     * Search Employees
     */
    async searchEmployees(query) {
        const endpoint = `/employees/search?q=${encodeURIComponent(query)}`;
        return await this.makeRequest(endpoint);
    }

    /**
     * Get Dashboard Configuration
     */
    async getDashboardConfig() {
        const endpoint = '/dashboard/config';
        try {
            const response = await this.makeRequest(endpoint);
            return response.success ? response.data : this.getDefaultConfig();
        } catch (error) {
            return this.getDefaultConfig();
        }
    }

    /**
     * Get Default Dashboard Configuration
     */
    getDefaultConfig() {
        return {
            refreshInterval: 30000, // 30 seconds
            chartAnimations: true,
            autoRefresh: true,
            theme: 'light',
            dateFormat: 'MM/dd/yyyy',
            timezone: 'UTC'
        };
    }
}

// Export for use in other modules
window.DatabaseManager = DatabaseManager;

// Create global instance
window.dbManager = new DatabaseManager();