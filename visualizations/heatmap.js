export async function initHeatmap(container, initialYear = 2000) {
    // Constants
    const width = 1400;
    const height = 500;
    let currentYear = initialYear;

    // Country name mapping
    const countryNameMap = {
        'North Macedonia': 'Macedonia',
        'Serbia': 'Republic of Serbia',
        'Viet Nam': 'Vietnam',
        'Guinea-Bissau': 'Guinea Bissau',
        'Cote d\'Ivoire': 'Ivory Coast',
        'United States': 'USA',
        'United Kingdom': 'England',
        'Czechia': 'Czech Republic',
        'Congo, Dem. Rep.': 'Democratic Republic of the Congo',
        'Congo, Rep.': 'Republic of the Congo',
        'Egypt, Arab Rep.': 'Egypt',
        'Gambia, The': 'Gambia',
        'Hong Kong SAR, China': 'Hong Kong',
        'Iran, Islamic Rep.': 'Iran',
        'Korea, Rep.': 'South Korea',
        'Korea, Dem. People\'s Rep.': 'North Korea',
        'Kyrgyz Republic': 'Kyrgyzstan',
        'Lao PDR': 'Laos',
        'Macao SAR, China': 'Macau',
        'Macedonia, FYR': 'Macedonia',
        'Micronesia, Fed. Sts.': 'Micronesia',
        'Russian Federation': 'Russia',
        'Slovak Republic': 'Slovakia',
        'Syrian Arab Republic': 'Syria',
        'Tanzania': 'United Republic of Tanzania',
        'Timor-Leste': 'East Timor',
        'Turkiye': 'Turkey',
        'United Arab Emirates, The': 'United Arab Emirates',
        'Venezuela, RB': 'Venezuela',
        'Virgin Islands (U.S.)': 'U.S. Virgin Islands',
        'Yemen, Rep.': 'Yemen'
    };

    // Helper function to get the correct country name
    function getCountryName(country) {
        return countryNameMap[country] || country;
    }

    // Create SVG container (responsive)
    const svg = d3.select(container)
        .append('svg')
        .attr('class', 'responsive-svg')
        .attr('viewBox', `0 0 ${width} ${height}`);

    // Create tooltip div
    const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', '1px solid #ddd')
        .style('padding', '10px')
        .style('border-radius', '5px')
        .style('pointer-events', 'none');

    try {
        // Load and process data
        const [geoData, gdpData] = await Promise.all([
            d3.json('data/world.geojson'),
            d3.csv('data/global_gdp.csv')
        ]);

        // Convert GDP data to the format we need
        const processedGdpData = gdpData.flatMap(row => {
            const years = Object.keys(row).filter(key => !isNaN(+key) && +key >= 2000);
            return years.map(year => ({
                country: row['Country Name'],
                geoName: getCountryName(row['Country Name']), // Map to GeoJSON name
                year: +year,
                value: row[year] === '..' ? null : +row[year]
            }));
        }).filter(d => d.value !== null);

        // Create a map of all years' data for quick lookup
        const gdpDataMap = new Map();
        processedGdpData.forEach(d => {
            if (!gdpDataMap.has(d.geoName)) {
                gdpDataMap.set(d.geoName, new Map());
            }
            gdpDataMap.get(d.geoName).set(d.year, d.value);
        });

        // Create projection
        const projection = d3.geoNaturalEarth1()
            .fitSize([width, height], geoData);

        // Create path generator
        const path = d3.geoPath().projection(projection);

        // Draw countries
        const countries = svg.append('g')
            .selectAll('path')
            .data(geoData.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('stroke', '#222')
            .attr('stroke-width', 0.7);

        // Create color scale
        const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
            .domain([0, 1]); // Will be updated with actual data

        // Function to update the visualization
        function update(year) {
            currentYear = year;
            
            // Get GDP data for the current year
            const yearData = Array.from(gdpDataMap.entries()).map(([country, yearMap]) => ({
                country,
                value: yearMap.get(year)
            })).filter(d => d.value !== undefined);

            // Calculate color scale domain using a more appropriate range
            const values = yearData.map(d => d.value).sort((a, b) => a - b);
            const p10 = d3.quantile(values, 0.1);  // Use 10th percentile instead of 5th
            const p90 = d3.quantile(values, 0.9);  // Use 90th percentile instead of 95th
            colorScale.domain([p10, p90]);

            // Update country colors
            countries
                .attr('fill', d => {
                    const countryData = yearData.find(c => c.country === getCountryName(d.properties.name));
                    return countryData ? colorScale(countryData.value) : '#bbb';
                });

            // Update tooltip content
            countries
                .on('mouseover', function(event, d) {
                    const countryData = yearData.find(c => c.country === getCountryName(d.properties.name));
                    const originalName = Object.entries(countryNameMap).find(([_, geoName]) => geoName === d.properties.name)?.[0] || d.properties.name;
                    tooltip.transition()
                        .duration(200)
                        .style('opacity', 0.95);
                    tooltip.html(`
                        <strong>${originalName}</strong><br/>
                        GDP (${year}): ${countryData ? ('$' + d3.format(',.2f')(countryData.value)) : 'No data'}
                    `)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', function() {
                    tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                });

            // Update legend
            updateLegend(p10, p90);
        }

        // Function to update the legend
        function updateLegend(min, max) {
            // Remove existing legend
            d3.select(container).selectAll('.legend-svg').remove();

            const legendWidth = 300;
            const legendHeight = 16;
            const legendMargin = 30;
            const legendSvg = d3.select(container)
                .append('svg')
                .attr('class', 'legend-svg')
                .attr('width', legendWidth)
                .attr('height', legendHeight + 30)
                .style('display', 'block')
                .style('margin', '30px auto 0 auto');

            // Create gradient
            const defs = legendSvg.append('defs');
            const linearGradient = defs.append('linearGradient')
                .attr('id', 'legend-gradient');
            linearGradient.selectAll('stop')
                .data(d3.range(0, 1.01, 0.01))
                .enter().append('stop')
                .attr('offset', d => `${d * 100}%`)
                .attr('stop-color', d => colorScale(min + d * (max - min)));

            // Add gradient rectangle
            legendSvg.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', legendWidth)
                .attr('height', legendHeight)
                .style('fill', 'url(#legend-gradient)');

            // Add labels
            legendSvg.append('text')
                .attr('x', 0)
                .attr('y', legendHeight + 18)
                .attr('text-anchor', 'start')
                .attr('font-size', '13px')
                .text(`$${d3.format(',.2f')(min)}`);
            legendSvg.append('text')
                .attr('x', legendWidth)
                .attr('y', legendHeight + 18)
                .attr('text-anchor', 'end')
                .attr('font-size', '13px')
                .text(`$${d3.format(',.2f')(max)}`);
            legendSvg.append('text')
                .attr('x', legendWidth / 2)
                .attr('y', legendHeight + 28)
                .attr('text-anchor', 'middle')
                .attr('font-size', '14px')
                .attr('font-weight', 'bold')
                .text(`GDP (US Dollars, ${currentYear})`);
        }

        // Initial update
        update(currentYear);

        // Return visualization object
        return {
            update: (data) => {
                if (data.year) {
                    update(data.year);
                }
            },
            resize: (newWidth, newHeight) => {
                // Update projection and path
                projection.fitSize([newWidth, newHeight], geoData);
                countries.attr('d', path);
            }
        };
    } catch (error) {
        console.error('Error in heatmap initialization:', error);
        container.innerHTML = '<p>Error loading visualization. Please check the console for details.</p>';
        throw error;
    }
}