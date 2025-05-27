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

// Set up dimensions
const margin = {top: 60, right: 60, bottom: 80, left: 80};
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip
const tooltip = d3.select("#tooltip");

// Load and process data
d3.csv("internet_usage.csv").then(function(data) {
    // Process data to get continent averages
    const continentData = {};
    
    data.forEach(d => {
        const continent = continentMap[d['Country Code']];
        if (!continent) return;
        
        const year2000 = parseFloat(d['2000']);
        const year2023 = parseFloat(d['2023']);
        
        if (!isNaN(year2000)) {
            if (!continentData[continent]) {
                continentData[continent] = {count: 0, sum2000: 0, sum2023: 0};
            }
            continentData[continent].sum2000 += year2000;
            continentData[continent].count++;
        }
        
        if (!isNaN(year2023)) {
            if (!continentData[continent]) {
                continentData[continent] = {count: 0, sum2000: 0, sum2023: 0};
            }
            continentData[continent].sum2023 += year2023;
            // Count is already incremented for 2000
        }
    });
    
    // Calculate averages
    const processedData = Object.keys(continentData).map(continent => {
        return {
            continent,
            year2000: continentData[continent].sum2000 / continentData[continent].count,
            year2023: continentData[continent].sum2023 / continentData[continent].count
        };
    });
    
    // Sort by 2023 value
    processedData.sort((a, b) => b.year2023 - a.year2023);
    
    // Set up scales
    const x0 = d3.scaleBand()
        .domain(processedData.map(d => d.continent))
        .range([0, width])
        .paddingInner(0.1);
    
    const x1 = d3.scaleBand()
        .domain(['2000', '2023'])
        .range([0, x0.bandwidth()])
        .padding(0.05);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => Math.max(d.year2000, d.year2023)) * 1.1])
        .range([height, 0]);
    
    // Add axes
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));
    
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(5))
        .append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .text("Internet Users (% of population)");
    
    // Add bars
    const continents = svg.selectAll(".continent")
        .data(processedData)
        .enter().append("g")
        .attr("class", "continent")
        .attr("transform", d => `translate(${x0(d.continent)},0)`);
    
    continents.selectAll(".bar-2000")
        .data(d => [d])
        .enter().append("rect")
        .attr("class", "bar-2000")
        .attr("x", x1('2000'))
        .attr("y", d => y(d.year2000))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.year2000))
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`<strong>${d.continent}</strong><br>2000: ${d.year2000.toFixed(1)}%`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    continents.selectAll(".bar-2023")
        .data(d => [d])
        .enter().append("rect")
        .attr("class", "bar-2023")
        .attr("x", x1('2023'))
        .attr("y", d => y(d.year2023))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.year2023))
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`<strong>${d.continent}</strong><br>2023: ${d.year2023.toFixed(1)}%`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, 20)`);
    
    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#1f77b4");
    
    legend.append("text")
        .attr("x", 25)
        .attr("y", 12)
        .text("2000")
        .style("font-size", "12px");
    
    legend.append("rect")
        .attr("x", 0)
        .attr("y", 25)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#ff7f0e");
    
    legend.append("text")
        .attr("x", 25)
        .attr("y", 37)
        .text("2023")
        .style("font-size", "12px");
    
    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Average Internet Usage by Continent (2000 vs 2023)");
    
    // Add percentage labels
    continents.selectAll(".label-2000")
        .data(d => [d])
        .enter().append("text")
        .attr("class", "label")
        .attr("x", x1('2000') + x1.bandwidth() / 2)
        .attr("y", d => y(d.year2000) - 5)
        .attr("text-anchor", "middle")
        .text(d => d.year2000.toFixed(1) + "%")
        .style("font-size", "10px")
        .style("fill", "black");
    
    continents.selectAll(".label-2023")
        .data(d => [d])
        .enter().append("text")
        .attr("class", "label")
        .attr("x", x1('2023') + x1.bandwidth() / 2)
        .attr("y", d => y(d.year2023) - 5)
        .attr("text-anchor", "middle")
        .text(d => d.year2023.toFixed(1) + "%")
        .style("font-size", "10px")
        .style("fill", "black");
}).catch(function(error) {
    console.error("Error loading the data:", error);
});