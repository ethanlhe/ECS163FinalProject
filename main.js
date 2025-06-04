import { initHeatmap } from './visualizations/heatmap.js';

let currentVisualization = null;
let currentYear = 2000;

// Initialize the default visualization (GDP)
document.addEventListener('DOMContentLoaded', () => {
    loadVisualization('gdp');
    setupTabListeners();
    setupYearSelector();
});

function setupTabListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Load corresponding visualization
            const tabType = button.getAttribute('data-tab');
            loadVisualization(tabType);
        });
    });
}

function setupYearSelector() {
    const yearSelector = document.createElement('div');
    yearSelector.className = 'year-selector';
    yearSelector.innerHTML = `
        <label for="year">Select Year:</label>
        <input type="range" id="year" min="2000" max="2020" value="${currentYear}" step="1">
        <span id="year-value">${currentYear}</span>
    `;
    
    document.querySelector('.dashboard-tabs').after(yearSelector);
    
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

async function loadVisualization(type) {
    const container = document.getElementById('vis-container');
    showLoading(container);

    try {
        switch(type) {
            case 'gdp':
                currentVisualization = await initHeatmap(container, currentYear);
                break;
            case 'internet':
                // TODO: Implement internet visualization
                container.innerHTML = '<p>Internet Access visualization coming soon...</p>';
                break;
            default:
                throw new Error('Unknown visualization type');
        }
    } catch (error) {
        console.error('Error loading visualization:', error);
        showError(container, 'Error loading visualization. Please try again.');
    }
}

function updateVisualization() {
    if (currentVisualization && currentVisualization.update) {
        currentVisualization.update({ year: currentYear });
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    if (currentVisualization && currentVisualization.resize) {
        const container = document.getElementById('vis-container');
        currentVisualization.resize(container.clientWidth, container.clientHeight);
    }
}); 