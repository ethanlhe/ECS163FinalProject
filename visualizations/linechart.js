export function createLineChart(container, data, options) {
    const {
        width = 700,
        height = 500,
        margin = {top: 30, right: 120, bottom: 50, left: 80},
        currentMode = 'gdp',
        formatGDP = (val) => val ? '$' + d3.format(',.2f')(val) : 'No data',
        sliderState = {start: 2000, end: 2020}
    } = options;

    // Clear container
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = `<div style='text-align:center;padding-top:120px;color:#888;'>Select at least one country</div>`;
        return;
    }

    // Prepare data
    const years = Array.from(new Set(data.flatMap(d => d.values.map(v => v.year)))).sort((a, b) => a - b);
    const countryData = data.filter(d => d.values.length > 0);

    if (countryData.length === 0) {
        container.innerHTML = `<div style='text-align:center;padding-top:120px;color:#888;'>No data available for selected countries in this time range</div>`;
        return;
    }

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // X/Y scales
    const x = d3.scaleLinear()
        .domain([sliderState.start, sliderState.end])
        .range([margin.left, width - margin.right]);

    const allValues = countryData.flatMap(d => d.values.map(v => v.value));
    const y = d3.scaleLinear()
        .domain([0, d3.max(allValues) * 1.1]) // Add 10% padding
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(countryData.map(d => d.country));

    // Grid lines
    svg.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,0)`)
        .selectAll('line')
        .data(y.ticks(6))
        .enter()
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', d => y(d))
        .attr('y2', d => y(d))
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 1);

    // Axes
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .tickFormat(d3.format('d'))
            .ticks(Math.min(6, sliderState.end - sliderState.start + 1))
        )
        .call(g => g.select('.domain').attr('stroke','#bbb'))
        .call(g => g.selectAll('text').attr('font-size','13px').attr('fill','#444'));

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y)
            .tickFormat(currentMode === 'gdp' ? d3.format("$~s") : d3.format(".2~s"))
            .ticks(6)
            .tickSizeOuter(0)
        )
        .call(g => g.select('.domain').attr('stroke','#bbb'))
        .call(g => g.selectAll('text').attr('font-size','13px').attr('fill','#444'));

    // Y label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 18)
        .attr('x', -height/2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#444')
        .text(currentMode === 'gdp' ? 'GDP (US Dollars)' : 'Internet Usage (%)');

    // Line generator
    const line = d3.line()
        .defined(d => d.value != null)
        .x(d => x(d.year))
        .y(d => y(d.value));

    // Draw lines
    countryData.forEach(d => {
        svg.append('path')
            .datum(d.values)
            .attr('fill', 'none')
            .attr('stroke', color(d.country))
            .attr('stroke-width', 2.5)
            .attr('d', line);
    });

    // Draw points and tooltip events
    countryData.forEach(d => {
        svg.selectAll('.dot-' + d.country.replace(/\W/g, ''))
            .data(d.values)
            .enter()
            .append('circle')
            .attr('class', 'linechart-dot')
            .attr('cx', v => x(v.year))
            .attr('cy', v => y(v.value))
            .attr('r', 2.5)
            .attr('fill', color(d.country))
            .on('mouseover', function(event, v) {
                const containerRect = container.getBoundingClientRect();
                const svgRect = svg.node().getBoundingClientRect();
                let left = event.clientX - svgRect.left + margin.left + 500;
                let top = event.clientY - svgRect.top - 30;
                // Clamp right edge
                const tooltipWidth = 160;
                if (left + tooltipWidth > width) left = width - tooltipWidth - 10;
                if (left < 0) left = 0;
                if (top < 0) top = 0;
                tooltip.style('left', left + 'px').style('top', top + 'px');
                tooltip.transition().duration(100).style('opacity', 0.97);
                tooltip.html(`<b>${d.country}</b><br>Year: ${v.year}<br>Value: ${currentMode === 'gdp' ? formatGDP(v.value) : (d3.format('.1f')(v.value) + '%')}`);
            })
            .on('mouseout', function() {
                tooltip.transition().duration(200).style('opacity', 0);
            });
    });

    // Draw legend (vertical, right side, not overlapping)
    const legend = svg.append('g')
        .attr('transform', `translate(${width - margin.right + 20},${margin.top})`);
    countryData.forEach((d, i) => {
        const legendItem = legend.append('g')
            .attr('transform', `translate(0,${i * 22})`);
        legendItem.append('circle')
            .attr('r', 7)
            .attr('fill', color(d.country));
        legendItem.append('text')
            .attr('x', 15)
            .attr('y', 5)
            .attr('font-size', '14px')
            .attr('fill', '#444')
            .text(d.country);
    });

    // Tooltip
    const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'linechart-tooltip')
        .style('position', 'absolute')
        .style('background', '#fff')
        .style('border', '1px solid #bbb')
        .style('padding', '7px 12px')
        .style('border-radius', '6px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('box-shadow', '0 2px 8px rgba(0,0,0,0.1)')
        .style('font-size', '13px');

    return {
        update: (newData) => {
            createLineChart(container, newData, options);
        }
    };
}
