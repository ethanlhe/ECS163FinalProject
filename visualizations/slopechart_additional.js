import * as d3 from 'd3';

// Define continent mapping for countries
const continentMap = {
    // Africa
    'DZA': 'Africa', 'AGO': 'Africa', 'BEN': 'Africa', 'BWA': 'Africa', 'BFA': 'Africa',
    'BDI': 'Africa', 'CMR': 'Africa', 'CPV': 'Africa', 'CAF': 'Africa', 'TCD': 'Africa',
    'COM': 'Africa', 'COD': 'Africa', 'COG': 'Africa', 'CIV': 'Africa', 'DJI': 'Africa',
    'EGY': 'Africa', 'GNQ': 'Africa', 'ERI': 'Africa', 'ETH': 'Africa', 'GAB': 'Africa',
    'GMB': 'Africa', 'GHA': 'Africa', 'GIN': 'Africa', 'GNB': 'Africa', 'KEN': 'Africa',
    'LSO': 'Africa', 'LBR': 'Africa', 'LBY': 'Africa', 'MDG': 'Africa', 'MWI': 'Africa',
    'MLI': 'Africa', 'MRT': 'Africa', 'MUS': 'Africa', 'MAR': 'Africa', 'MOZ': 'Africa',
    'NAM': 'Africa', 'NER': 'Africa', 'NGA': 'Africa', 'RWA': 'Africa', 'STP': 'Africa',
    'SEN': 'Africa', 'SYC': 'Africa', 'SLE': 'Africa', 'SOM': 'Africa', 'ZAF': 'Africa',
    'SSD': 'Africa', 'SDN': 'Africa', 'SWZ': 'Africa', 'TZA': 'Africa', 'TGO': 'Africa',
    'TUN': 'Africa', 'UGA': 'Africa', 'ZMB': 'Africa', 'ZWE': 'Africa',
    
    // Asia
    'AFG': 'Asia', 'ARM': 'Asia', 'AZE': 'Asia', 'BHR': 'Asia', 'BGD': 'Asia',
    'BTN': 'Asia', 'BRN': 'Asia', 'KHM': 'Asia', 'CHN': 'Asia', 'CYP': 'Asia',
    'GEO': 'Asia', 'IND': 'Asia', 'IDN': 'Asia', 'IRN': 'Asia', 'IRQ': 'Asia',
    'ISR': 'Asia', 'JPN': 'Asia', 'JOR': 'Asia', 'KAZ': 'Asia', 'KWT': 'Asia',
    'KGZ': 'Asia', 'LAO': 'Asia', 'LBN': 'Asia', 'MYS': 'Asia', 'MDV': 'Asia',
    'MNG': 'Asia', 'MMR': 'Asia', 'NPL': 'Asia', 'OMN': 'Asia', 'PAK': 'Asia',
    'PSE': 'Asia', 'PHL': 'Asia', 'QAT': 'Asia', 'SAU': 'Asia', 'SGP': 'Asia',
    'LKA': 'Asia', 'SYR': 'Asia', 'TJK': 'Asia', 'THA': 'Asia', 'TLS': 'Asia',
    'TUR': 'Asia', 'TKM': 'Asia', 'ARE': 'Asia', 'UZB': 'Asia', 'VNM': 'Asia',
    'YEM': 'Asia',
    
    // Europe
    'ALB': 'Europe', 'AND': 'Europe', 'AUT': 'Europe', 'BLR': 'Europe', 'BEL': 'Europe',
    'BIH': 'Europe', 'BGR': 'Europe', 'HRV': 'Europe', 'CZE': 'Europe', 'DNK': 'Europe',
    'EST': 'Europe', 'FRO': 'Europe', 'FIN': 'Europe', 'FRA': 'Europe', 'DEU': 'Europe',
    'GIB': 'Europe', 'GRC': 'Europe', 'HUN': 'Europe', 'ISL': 'Europe', 'IRL': 'Europe',
    'IMN': 'Europe', 'ITA': 'Europe', 'XKX': 'Europe', 'LVA': 'Europe', 'LIE': 'Europe',
    'LTU': 'Europe', 'LUX': 'Europe', 'MKD': 'Europe', 'MLT': 'Europe', 'MDA': 'Europe',
    'MCO': 'Europe', 'MNE': 'Europe', 'NLD': 'Europe', 'NOR': 'Europe', 'POL': 'Europe',
    'PRT': 'Europe', 'ROU': 'Europe', 'RUS': 'Europe', 'SMR': 'Europe', 'SRB': 'Europe',
    'SVK': 'Europe', 'SVN': 'Europe', 'ESP': 'Europe', 'SWE': 'Europe', 'CHE': 'Europe',
    'UKR': 'Europe', 'GBR': 'Europe', 'VAT': 'Europe',
    
    // North America
    'AIA': 'North America', 'ATG': 'North America', 'BHS': 'North America', 'BRB': 'North America',
    'BLZ': 'North America', 'BMU': 'North America', 'VGB': 'North America', 'CAN': 'North America',
    'CYM': 'North America', 'CRI': 'North America', 'CUB': 'North America', 'DMA': 'North America',
    'DOM': 'North America', 'SLV': 'North America', 'GRL': 'North America', 'GRD': 'North America',
    'GLP': 'North America', 'GTM': 'North America', 'HTI': 'North America', 'HND': 'North America',
    'JAM': 'North America', 'MTQ': 'North America', 'MEX': 'North America', 'MSR': 'North America',
    'ANT': 'North America', 'KNA': 'North America', 'NIC': 'North America', 'PAN': 'North America',
    'PRI': 'North America', 'KNA': 'North America', 'LCA': 'North America', 'SPM': 'North America',
    'VCT': 'North America', 'TTO': 'North America', 'TCA': 'North America', 'USA': 'North America',
    'VIR': 'North America',
    
    // Oceania
    'ASM': 'Oceania', 'AUS': 'Oceania', 'COK': 'Oceania', 'FJI': 'Oceania', 'PYF': 'Oceania',
    'GUM': 'Oceania', 'KIR': 'Oceania', 'MHL': 'Oceania', 'FSM': 'Oceania', 'NRU': 'Oceania',
    'NCL': 'Oceania', 'NZL': 'Oceania', 'NIU': 'Oceania', 'NFK': 'Oceania', 'MNP': 'Oceania',
    'PLW': 'Oceania', 'PNG': 'Oceania', 'PCN': 'Oceania', 'WSM': 'Oceania', 'SLB': 'Oceania',
    'TKL': 'Oceania', 'TON': 'Oceania', 'TUV': 'Oceania', 'VUT': 'Oceania', 'WLF': 'Oceania',
    
    // South America
    'ARG': 'South America', 'BOL': 'South America', 'BRA': 'South America', 'CHL': 'South America',
    'COL': 'South America', 'ECU': 'South America', 'FLK': 'South America', 'GUF': 'South America',
    'GUY': 'South America', 'PRY': 'South America', 'PER': 'South America', 'SUR': 'South America',
    'URY': 'South America', 'VEN': 'South America'
};

//Streamchart for GDP data
const streamMargin = {top: 80, right: 60, bottom: 80, left: 80};
const streamWidth = 900 - streamMargin.left - streamMargin.right;
const streamHeight = 400 - streamMargin.top - streamMargin.bottom;

//SVG for streamchart
const streamSvg = d3.select("#chart")
    .append("svg")
    .attr("width", streamWidth + streamMargin.left + streamMargin.right)
    .attr("height", streamHeight + streamMargin.top + streamMargin.bottom)
    .style("margin-top", "50px")
    .append("g")
    .attr("transform", `translate(${streamMargin.left},${streamMargin.top})`);

// Load GDP data
d3.csv("data/global_gdp.csv").then(function(gdpData) {
    // Process GDP data by continent
    const gdpByContinentYear = {};
    
    gdpData.forEach(d => {
        const continent = continentMap[d['Country Code']];
        if (!continent) return;
        
        // Get all year columns (assuming they start from a certain year)
        Object.keys(d).forEach(key => {
            if (key.match(/^\d{4}$/)) { // Year columns
                const year = parseInt(key);
                const gdpValue = parseFloat(d[key]);
                
                if (!isNaN(gdpValue) && year >= 1990 && year <= 2023) {
                    if (!gdpByContinentYear[year]) {
                        gdpByContinentYear[year] = {};
                    }
                    if (!gdpByContinentYear[year][continent]) {
                        gdpByContinentYear[year][continent] = 0;
                    }
                    gdpByContinentYear[year][continent] += gdpValue;
                }
            }
        });
    });
    
    // Convert to array format for D3
    const years = Object.keys(gdpByContinentYear).map(d => parseInt(d)).sort();
    const continents = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];
    
    const streamData = years.map(year => {
        const yearData = {year: year};
        continents.forEach(continent => {
            yearData[continent] = gdpByContinentYear[year][continent] || 0;
        });
        return yearData;
    });
    
    // Create stack generator
    const stack = d3.stack()
        .keys(continents)
        .offset(d3.stackOffsetSilhouette);
    
    const stackedData = stack(streamData);
    
    // Set up scales for streamchart
    const xScale = d3.scaleLinear()
        .domain(d3.extent(years))
        .range([0, streamWidth]);
    
    const yScale = d3.scaleLinear()
        .domain(d3.extent(stackedData.flat(2)))
        .range([streamHeight, 0]);
    
    // Color scale
    const colorScale = d3.scaleOrdinal()
        .domain(continents)
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33']);
    
    // Create area generator
    const area = d3.area()
        .x(d => xScale(d.data.year))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveBasis);
    
    // Add streamchart paths
    streamSvg.selectAll(".stream-layer")
        .data(stackedData)
        .enter().append("path")
        .attr("class", "stream-layer")
        .attr("d", area)
        .style("fill", d => colorScale(d.key))
        .style("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this).style("opacity", 1);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`<strong>${d.key}</strong>`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).style("opacity", 0.8);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    // Add axes for streamchart
    streamSvg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${streamHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    
    streamSvg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(yScale).tickFormat(d => d3.format(".2s")(d)))
        .append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -streamHeight / 2)
        .attr("text-anchor", "middle")
        .text("GDP (Current US$)");
    
    // Add title for streamchart
    streamSvg.append("text")
        .attr("x", streamWidth / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Global GDP by Continent Over Time (1990-2023)");
    
    // Add legend for streamchart
    const streamLegend = streamSvg.append("g")
        .attr("transform", `translate(${streamWidth - 120}, 20)`);
    
    continents.forEach((continent, i) => {
        const legendRow = streamLegend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);
        
        legendRow.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", colorScale(continent));
        
        legendRow.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(continent)
            .style("font-size", "10px");
    });
    
}).catch(function(error) {
    console.error("Error loading GDP data:", error);
});