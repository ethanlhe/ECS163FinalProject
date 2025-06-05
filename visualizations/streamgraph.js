import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { loadAndCleanData } from '../data/dataLoader.js';

export class InternetGDPStreamGraph {
    constructor() {
        this.margin = { top: 100, right: 60, bottom: 200, left: 60 };
        this.width = 1000;
        this.height = 500;
        this.currentRatioType = 'internetOverGDP'; // Default ratio type

        this.currentData = null;

        this.continentColor = d3.scaleOrdinal()
            .domain(["Asia", "Europe", "North America", "South America", "Africa", "Oceania"])
            .range(["#4e79a7", "#f28e2b", "#e15759", "#edc948", "#76b7b2", "#59a14f"]);

    // Country name to ISO3 code mapping
    this.countryNameToCode = {
      'Afghanistan': 'AFG', 'Albania': 'ALB', 'Algeria': 'DZA', 'Andorra': 'AND', 'Angola': 'AGO',
      'Antigua and Barbuda': 'ATG', 'Argentina': 'ARG', 'Armenia': 'ARM', 'Aruba': 'ABW',
      'Australia': 'AUS', 'Austria': 'AUT', 'Azerbaijan': 'AZE', 'Bahamas, The': 'BHS',
      'Bahrain': 'BHR', 'Bangladesh': 'BGD', 'Barbados': 'BRB', 'Belarus': 'BLR', 'Belgium': 'BEL',
      'Belize': 'BLZ', 'Benin': 'BEN', 'Bermuda': 'BMU', 'Bhutan': 'BTN', 'Bolivia': 'BOL',
      'Bosnia and Herzegovina': 'BIH', 'Botswana': 'BWA', 'Brazil': 'BRA', 'Brunei': 'BRN',
      'Bulgaria': 'BGR', 'Burkina Faso': 'BFA', 'Burundi': 'BDI', 'Cabo Verde': 'CPV', 'Cambodia': 'KHM',
      'Cameroon': 'CMR', 'Canada': 'CAN', 'Central African Republic': 'CAF', 'Chad': 'TCD',
      'Chile': 'CHL', 'China': 'CHN', 'Colombia': 'COL', 'Comoros': 'COM', 'Congo, Dem. Rep.': 'COD',
      'Congo, Rep.': 'COG', 'Costa Rica': 'CRI', "Cote d'Ivoire": 'CIV', 'Croatia': 'HRV',
      'Cuba': 'CUB', 'Cyprus': 'CYP', 'Czech Republic': 'CZE', 'Denmark': 'DNK', 'Djibouti': 'DJI',
      'Dominica': 'DMA', 'Dominican Republic': 'DOM', 'Ecuador': 'ECU', 'Egypt, Arab Rep.': 'EGY',
      'El Salvador': 'SLV', 'Equatorial Guinea': 'GNQ', 'Eritrea': 'ERI', 'Estonia': 'EST',
      'Eswatini': 'SWZ', 'Ethiopia': 'ETH', 'Fiji': 'FJI','Finland': 'FIN', 'France': 'FRA', 'Gabon': 'GAB',
      'Gambia, The': 'GMB', 'Georgia': 'GEO', 'Germany': 'DEU', 'Ghana': 'GHA', 'Greece': 'GRC', 
      'Grenada': 'GRD', 'Guatemala': 'GTM', 'Guinea': 'GIN', 'Guinea-Bissau': 'GNB',
      'Guyana': 'GUY', 'Haiti': 'HTI', 'Honduras': 'HND', 'Hong Kong SAR, China': 'HKG',
      'Hungary': 'HUN', 'Iceland': 'ISL', 'India': 'IND', 'Indonesia': 'IDN', 'Iran, Islamic Rep.': 'IRN',
      'Iraq': 'IRQ', 'Ireland': 'IRL', 'Israel': 'ISR', 'Italy': 'ITA', 'Jamaica': 'JAM', 'Japan': 'JPN',
      'Jordan': 'JOR', 'Kazakhstan': 'KAZ', 'Kenya': 'KEN', 'Kiribati': 'KIR', 'Korea, Rep.': 'KOR', 
      'Kosovo': 'XKX', 'Kuwait': 'KWT', 'Kyrgyz Republic': 'KGZ', 'Lao PDR': 'LAO',
      'Latvia': 'LVA', 'Lebanon': 'LBN', 'Lesotho': 'LSO', 'Liberia': 'LBR', 'Libya': 'LBY',
      'Liechtenstein': 'LIE', 'Lithuania': 'LTU', 'Luxembourg': 'LUX', 'Macao SAR, China': 'MAC',
      'Madagascar': 'MDG', 'Malawi': 'MWI', 'Malaysia': 'MYS', 'Maldives': 'MDV', 'Mali': 'MLI',
      'Malta': 'MLT', 'Marshall Islands': 'MHL', 'Mauritania': 'MRT', 'Mauritius': 'MUS',
      'Mexico': 'MEX', 'Micronesia, Fed. Sts.': 'FSM', 'Moldova': 'MDA', 'Monaco': 'MCO',
      'Mongolia': 'MNG', 'Montenegro': 'MNE', 'Morocco': 'MAR', 'Mozambique': 'MOZ',
      'Myanmar': 'MMR', 'Namibia': 'NAM', 'Nauru': 'NRU', 'Nepal': 'NPL', 'Netherlands': 'NLD',
      'New Zealand': 'NZL', 'Nicaragua': 'NIC', 'Niger': 'NER', 'Nigeria': 'NGA',
      'North Macedonia': 'MKD', 'Norway': 'NOR', 'Oman': 'OMN', 'Pakistan': 'PAK', 'Palau': 'PLW',
      'Panama': 'PAN', 'Papua New Guinea': 'PNG', 'Paraguay': 'PRY', 'Peru': 'PER',
      'Philippines': 'PHL', 'Poland': 'POL', 'Portugal': 'PRT', 'Puerto Rico': 'PRI', 'Qatar': 'QAT',
      'Romania': 'ROU', 'Russian Federation': 'RUS', 'Rwanda': 'RWA', 'Samoa': 'WSM', 'San Marino': 'SMR',
      'Sao Tome and Principe': 'STP', 'Saudi Arabia': 'SAU', 'Senegal': 'SEN', 'Serbia': 'SRB', 'Seychelles': 'SYC',
      'Sierra Leone': 'SLE', 'Singapore': 'SGP', 'Slovak Republic': 'SVK', 'Slovenia': 'SVN',
      'Solomon Islands': 'SLB', 'Somalia': 'SOM', 'South Africa': 'ZAF', 'South Sudan': 'SSD', 'Spain': 'ESP',
      'Sri Lanka': 'LKA', 'St. Kitts and Nevis': 'KNA', 'St. Lucia': 'LCA', 'St. Vincent and the Grenadines': 'VCT',
      'Sudan': 'SDN', 'Suriname': 'SUR', 'Sweden': 'SWE', 'Switzerland': 'CHE', 'Syrian Arab Republic': 'SYR',
      'Tajikistan': 'TJK', 'Tanzania': 'TZA', 'Thailand': 'THA', 'Timor-Leste': 'TLS', 'Togo': 'TGO',
      'Tonga': 'TON', 'Trinidad and Tobago': 'TTO', 'Tunisia': 'TUN', 'Turkey': 'TUR',
      'Turkmenistan': 'TKM', 'Tuvalu': 'TUV', 'Uganda': 'UGA', 'Ukraine': 'UKR', 'United Arab Emirates': 'ARE',
      'United Kingdom': 'GBR', 'United States': 'USA', 'Uruguay': 'URY', 'Uzbekistan': 'UZB',
      'Vanuatu': 'VUT', 'Venezuela, RB': 'VEN', 'Viet Nam': 'VNM', 'Virgin Islands (U.S.)': 'VIR',
      'West Bank and Gaza': 'PSE', 'Yemen, Rep.': 'YEM', 'Zambia': 'ZMB', 'Zimbabwe': 'ZWE',

      // Regional Aggregates 
      'Africa Eastern and Southern': 'AFE', 'Africa Western and Central': 'AFW',
      'Arab World': 'ARB', 'Caribbean small states': 'CSS',
      'Central Europe and the Baltics': 'CEB', 'Early-demographic dividend': '',
      'East Asia & Pacific': 'EAS', 'Euro area': 'EMU',
      'Europe & Central Asia': 'ECS', 'European Union': 'EUU',
      'Fragile and conflict affected situations': '', 'Heavily indebted poor countries (HIPC)': '',
      'Latin America & Caribbean': 'LCN', 'Least developed countries: UN classification': '',
      'Middle East & North Africa': 'MEA', 'North America': 'NAC', 'OECD members': 'OED',
      'Other small states': '', 'Pacific island small states': 'PSS',
      'Small states': '', 'South Asia': 'SAS','Sub-Saharan Africa': 'SSF', 'World': 'WLD'
    };

    // Continent mapping (ISO3 to continent)
    this.continentMap = {
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
      'URY': 'South America', 'VEN': 'South America',
      
      // Handle regional aggregates
      'AFE': 'Africa', 'AFW': 'Africa', 'ARB': 'Asia', 'CSS': 'North America',
      'CEB': 'Europe', 'EAS': 'Asia', 'EMU': 'Europe', 'ECS': 'Europe',
      'EUU': 'Europe', 'LCN': 'South America', 'MEA': 'Asia', 'NAC': 'North America',
      'OED': 'Europe', 'PSS': 'Oceania', 'SAS': 'Asia', 'SSF': 'Africa'
        };

        this.handleResize = this.handleResize.bind(this);
    }

    async init() {
        this.createSVG();
        this.createTooltip();
        await this.loadData();

        window.addEventListener('resize', this.handleResize);
    }

    calculateDimensions() {
        // This will be overridden in main.js for dashboard integration
        return;
    }

    handleResize() {
        this.calculateDimensions();
        
        // Update SVG dimensions
        this.svg.attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);
            
        // Redraw if we have data
        if (this.currentData) {
            this.drawStreamGraph(this.currentData);
        }
    }

    createSVG() {
        // This will be overridden in main.js for dashboard integration
        return;
    }

    createTooltip() {
        this.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "#fff")
            .style("padding", "8px 12px")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("pointer-events", "none");
    }

    async loadData() {
        try {
            const { gdpData, internetData } = await loadAndCleanData();
            const processed = this.processRatioData(gdpData, internetData);
            this.drawStreamGraph(processed);
        } catch (err) {
            console.error("Error loading data:", err);
            this.showError("Failed to load or process data.");
        }
    }

    processRatioData(gdpData, internetData) {
        const years = d3.range(2000, 2024);
        const continents = ["Asia", "Europe", "North America", "South America", "Africa", "Oceania"];

        const dataByContinent = {};
        continents.forEach(continent => {
            dataByContinent[continent] = { GDP: {}, Internet: {}, Ratio: {} };
            years.forEach(year => {
                dataByContinent[continent].GDP[year] = 0;
                dataByContinent[continent].Internet[year] = 0;
            });
        });

        // Aggregate data
        gdpData.forEach(d => {
            const code = this.countryNameToCode[d.country];
            const continent = code ? this.continentMap[code] : null;
            if (continent && d.year >= 2000 && d.year <= 2023) {
                const val = +d.value || 0;
                dataByContinent[continent].GDP[d.year] += val / 1e9;
            }
        });

        internetData.forEach(d => {
            const code = this.countryNameToCode[d.country];
            const continent = code ? this.continentMap[code] : null;
            if (continent && d.year >= 2000 && d.year <= 2023) {
                const val = +d.value || 0;
                dataByContinent[continent].Internet[d.year] += val;
            }
        });

        // Compute ratio based on current mode
        years.forEach(year => {
            continents.forEach(continent => {
                const gdp = dataByContinent[continent].GDP[year];
                const internet = dataByContinent[continent].Internet[year];
                
                if (this.currentRatioType === 'internetOverGDP') {
                    dataByContinent[continent].Ratio[year] = gdp > 0 ? (internet / gdp) : 0;
                } else {
                    dataByContinent[continent].Ratio[year] = internet > 0 ? (gdp / internet) : 0;
                }
            });
        });

        return years.map(year => {
            const row = { year };
            continents.forEach(c => {
                row[c] = dataByContinent[c].Ratio[year];
            });
            return row;
        });
    }

    drawStreamGraph(data) {

        this.currentData = data;

        this.svg.selectAll("*").remove();

        const continents = ["Asia", "Europe", "North America", "South America", "Africa", "Oceania"];
        const stack = d3.stack()
            .keys(continents)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetSilhouette);

        const stacked = stack(data);

        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, this.width]);

        const yMax = d3.max(stacked, series =>
            d3.max(series, d => Math.max(Math.abs(d[0]), Math.abs(d[1])))
        ) || 1;

        const y = d3.scaleLinear()
            .domain([-yMax, yMax])
            .range([this.height, 0]);

        const area = d3.area()
            .x(d => x(d.data.year))
            .y0(d => y(d[0]))
            .y1(d => y(d[1]))
            .curve(d3.curveBasis);

        this.svg.selectAll(".stream-area")
            .data(stacked)
            .enter().append("path")
            .attr("class", "stream-area")
            .attr("d", area)
            .attr("fill", d => this.continentColor(d.key))
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .on("mouseover", (event, d) => {

                    const value = this.currentRatioType === 'internetOverGDP'
                    ? (d[1] - d[0]).toFixed(4)
                    : (1/(d[1] - d[0])).toFixed(2);
                
                this.tooltip.transition().duration(200).style("opacity", 0.9);
                this.tooltip.html(`<strong>${d.key}`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 28}px`);
            })
            .on("mouseout", () => {
                this.tooltip.transition().duration(500).style("opacity", 0);
            });

        // Axes
        const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
        this.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${this.height})`)
            .call(xAxis);

        const yAxis = d3.axisLeft(y);

        // Labels
        this.svg.append("text")
            .attr("class", "axis-label")
            .attr("x", this.width / 2)
            .attr("y", this.height + 40)
            .attr("text-anchor", "middle")
            .text("Year");

        const yLabel = this.currentRatioType === 'internetOverGDP'
            ? "Internet Usage / GDP Ratio"
            : "GDP / Internet Usage Ratio";
            
        this.svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .text(yLabel);
    }

    showError(message) {
        if (this.svg) {
            this.svg.append("text")
                .attr("x", this.width / 2)
                .attr("y", this.height / 2)
                .attr("text-anchor", "middle")
                .text(message);
        }
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize);
        if (this.tooltip) {
            this.tooltip.remove();
        }
    }
}
