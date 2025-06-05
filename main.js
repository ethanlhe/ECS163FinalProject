import { initHeatmap } from './visualizations/heatmap.js';
import { InternetUsageBarChart } from './visualizations/barchart.js';
import { InternetGDPStreamGraph } from './visualizations/streamgraph.js';

// Shared state for coordination between charts
let currentVisualization = null;
let barChart = null;
let streamGraph = null;
let currentYear = 2000;

// Initialize the dashboard with all visualizations
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupYearSelector();
});

async function initializeDashboard() {
    const heatmapContainer = document.getElementById('heatmap-container');
    const barChartContainer = document.getElementById('barchart-container');
    const streamGraphContainer = document.getElementById('streamgraph-container');
    
    // Show loading state
    showLoading(heatmapContainer);
    showLoading(barChartContainer);
    showLoading(streamGraphContainer);
    
    try {
        // Initialize all three visualizations in parallel
        const [heatmapViz, barChartViz, streamGraphViz] = await Promise.all([
            initHeatmap(heatmapContainer, currentYear),
            initBarChart(barChartContainer),
            initStreamGraph(streamGraphContainer)
        ]);
        
        // Store references for later use
        currentVisualization = heatmapViz;
        barChart = barChartViz;
        streamGraph = streamGraphViz;
        
        // Set up interaction coordination
        setupInteractionCoordination();
        
        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError(heatmapContainer, 'Error loading heatmap visualization.');
        showError(barChartContainer, 'Error loading bar chart visualization.');
        showError(streamGraphContainer, 'Error loading streamgraph visualization.');
    }
}

async function initBarChart(container) {
    // Clear container
    container.innerHTML = '';
    
    // Create a new bar chart instance with custom container
    const chart = new InternetUsageBarChart();
    
    // Override the container selection to use our provided container
    const originalCreateSVG = chart.createSVG;
    chart.createSVG = function() {
        this.calculateDimensions();
        this.svg = d3.select(container)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
    };
    
    // Override the tooltip creation
    const originalCreateTooltip = chart.createTooltip;
    chart.createTooltip = function() {
        this.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "#fff")
            .style("padding", "5px")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("pointer-events", "none");
    };
    
    // Override calculateDimensions for responsive container
    chart.calculateDimensions = function() {
        const containerWidth = container.clientWidth;
        const containerHeight = Math.min(containerWidth * 0.6, 400);
        
        const isMobile = containerWidth < 768;
        this.margin = isMobile 
            ? { top: 40, right: 20, bottom: 60, left: 60 }
            : { top: 60, right: 60, bottom: 80, left: 80 };
            
        this.width = containerWidth - this.margin.left - this.margin.right;
        this.height = containerHeight - this.margin.top - this.margin.bottom;
    };
    
    // Add updateForCountry method
    chart.updateForCountry = function(countryName) {
        if (!this.currentData) return;
        
        // Get country continent mapping
        const countryContinent = this.getCountryContinent(countryName);
        
        if (countryContinent) {
            // Highlight the relevant continent
            this.highlightContinent(countryContinent);
        } else {
            // Reset highlighting if no continent found
            this.resetHighlighting();
        }
    };
    
    // Add helper method to get country continent
    chart.getCountryContinent = function(countryName) {
        // This is a simplified mapping - you might want to expand this
        const countryToContinentMap = {
            'United States': 'North America',
            'Canada': 'North America',
            'Mexico': 'North America',
            'Brazil': 'South America',
            'Argentina': 'South America',
            'Chile': 'South America',
            'United Kingdom': 'Europe',
            'France': 'Europe',
            'Germany': 'Europe',
            'Italy': 'Europe',
            'Spain': 'Europe',
            'Russia': 'Europe',
            'China': 'Asia',
            'India': 'Asia',
            'Japan': 'Asia',
            'Korea, Rep.': 'Asia',
            'Thailand': 'Asia',
            'Nigeria': 'Africa',
            'Egypt': 'Africa',
            'South Africa': 'Africa',
            'Kenya': 'Africa',
            'Australia': 'Oceania',
            'New Zealand': 'Oceania'
        };
        return countryToContinentMap[countryName];
    };
    
    // Add continent highlighting method
    chart.highlightContinent = function(continent) {
        if (!this.svg) return;
        
        // Reset all bars to dimmed state
        this.svg.selectAll("rect")
            .classed("continent-dimmed", true)
            .classed("continent-highlighted", false);
        
        // Highlight bars for the selected continent
        this.svg.selectAll(".continent")
            .filter(d => d.continent === continent)
            .selectAll("rect")
            .classed("continent-dimmed", false)
            .classed("continent-highlighted", true);
    };
    
    // Add reset highlighting method
    chart.resetHighlighting = function() {
        if (!this.svg) return;
        
        this.svg.selectAll("rect")
            .classed("continent-dimmed", false)
            .classed("continent-highlighted", false);
    };
    
    // Initialize the chart
    await chart.init();
    
    return chart;
}

async function initStreamGraph(container) {
    // Clear container
    container.innerHTML = '';
    
    // Create a new streamgraph instance with custom container
    const graph = new InternetGDPStreamGraph();
    
    // Override the container selection
    const originalCreateSVG = graph.createSVG;
    graph.createSVG = function() {
        this.calculateDimensions();
        this.svg = d3.select(container)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
    };
    
    // Override calculateDimensions for responsive container
    graph.calculateDimensions = function() {
        const containerWidth = container.clientWidth;
        const containerHeight = Math.min(containerWidth * 0.6, 400);
        
        this.width = containerWidth - this.margin.left - this.margin.right;
        this.height = containerHeight - this.margin.top - this.margin.bottom;
    };
    
    // Add updateForCountry method
    graph.updateForCountry = function(countryName) {
        if (!this.currentData) return;
        
        // Get country continent mapping (reuse from bar chart)
        const countryContinent = this.getCountryContinent(countryName);
        
        if (countryContinent) {
            this.highlightContinent(countryContinent);
        } else {
            this.resetHighlighting();
        }
    };
    
    // Add helper method to get country continent
    graph.getCountryContinent = function(countryName) {
        const countryToContinentMap = {
            'United States': 'North America',
            'Canada': 'North America',
            'Mexico': 'North America',
            'Brazil': 'South America',
            'Argentina': 'South America',
            'Chile': 'South America',
            'United Kingdom': 'Europe',
            'France': 'Europe',
            'Germany': 'Europe',
            'Italy': 'Europe',
            'Spain': 'Europe',
            'Russia': 'Europe',
            'China': 'Asia',
            'India': 'Asia',
            'Japan': 'Asia',
            'Korea, Rep.': 'Asia',
            'Thailand': 'Asia',
            'Nigeria': 'Africa',
            'Egypt': 'Africa',
            'South Africa': 'Africa',
            'Kenya': 'Africa',
            'Australia': 'Oceania',
            'New Zealand': 'Oceania'
        };
        return countryToContinentMap[countryName];
    };
    
    // Add continent highlighting method
    graph.highlightContinent = function(continent) {
        if (!this.svg) return;
        
        // Reset all areas to dimmed state
        this.svg.selectAll(".stream-area")
            .classed("continent-dimmed", true)
            .classed("continent-highlighted", false);
        
        // Highlight area for the selected continent
        this.svg.selectAll(".stream-area")
            .filter(d => d.key === continent)
            .classed("continent-dimmed", false)
            .classed("continent-highlighted", true);
    };
    
    // Add reset highlighting method
    graph.resetHighlighting = function() {
        if (!this.svg) return;
        
        this.svg.selectAll(".stream-area")
            .classed("continent-dimmed", false)
            .classed("continent-highlighted", false);
    };
    
    // Initialize the graph
    await graph.init();
    
    return graph;
}

function setupInteractionCoordination() {
    // This will be enhanced in the heatmap.js modification
    // The heatmap will call updateChartsForCountry when a country is hovered
    window.updateChartsForCountry = function(countryName) {
        if (barChart && typeof barChart.updateForCountry === 'function') {
            barChart.updateForCountry(countryName);
        }
        if (streamGraph && typeof streamGraph.updateForCountry === 'function') {
            streamGraph.updateForCountry(countryName);
        }
    };
    
    window.resetCharts = function() {
        if (barChart && typeof barChart.resetHighlighting === 'function') {
            barChart.resetHighlighting();
        }
        if (streamGraph && typeof streamGraph.resetHighlighting === 'function') {
            streamGraph.resetHighlighting();
        }
    };
}

function setupYearSelector() {
    const yearSelector = document.createElement('div');
    yearSelector.className = 'year-selector';
    yearSelector.innerHTML = `
        <label for="year">Select Year:</label>
        <input type="range" id="year" min="2000" max="2020" value="${currentYear}" step="1">
        <span id="year-value">${currentYear}</span>
    `;
    
    // Place inside the map-toolbar
    document.querySelector('.map-toolbar').appendChild(yearSelector);
    
    const yearInput = document.getElementById('year');
    const yearValue = document.getElementById('year-value');
    
    yearInput.addEventListener('input', (e) => {
        currentYear = parseInt(e.target.value);
        yearValue.textContent = currentYear;
        updateVisualization();
    });
}

function showLoading(container) {
    container.innerHTML = `
        <div class="loading">
            <p>Loading visualization...</p>
        </div>
    `;
}

function showError(container, message) {
    container.innerHTML = `
        <div class="error">
            <p>${message}</p>
        </div>
    `;
}

function updateVisualization() {
    // Update heatmap with new year
    if (currentVisualization && currentVisualization.update) {
        currentVisualization.update({ year: currentYear });
    }
    
    // Bar chart and streamgraph don't need year updates as they show multi-year data
    // But we could add year filtering if needed
}

// Handle window resize for all visualizations
window.addEventListener('resize', () => {
    if (currentVisualization && currentVisualization.resize) {
        const heatmapContainer = document.getElementById('heatmap-container');
        currentVisualization.resize(heatmapContainer.clientWidth, heatmapContainer.clientHeight);
    }
    
    if (barChart && typeof barChart.handleResize === 'function') {
        barChart.handleResize();
    }
    
    if (streamGraph && typeof streamGraph.handleResize === 'function') {
        streamGraph.handleResize();
    }
}); 