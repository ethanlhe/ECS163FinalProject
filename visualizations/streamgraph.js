export function createStreamGraph(container, data, options) {
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

    // Prepare data for streamgraph
    const years = Array.from(new Set(data.flatMap(d => d.values.map(v => v.year)))).sort((a, b) => a - b);
    const countryNames = data.map(d => d.country);
    // Pivot data: array of {year, [country1]: value, [country2]: value, ...}
    const yearData = years.map(year => {
        const entry = { year };
        data.forEach(d => {
            const found = d.values.find(v => v.year === year);
            entry[d.country] = found ? found.value : 0;
        });
        return entry;
    });

    // D3 stack generator
    const stack = d3.stack()
        .keys(countryNames)
        .offset(d3.stackOffsetWiggle)
        .order(d3.stackOrderInsideOut);
    const stackedData = stack(yearData);

    // X scale
    const x = d3.scaleLinear()
        .domain([sliderState.start, sliderState.end])
        .range([margin.left, width - margin.right]);

    // Y scale
    const y = d3.scaleLinear()
        .domain([
            d3.min(stackedData, d => d3.min(d, d => d[0])),
            d3.max(stackedData, d => d3.max(d, d => d[1]))
        ])
        .range([height - margin.bottom, margin.top]);

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(countryNames);

    // Area generator
    const area = d3.area()
        .x((d, i) => x(years[i]))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveBasis);

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Draw areas
    svg.selectAll('path')
        .data(stackedData)
        .enter()
        .append('path')
        .attr('d', area)
        .attr('fill', d => color(d.key))
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
            tooltip.html(`<b>${d.key}</b>`);
        })
        .on('mouseout', function() {
            d3.select(this).attr('opacity', 0.8);
            tooltip.transition().duration(200).style('opacity', 0);
        });

    // X axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')).tickSizeOuter(0))
        .call(g => g.select('.domain').attr('stroke','#bbb'))
        .call(g => g.selectAll('text').attr('font-size','13px').attr('fill','#444'));

    // Draw legend (vertical, right side)
    const legend = svg.append('g')
        .attr('transform', `translate(${width - margin.right + 20},${margin.top})`);
    countryNames.forEach((name, i) => {
        const legendItem = legend.append('g')
            .attr('transform', `translate(0,${i * 22})`);
        legendItem.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', color(name));
        legendItem.append('text')
            .attr('x', 15)
            .attr('y', 10)
            .attr('font-size', '14px')
            .attr('fill', '#444')
            .text(name);
    });

    // Tooltip
    const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'streamgraph-tooltip')
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
            createStreamGraph(container, newData, options);
        }
    };
} 