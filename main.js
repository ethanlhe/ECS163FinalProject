import { initHeatmap } from './visualizations/heatmap.js';

let currentVisualization = null;

// Initialize the default visualization (GDP)
document.addEventListener('DOMContentLoaded', () => {
    loadVisualization('gdp');
    setupTabListeners();
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

async function loadVisualization(type) {
    const container = document.getElementById('vis-container');
    container.innerHTML = ''; // Clear previous visualization

    try {
        switch(type) {
            case 'gdp':
                currentVisualization = await initHeatmap(container);
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
        container.innerHTML = '<p>Error loading visualization. Please try again.</p>';
    }
} 