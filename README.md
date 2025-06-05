# Global GDP and Internet Usage Visualization

An interactive visualization that explores the relationship between GDP and Internet usage across countries over time.

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Visual Studio Code with the "Live Server" extension installed

### Installation
1. Clone this repository to your local machine
2. Open the project folder in Visual Studio Code
3. Install the "Live Server" extension if you haven't already:
   - Click on the Extensions icon in VS Code (or press Ctrl+Shift+X)
   - Search for "Live Server"
   - Click "Install" on the extension by Ritwick Dey

### Running the Application
1. Open `index.html` in VS Code
2. Right-click on `index.html` and select "Open with Live Server"
3. The visualization will open in your default web browser

## Using the Visualization

### Main Map View
- The world map shows either GDP or Internet usage data for the selected year
- Hover over countries to see detailed information
- Click on a country to open a detailed analysis modal

### Controls
- Use the "Switch to Internet Usage/GDP" button to toggle between metrics
- The year slider at the bottom controls the displayed year
- The mode indicator shows which metric is currently being displayed

### Country Analysis Modal
When you click on a country, a modal opens with detailed analysis tools:

1. **Country Selection**
   - Search for countries using the search box
   - Sort countries by name, GDP, or Internet usage
   - Select multiple countries for comparison
   - Use the "Clear" button to reset selections

2. **Time Range Selection**
   - Use the dual slider to select a time range
   - Input specific years using the number inputs
   - The visualization will update to show data for the selected range

3. **Visualization Types**
   - **Line Chart**: Shows trends over time for selected countries
   - **Slope Chart**: Compares start and end values for the selected period
   - **Stream Graph**: Shows relative proportions of selected countries
   - **Bar Chart**: Compares end-year values across selected countries

4. **Metric Toggle**
   - Switch between GDP and Internet usage data within the modal
   - The main map will update to match the selected metric

## Data Sources
- GDP data from World Bank
- Internet usage data from World Bank
- Country boundaries from Natural Earth

## Features
- Interactive world map
- Multiple visualization types
- Country comparison tools
- Time series analysis
- Search and filter capabilities
- Responsive design

## Troubleshooting
If you encounter any issues:
1. Ensure you're using a modern web browser
2. Check that the Live Server extension is properly installed
3. Verify that all files are in their correct locations
4. Clear your browser cache if visualizations don't load properly
