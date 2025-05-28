export async function initHeatmap(container) {
    // Constants
    const width = 1400;
    const height = 500;
    const year = 2000;

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
                year: +year,
                value: row[year] === '..' ? null : +row[year]
            }));
        }).filter(d => d.value !== null);

        // Filter GDP data for year 2000 and create a map for easy lookup
        const gdpYearData = processedGdpData.filter(d => d.year === year);
        const gdpMap = new Map(gdpYearData.map(d => [d.country, d.value]));

        // Calculate 5th and 95th percentiles for color scale domain
        const gdpValues = gdpYearData.map(d => d.value).sort((a, b) => a - b);
        const p5 = d3.quantile(gdpValues, 0.05);
        const p95 = d3.quantile(gdpValues, 0.95);

        // Create color scale (high contrast)
        const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
            .domain([p5, p95]);

        // Draw countries
        svg.append('g')
            .selectAll('path')
            .data(geoData.features)
            .enter()
            .append('path')
            .attr('d', d3.geoPath().projection(d3.geoNaturalEarth1().fitSize([width, height], geoData)))
            .attr('fill', d => {
                const gdp = gdpMap.get(d.properties.name);
                return gdp ? colorScale(gdp) : '#bbb'; // darker gray for missing data
            })
            .attr('stroke', '#222')
            .attr('stroke-width', 0.7)
            .on('mouseover', function(event, d) {
                const gdp = gdpMap.get(d.properties.name);
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0.95);
                tooltip.html(`
                    <strong>${d.properties.name}</strong><br/>
                    GDP (${year}): ${gdp ? ('$' + gdp.toLocaleString()) : 'No data'}
                `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });

        // Add a color legend
        const legendWidth = 300;
        const legendHeight = 16;
        const legendMargin = 30;
        const legendSvg = d3.select(container)
            .append('svg')
            .attr('width', legendWidth)
            .attr('height', legendHeight + 30)
            .style('display', 'block')
            .style('margin', '30px auto 0 auto');

        // Create a gradient for the legend
        const defs = legendSvg.append('defs');
        const linearGradient = defs.append('linearGradient')
            .attr('id', 'legend-gradient');
        linearGradient.selectAll('stop')
            .data(d3.range(0, 1.01, 0.01))
            .enter().append('stop')
            .attr('offset', d => `${d * 100}%`)
            .attr('stop-color', d => colorScale(p5 + d * (p95 - p5)));

        legendSvg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#legend-gradient)');

        // Add min and max labels
        legendSvg.append('text')
            .attr('x', 0)
            .attr('y', legendHeight + 18)
            .attr('text-anchor', 'start')
            .attr('font-size', '13px')
            .text(`$${Math.round(p5).toLocaleString()}`);
        legendSvg.append('text')
            .attr('x', legendWidth)
            .attr('y', legendHeight + 18)
            .attr('text-anchor', 'end')
            .attr('font-size', '13px')
            .text(`$${Math.round(p95).toLocaleString()}`);
        legendSvg.append('text')
            .attr('x', legendWidth / 2)
            .attr('y', legendHeight + 28)
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text('GDP (US Dollars, 2000)');

        // Return visualization object
        return {
            update: (data) => {
                // TODO: Implement data update logic
                console.log('Updating heatmap with new data:', data);
            },
            resize: (newWidth, newHeight) => {
                // TODO: Implement resize logic
                console.log('Resizing heatmap:', newWidth, newHeight);
            }
        };
    } catch (error) {
        console.error('Error in heatmap initialization:', error);
        container.innerHTML = '<p>Error loading visualization. Please check the console for details.</p>';
        throw error;
    }
}