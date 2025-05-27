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

    // Load and process data
    const [geoData, gdpData] = await Promise.all([
        d3.json('data/world.geojson'),
        d3.csv('data/gdp.csv')
    ]);

    // Filter GDP data for year 2000 and create a map for easy lookup
    const gdpMap = new Map(
        gdpData
            .filter(d => d.year === year.toString())
            .map(d => [d.country, +d.value])
    );

    // Create projection
    const projection = d3.geoNaturalEarth1()
        .fitSize([width, height], geoData);

    // Create path generator
    const path = d3.geoPath()
        .projection(projection);

    // Create color scale
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(gdpMap.values())]);

    // Draw countries
    svg.append('g')
        .selectAll('path')
        .data(geoData.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', d => {
            const gdp = gdpMap.get(d.properties.name);
            return gdp ? colorScale(gdp) : '#eee';
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .on('mouseover', function(event, d) {
            const gdp = gdpMap.get(d.properties.name);
            if (gdp) {
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0.9);
                tooltip.html(`
                    <strong>${d.properties.name}</strong><br/>
                    GDP (${year}): $${gdp.toLocaleString()}
                `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            }
        })
        .on('mouseout', function() {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

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
}