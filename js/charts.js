/**
 * Charts Module
 * Handles all chart rendering and visualization for the Statistics Dashboard
 */

class ChartsManager {
    constructor() {
        this.charts = new Map();
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            family: "'Inter', 'Segoe UI', sans-serif"
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#3498db',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y;
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            size: 11,
                            family: "'Inter', 'Segoe UI', sans-serif"
                        }
                    }
                },
                y: {
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            size: 11,
                            family: "'Inter', 'Segoe UI', sans-serif"
                        }
                    }
                }
            }
        };
    }

    /**
     * Initialize all charts for the dashboard
     */
    async initializeCharts() {
        try {
            await this.createPerformanceChart();
            await this.createTeamComparisonChart();
            await this.createIncidentTrendsChart();
            await this.createIncidentCategoriesChart();
            await this.createSystemHealthChart();
            await this.createWorkloadDistributionChart();
            await this.createEfficiencyChart();
            await this.createResponseTimeChart();
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    /**
     * Create Individual Performance Chart
     */
    async createPerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        try {
            const data = await window.dbManager.getIndividualPerformance();
            const performanceData = data.data.performanceMetrics;

            const chartConfig = {
                type: 'line',
                data: {
                    labels: performanceData.labels,
                    datasets: [{
                        label: 'Performance Score',
                        data: performanceData.data,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#3498db',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: {
                    ...this.chartOptions,
                    scales: {
                        ...this.chartOptions.scales,
                        y: {
                            ...this.chartOptions.scales.y,
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                ...this.chartOptions.scales.y.ticks,
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            };

            if (this.charts.has('performance')) {
                this.charts.get('performance').destroy();
            }

            this.charts.set('performance', new Chart(ctx, chartConfig));
        } catch (error) {
            console.error('Error creating performance chart:', error);
        }
    }

    /**
     * Create Team Comparison Chart
     */
    async createTeamComparisonChart() {
        const canvas = document.getElementById('teamComparisonChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        try {
            const data = await window.dbManager.getTeamStatistics();
            const teamData = data.data.teamComparison;

            const chartConfig = {
                type: 'bar',
                data: {
                    labels: teamData.map(team => team.name),
                    datasets: [{
                        label: 'Team Performance (%)',
                        data: teamData.map(team => team.performance),
                        backgroundColor: [
                            'rgba(52, 152, 219, 0.8)',
                            'rgba(46, 204, 113, 0.8)',
                            'rgba(155, 89, 182, 0.8)',
                            'rgba(241, 196, 15, 0.8)',
                            'rgba(231, 76, 60, 0.8)',
                            'rgba(243, 156, 18, 0.8)'
                        ],
                        borderColor: [
                            '#3498db',
                            '#2ecc71',
                            '#9b59b6',
                            '#f1c40f',
                            '#e74c3c',
                            '#f39c12'
                        ],
                        borderWidth: 2,
                        borderRadius: 6,
                        borderSkipped: false
                    }]
                },
                options: {
                    ...this.chartOptions,
                    scales: {
                        ...this.chartOptions.scales,
                        y: {
                            ...this.chartOptions.scales.y,
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                ...this.chartOptions.scales.y.ticks,
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            };

            if (this.charts.has('teamComparison')) {
                this.charts.get('teamComparison').destroy();
            }

            this.charts.set('teamComparison', new Chart(ctx, chartConfig));
        } catch (error) {
            console.error('Error creating team comparison chart:', error);
        }
    }

    /**
     * Create Incident Trends Chart
     */
    async createIncidentTrendsChart() {
        const canvas = document.getElementById('incidentTrendsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        try {
            const data = await window.dbManager.getIncidentStatistics();
            const trendsData = data.data.incidentTrends;

            const chartConfig = {
                type: 'line',
                data: trendsData,
                options: {
                    ...this.chartOptions,
                    scales: {
                        ...this.chartOptions.scales,
                        y: {
                            ...this.chartOptions.scales.y,
                            beginAtZero: true,
                            ticks: {
                                ...this.chartOptions.scales.y.ticks,
                                stepSize: 1
                            }
                        }
                    }
                }
            };

            if (this.charts.has('incidentTrends')) {
                this.charts.get('incidentTrends').destroy();
            }

            this.charts.set('incidentTrends', new Chart(ctx, chartConfig));
        } catch (error) {
            console.error('Error creating incident trends chart:', error);
        }
    }

    /**
     * Create Incident Categories Pie Chart
     */
    async createIncidentCategoriesChart() {
        const canvas = document.getElementById('incidentCategoriesChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        try {
            const data = await window.dbManager.getIncidentStatistics();
            const categoriesData = data.data.incidentCategories;

            const chartConfig = {
                type: 'doughnut',
                data: {
                    labels: categoriesData.map(cat => cat.name),
                    datasets: [{
                        data: categoriesData.map(cat => cat.count),
                        backgroundColor: categoriesData.map(cat => cat.color),
                        borderColor: '#fff',
                        borderWidth: 2,
                        hoverBorderWidth: 3
                    }]
                },
                options: {
                    ...this.chartOptions,
                    cutout: '60%',
                    plugins: {
                        ...this.chartOptions.plugins,
                        legend: {
                            ...this.chartOptions.plugins.legend,
                            position: 'right'
                        }
                    }
                }
            };

            if (this.charts.has('incidentCategories')) {
                this.charts.get('incidentCategories').destroy();
            }

            this.charts.set('incidentCategories', new Chart(ctx, chartConfig));
        } catch (error) {
            console.error('Error creating incident categories chart:', error);
        }
    }

    /**
     * Create System Health Timeline Chart
     */
    async createSystemHealthChart() {
        const canvas = document.getElementById('systemHealthChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        try {
            const data = await window.dbManager.getSystemHealth();
            const healthData = data.data.healthTimeline;

            const chartConfig = {
                type: 'line',
                data: healthData,
                options: {
                    ...this.chartOptions,
                    scales: {
                        ...this.chartOptions.scales,
                        y: {
                            ...this.chartOptions.scales.y,
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                ...this.chartOptions.scales.y.ticks,
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            };

            if (this.charts.has('systemHealth')) {
                this.charts.get('systemHealth').destroy();
            }

            this.charts.set('systemHealth', new Chart(ctx, chartConfig));
        } catch (error) {
            console.error('Error creating system health chart:', error);
        }
    }

    /**
     * Create Workload Distribution Chart
     */
    async createWorkloadDistributionChart() {
        const canvas = document.getElementById('workloadChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        try {
            const data = await window.dbManager.getTeamStatistics();
            const teamData = data.data.teamComparison;

            const chartConfig = {
                type: 'polarArea',
                data: {
                    labels: teamData.map(team => team.name),
                    datasets: [{
                        data: teamData.map(team => team.projects),
                        backgroundColor: [
                            'rgba(52, 152, 219, 0.6)',
                            'rgba(46, 204, 113, 0.6)',
                            'rgba(155, 89, 182, 0.6)',
                            'rgba(241, 196, 15, 0.6)',
                            'rgba(231, 76, 60, 0.6)',
                            'rgba(243, 156, 18, 0.6)'
                        ],
                        borderColor: [
                            '#3498db',
                            '#2ecc71',
                            '#9b59b6',
                            '#f1c40f',
                            '#e74c3c',
                            '#f39c12'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    ...this.chartOptions,
                    scales: {
                        r: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                font: {
                                    size: 10
                                }
                            }
                        }
                    }
                }
            };

            if (this.charts.has('workload')) {
                this.charts.get('workload').destroy();
            }

            this.charts.set('workload', new Chart(ctx, chartConfig));
        } catch (error) {
            console.error('Error creating workload chart:', error);
        }
    }

    /**
     * Create Efficiency Trend Chart
     */
    async createEfficiencyChart() {
        const canvas = document.getElementById('efficiencyChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        try {
            const data = await window.dbManager.getPerformanceTrends('individual', 30);
            
            // Generate efficiency data
            const labels = [];
            const efficiencyData = [];
            const now = new Date();
            
            for (let i = 29; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                
                const efficiency = 75 + Math.random() * 20;
                efficiencyData.push(Math.round(efficiency * 100) / 100);
            }

            const chartConfig = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Efficiency %',
                        data: efficiencyData,
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#27ae60',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    }]
                },
                options: {
                    ...this.chartOptions,
                    scales: {
                        ...this.chartOptions.scales,
                        y: {
                            ...this.chartOptions.scales.y,
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                ...this.chartOptions.scales.y.ticks,
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            };

            if (this.charts.has('efficiency')) {
                this.charts.get('efficiency').destroy();
            }

            this.charts.set('efficiency', new Chart(ctx, chartConfig));
        } catch (error) {
            console.error('Error creating efficiency chart:', error);
        }
    }

    /**
     * Create Response Time Chart
     */
    async createResponseTimeChart() {
        const canvas = document.getElementById('responseTimeChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        try {
            // Generate response time data
            const labels = [];
            const responseTimeData = [];
            const now = new Date();
            
            for (let i = 23; i >= 0; i--) {
                const date = new Date(now);
                date.setHours(date.getHours() - i);
                labels.push(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
                
                const responseTime = 1.5 + Math.random() * 3;
                responseTimeData.push(Math.round(responseTime * 100) / 100);
            }

            const chartConfig = {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Response Time (hours)',
                        data: responseTimeData,
                        backgroundColor: 'rgba(243, 156, 18, 0.8)',
                        borderColor: '#f39c12',
                        borderWidth: 2,
                        borderRadius: 4,
                        borderSkipped: false
                    }]
                },
                options: {
                    ...this.chartOptions,
                    scales: {
                        ...this.chartOptions.scales,
                        y: {
                            ...this.chartOptions.scales.y,
                            beginAtZero: true,
                            ticks: {
                                ...this.chartOptions.scales.y.ticks,
                                callback: function(value) {
                                    return value + 'h';
                                }
                            }
                        }
                    }
                }
            };

            if (this.charts.has('responseTime')) {
                this.charts.get('responseTime').destroy();
            }

            this.charts.set('responseTime', new Chart(ctx, chartConfig));
        } catch (error) {
            console.error('Error creating response time chart:', error);
        }
    }

    /**
     * Update chart with new data
     */
    async updateChart(chartName, newData) {
        const chart = this.charts.get(chartName);
        if (!chart) return;

        try {
            chart.data = newData;
            chart.update('active');
        } catch (error) {
            console.error(`Error updating ${chartName} chart:`, error);
        }
    }

    /**
     * Destroy specific chart
     */
    destroyChart(chartName) {
        const chart = this.charts.get(chartName);
        if (chart) {
            chart.destroy();
            this.charts.delete(chartName);
        }
    }

    /**
     * Destroy all charts
     */
    destroyAllCharts() {
        this.charts.forEach((chart, name) => {
            chart.destroy();
        });
        this.charts.clear();
    }

    /**
     * Resize all charts
     */
    resizeCharts() {
        this.charts.forEach((chart) => {
            chart.resize();
        });
    }

    /**
     * Get chart colors based on context
     */
    getChartColors(type = 'primary') {
        const colorSchemes = {
            primary: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'],
            secondary: ['#34495e', '#95a5a6', '#7f8c8d', '#bdc3c7', '#ecf0f1', '#d5dbdb'],
            success: ['#27ae60', '#2ecc71', '#52c41a', '#73d13d', '#95de64', '#b7eb8f'],
            warning: ['#f39c12', '#e67e22', '#d68910', '#ca6f1e', '#bb6d0a', '#a0522d'],
            danger: ['#e74c3c', '#c0392b', '#dc3545', '#bd2130', '#a71c2a', '#921925']
        };

        return colorSchemes[type] || colorSchemes.primary;
    }

    /**
     * Apply theme to charts
     */
    applyTheme(theme = 'light') {
        const themes = {
            light: {
                backgroundColor: '#ffffff',
                textColor: '#2c3e50',
                gridColor: 'rgba(0, 0, 0, 0.1)',
                borderColor: '#ecf0f1'
            },
            dark: {
                backgroundColor: '#2c3e50',
                textColor: '#ecf0f1',
                gridColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: '#34495e'
            }
        };

        const currentTheme = themes[theme] || themes.light;

        // Update chart options
        this.chartOptions.plugins.legend.labels.color = currentTheme.textColor;
        this.chartOptions.scales.x.grid.color = currentTheme.gridColor;
        this.chartOptions.scales.y.grid.color = currentTheme.gridColor;
        this.chartOptions.scales.x.ticks.color = currentTheme.textColor;
        this.chartOptions.scales.y.ticks.color = currentTheme.textColor;

        // Update all existing charts
        this.charts.forEach((chart) => {
            chart.options = { ...chart.options, ...this.chartOptions };
            chart.update();
        });
    }

    /**
     * Export chart as image
     */
    exportChart(chartName, format = 'png') {
        const chart = this.charts.get(chartName);
        if (!chart) return null;

        try {
            const canvas = chart.canvas;
            const url = canvas.toDataURL(`image/${format}`);
            
            // Create download link
            const link = document.createElement('a');
            link.download = `${chartName}-chart.${format}`;
            link.href = url;
            
            return { url, link };
        } catch (error) {
            console.error(`Error exporting ${chartName} chart:`, error);
            return null;
        }
    }

    /**
     * Get chart data for reporting
     */
    getChartData(chartName) {
        const chart = this.charts.get(chartName);
        if (!chart) return null;

        return {
            labels: chart.data.labels,
            datasets: chart.data.datasets.map(dataset => ({
                label: dataset.label,
                data: dataset.data,
                backgroundColor: dataset.backgroundColor,
                borderColor: dataset.borderColor
            }))
        };
    }

    /**
     * Animate chart updates
     */
    animateChart(chartName, duration = 1000) {
        const chart = this.charts.get(chartName);
        if (!chart) return;

        chart.update('active', {
            duration: duration,
            easing: 'easeInOutQuart'
        });
    }
}

// Export for use in other modules
window.ChartsManager = ChartsManager;

// Create global instance
window.chartsManager = new ChartsManager();