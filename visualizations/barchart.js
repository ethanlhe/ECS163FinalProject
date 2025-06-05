export function createBarChart(container, data, options) {
    const {
        width = 700,
        height = 500,
        margin = {top: 30, right: 120, bottom: 80, left: 80},
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

    // Prepare data for barchart (use end year)
    const year = sliderState.end;
    const countryData = data.map(d => {
        const yearData = d.values.find(v => v.year === year);
        return {
            country: d.country,
            value: yearData ? yearData.value : null
        };
    }).filter(d => d.value != null).sort((a, b) => b.value - a.value);

    if (countryData.length === 0) {
        container.innerHTML = `<div style='text-align:center;padding-top:120px;color:#888;'>No data available for selected countries in this time range</div>`;
        return;
    }

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // X scale (for countries)
    const x = d3.scaleBand()
        .domain(countryData.map(d => d.country))
        .range([margin.left, width - margin.right])
        .padding(0.2);

    // Y scale (for values)
    const y = d3.scaleLinear()
        .domain([0, d3.max(countryData, d => d.value) * 1.1])
        .range([height - margin.bottom, margin.top]);

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(countryData.map(d => d.country));

    // Draw bars
    svg.selectAll('rect')
        .data(countryData)
        .enter()
        .append('rect')
        .attr('x', d => x(d.country))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => height - margin.bottom - y(d.value))
        .attr('fill', d => color(d.country))
        .attr('opacity', 0.8)
        .on('mouseover', function(event, d) {
            d3.select(this).attr('opacity', 1);
            const containerRect = container.getBoundingClientRect();
            const svgRect = svg.node().getBoundingClientRect();
            let left = event.clientX - svgRect.left + margin.left + 10;
            let top = event.clientY - svgRect.top - 30;
            // Clamp right edge
            const tooltipWidth = 160;
            if (left + tooltipWidth > width) left = width - tooltipWidth - 10;
            if (left < 0) left = 0;
            if (top < 0) top = 0;
            tooltip.style('left', left + 'px').style('top', top + 'px');
            tooltip.transition().duration(100).style('opacity', 0.97);
            tooltip.html(`<b>${d.country}</b><br>Year: ${year}<br>Value: ${currentMode === 'gdp' ? formatGDP(d.value) : (d3.format('.1f')(d.value) + '%')}`);
        })
        .on('mouseout', function() {
            d3.select(this).attr('opacity', 0.8);
            tooltip.transition().duration(200).style('opacity', 0);
        });

    // X axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .call(g => g.select('.domain').attr('stroke','#bbb'))
        .call(g => g.selectAll('text')
            .attr('font-size','13px')
            .attr('fill','#444')
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em'));

    // Y axis
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

    // Tooltip
    const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'barchart-tooltip')
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
            createBarChart(container, newData, options);
        }
    };
} 