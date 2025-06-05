export function createSlopeChart(container, data, options) {
    const {
        width = 600,
        height = 340,
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

    // Filter out countries with missing data
    const slopeData = data.filter(d => d.startVal != null && d.endVal != null);

    if (slopeData.length === 0) {
        container.innerHTML = `<div style='text-align:center;padding-top:120px;color:#888;'>No data available for selected countries in this time range</div>`;
        return;
    }

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Y scale
    const allSlopeVals = slopeData.flatMap(d => [d.startVal, d.endVal]);
    const y = d3.scaleLinear()
        .domain([0, d3.max(allSlopeVals) * 1.1])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // X scale: just two points
    const x = d3.scalePoint()
        .domain([sliderState.start, sliderState.end])
        .range([margin.left, width - margin.right]);

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(slopeData.map(d => d.country));

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

    // X axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .tickFormat(d3.format('d'))
            .tickSizeOuter(0)
        )
        .call(g => g.select('.domain').attr('stroke','#bbb'))
        .call(g => g.selectAll('text').attr('font-size','13px').attr('fill','#444'));

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

    // Slope lines
    svg.selectAll('.slope-line')
        .data(slopeData)
        .enter()
        .append('line')
        .attr('class', 'slope-line')
        .attr('x1', d => x(d.start))
        .attr('y1', d => y(d.startVal))
        .attr('x2', d => x(d.end))
        .attr('y2', d => y(d.endVal))
        .attr('stroke', d => color(d.country))
        .attr('stroke-width', 2.5);

    // Dots
    svg.selectAll('.slope-dot-start')
        .data(slopeData)
        .enter()
        .append('circle')
        .attr('class', 'slope-dot-start')
        .attr('cx', d => x(d.start))
        .attr('cy', d => y(d.startVal))
        .attr('r', 4)
        .attr('fill', d => color(d.country));

    svg.selectAll('.slope-dot-end')
        .data(slopeData)
        .enter()
        .append('circle')
        .attr('class', 'slope-dot-end')
        .attr('cx', d => x(d.end))
        .attr('cy', d => y(d.endVal))
        .attr('r', 4)
        .attr('fill', d => color(d.country));

    // Labels (country name at end)
    svg.selectAll('.slope-label')
        .data(slopeData)
        .enter()
        .append('text')
        .attr('class', 'slope-label')
        .attr('x', d => x(d.end) + 8)
        .attr('y', d => y(d.endVal) + 5)
        .attr('font-size', '14px')
        .attr('fill', d => color(d.country))
        .attr('font-weight', 'bold')
        .text(d => d.country);

    // Tooltip
    const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'slopechart-tooltip')
        .style('position', 'absolute')
        .style('background', '#fff')
        .style('border', '1px solid #bbb')
        .style('padding', '7px 12px')
        .style('border-radius', '6px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('box-shadow', '0 2px 8px rgba(0,0,0,0.1)')
        .style('font-size', '13px');

    // Tooltip events for dots
    svg.selectAll('.slope-dot-start, .slope-dot-end')
        .on('mouseover', function(event, d) {
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
            const year = d3.select(this).classed('slope-dot-start') ? d.start : d.end;
            const value = d3.select(this).classed('slope-dot-start') ? d.startVal : d.endVal;
            tooltip.html(`<b>${d.country}</b><br>Year: ${year}<br>Value: ${currentMode === 'gdp' ? formatGDP(value) : (d3.format('.1f')(value) + '%')}`);
        })
        .on('mouseout', function() {
            tooltip.transition().duration(200).style('opacity', 0);
        });

    return {
        update: (newData) => {
            createSlopeChart(container, newData, options);
        }
    };
}
