import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { loadAndCleanData } from "../data/dataLoader.js";

export class InternetUsageBarChart {
    constructor() {
       this.margin = { top: 60, right: 60, bottom: 80, left: 80 };
       this.width = 900 - this.margin.left - this.margin.right;
       this.height = 500 - this.margin.top - this.margin.bottom;

        this.yearColor = d3.scaleOrdinal()
            .domain(["2000", "2023"])
            .range(["#1f77b4", "#ff7f0e"]);

                
        this.currentData = null;
        this.svg = null;
        this.chartGroup = null;   
        this.handleResize = this.handleResize.bind(this);
        this.debouncedResize = this.debounce(this.handleResize, 100);
    }

    debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    init() {
        this.createSVG();
        this.createTooltip();
        this.loadData();

        window.addEventListener('resize', this.debouncedResize);
    }

    calculateDimensions() {
        // Get the container dimensions
        const container = document.getElementById('chart-container');
        if (!container) return;
        
        const containerWidth = container.clientWidth;
        const containerHeight = Math.min(containerWidth * 0.6, 600); // Maintain aspect ratio
        
        // Calculate new dimensions with responsive margins
        const isMobile = containerWidth < 768;
        this.margin = isMobile 
            ? { top: 40, right: 20, bottom: 60, left: 40 }
            : { top: 60, right: 60, bottom: 80, left: 80 };
            
        this.width = containerWidth - this.margin.left - this.margin.right;
        this.height = containerHeight - this.margin.top - this.margin.bottom;
    }
    
    handleResize() {
        this.calculateDimensions();
        
        // Update SVG dimensions
        d3.select("#chart-container svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);
            
        // Update chart group transform
        this.chartGroup.attr("transform", `translate(${this.margin.left},${this.margin.top})`);
            
        // Redraw if we have data
        if (this.currentData) {
            this.drawChart(this.currentData);
        }
    }

    createSVG() {
        this.svg = d3.select("#chart")
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
    }

    createTooltip() {
        this.tooltip = d3.select("#tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "#fff")
            .style("padding", "5px")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px");
    }

    async loadData() {
        try {
            const { internetData } = await loadAndCleanData();

            const wideDataMap = {};
            internetData.forEach(d => {
                if (!wideDataMap[d.countryCode]) {
                    wideDataMap[d.countryCode] = { 'Country Code': d.countryCode };
                }
                if (d.year === 2000 || d.year === 2022 || d.year === 2023) {
                    wideDataMap[d.countryCode][d.year] = +d.value;
                }
            });

            const wideData = Object.values(wideDataMap);
            const processed = this.processData(wideData);
            this.drawChart(processed);
            this.createLegend();
        } catch (err) {
            console.error("Error loading data:", err);
            this.showError("Failed to load or process data.");
        }
    }

    processData(rawData) {
        if (!Array.isArray(rawData)) return [];

        const continentData = {};
        const continents = ["Asia", "Europe", "North America", "South America", "Africa", "Oceania"];
        
        continents.forEach(continent => {
            continentData[continent] = {
                count2000: 0,
                sum2000: 0,
                count2022: 0,
                sum2022: 0,
                count2023: 0,
                sum2023: 0
            };
        });

                // Continent mapping for countries
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

        rawData.forEach(d => {
            if (!d || typeof d !== 'object') return;

            const continent = continentMap[d['Country Code']];
            if (!continent) return;

            const year2000 = +d['2000'];
            const year2022 = +d['2022'];
            const year2023 = +d['2023'];

            if (!isNaN(year2000) && year2000 > 0) {
                continentData[continent].sum2000 += year2000;
                continentData[continent].count2000++;
            }

            if (continent === "Oceania") {
                if (!isNaN(year2022) && year2022 > 0) {
                    continentData[continent].sum2022 += year2022;
                    continentData[continent].count2022++;
                }
            } else {
                if (!isNaN(year2023) && year2023 > 0) {
                    continentData[continent].sum2023 += year2023;
                    continentData[continent].count2023++;
                }
            }
        });

        const averages = [];

        for (const continent of continents) {
            const data = continentData[continent];
            const avg2000 = data.count2000 > 0 ? data.sum2000 / data.count2000 : 0;
            const avg2023 = (continent === "Oceania")
                ? (data.count2022 > 0 ? data.sum2022 / data.count2022 : 0)
                : (data.count2023 > 0 ? data.sum2023 / data.count2023 : 0);

            averages.push({
                continent,
                year_2000: avg2000,
                year_2023: avg2023
            });
        }

        return averages;
    }

    drawChart(data) {
        this.svg.selectAll("*").remove();

        if (!data || data.length === 0) {
            this.showError("No valid data to display");
            return;
        }

        const x0 = d3.scaleBand()
            .domain(data.map(d => d.continent))
            .range([0, this.width])
            .paddingInner(0.1);
        
        const x1 = d3.scaleBand()
            .domain(['2000', '2023'])
            .range([0, x0.bandwidth()])
            .padding(0.05);
        
        const yMax = d3.max(data, d => Math.max(d.year_2000, d.year_2023));
        const y = d3.scaleLinear()
            .domain([0, yMax * 1.1])
            .range([this.height, 0]);
        
        this.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${this.height})`)
            .call(d3.axisBottom(x0));
        
        this.svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y).ticks(5));
        
        this.svg.append("text")
            .attr("class", "axis-label")
            .attr("x", this.width / 2)
            .attr("y", this.height + 50)
            .attr("text-anchor", "middle")
            .text("Continent");
        
        this.svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .text("Internet Users (% of population)");

        const years = ['2000', '2023'];

        const continentGroups = this.svg.selectAll(".continent")
            .data(data)
            .enter().append("g")
            .attr("class", "continent")
            .attr("transform", d => `translate(${x0(d.continent)},0)`);
        
        continentGroups.selectAll("rect")
            .data(d => years.map(year => ({
                year,
                value: year === '2000' ? d.year_2000 : d.year_2023,
                continent: d.continent
            })))
            .enter().append("rect")
            .attr("x", d => x1(d.year))
            .attr("y", d => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", d => this.height - y(d.value))
            .attr("fill", d => this.yearColor(d.year))
            .on("mouseover", (event, d) => this.showTooltip(event, d, d.year))
            .on("mouseout", () => this.hideTooltip());
    }

    showTooltip(event, d, year) {
        const value = d.value;
        if (value == null || isNaN(value)) return;

        this.tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);

        this.tooltip.html(`<strong>${d.continent}</strong><br>${year}: ${value.toFixed(1)}%`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    hideTooltip() {
        this.tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    createLegend() {
        const legend = d3.select("#legend");
        legend.html(""); // Clear any existing legend

        const years = ["2000", "2023"];
        const colors = years.map(year => ({
            year,
            color: this.yearColor(year)
        }));

        const legendItems = legend.selectAll(".legend-item")
            .data(colors)
            .enter()
            .append("div")
            .attr("class", "legend-item")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-right", "15px");

        legendItems.append("div")
            .style("width", "15px")
            .style("height", "15px")
            .style("background-color", d => d.color)
            .style("margin-right", "5px");

        legendItems.append("span")
            .text(d => d.year);
    }

    showError(message) {
        d3.select("#chart").append("div")
            .attr("class", "error-message")
            .text(message);
    }

    destroy() {
        window.removeEventListener('resize', this.debouncedResize);
    }
}

// Initialize chart when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const chart = new InternetUsageBarChart();
    chart.init();
});
