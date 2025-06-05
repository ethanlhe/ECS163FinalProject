import { createLineChart } from './linechart.js';
import { createSlopeChart } from './slopechart.js';
import { createStreamGraph } from './streamgraph.js';
import { createBarChart } from './barchart.js';

export async function initHeatmap(container, initialYear = 2000) {
    container.innerHTML = '';
    // Add toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'heatmapToggle';
    toggleBtn.textContent = 'Switch to Internet Usage';
    document.querySelector('.map-toolbar').appendChild(toggleBtn);

    // Constants
    const width = 1400;
    const height = 500;
    let currentYear = initialYear;
    let currentMode = 'gdp'; // 'gdp' or 'internet'

    // Country name mapping
    const countryNameMap = {
        'North Macedonia': 'Macedonia',
        'Serbia': 'Republic of Serbia',
        'Viet Nam': 'Vietnam',
        'Guinea-Bissau': 'Guinea Bissau',
        'Cote d\'Ivoire': 'Ivory Coast',
        'United States': 'USA',
        'United Kingdom': 'England',
        'Czechia': 'Czech Republic',
        'Congo, Dem. Rep.': 'Democratic Republic of the Congo',
        'Congo, Rep.': 'Republic of the Congo',
        'Egypt, Arab Rep.': 'Egypt',
        'Gambia, The': 'Gambia',
        'Hong Kong SAR, China': 'Hong Kong',
        'Iran, Islamic Rep.': 'Iran',
        'Korea, Rep.': 'South Korea',
        'Korea, Dem. People\'s Rep.': 'North Korea',
        'Kyrgyz Republic': 'Kyrgyzstan',
        'Lao PDR': 'Laos',
        'Macao SAR, China': 'Macau',
        'Macedonia, FYR': 'Macedonia',
        'Micronesia, Fed. Sts.': 'Micronesia',
        'Russian Federation': 'Russia',
        'Slovak Republic': 'Slovakia',
        'Syrian Arab Republic': 'Syria',
        'Tanzania': 'United Republic of Tanzania',
        'Timor-Leste': 'East Timor',
        'Turkiye': 'Turkey',
        'United Arab Emirates, The': 'United Arab Emirates',
        'Venezuela, RB': 'Venezuela',
        'Virgin Islands (U.S.)': 'U.S. Virgin Islands',
        'Yemen, Rep.': 'Yemen'
    };

    // Helper function to get the correct country name
    function getCountryName(country) {
        return countryNameMap[country] || country;
    }

    // Create SVG container (responsive)
    const svg = d3.select(container)
        .append('svg')
        .attr('class', 'responsive-svg')
        .attr('viewBox', `0 0 ${width} ${height}`);

    // Add pattern for "no data"
    svg.append('defs').append('pattern')
        .attr('id', 'no-data-pattern')
        .attr('width', 6)
        .attr('height', 6)
        .attr('patternUnits', 'userSpaceOnUse')
        .append('path')
        .attr('d', 'M0,0 l6,6 M6,0 l-6,6')
        .attr('stroke', '#bbb')
        .attr('stroke-width', 1);

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

    // --- Modal Overlay Setup ---
    // Create modal elements (hidden by default)
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'heatmapModalOverlay';
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100vw';
    modalOverlay.style.height = '100vh';
    modalOverlay.style.background = 'rgba(0,0,0,0.45)';
    modalOverlay.style.display = 'none';
    modalOverlay.style.zIndex = '10000';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.transition = 'opacity 0.2s';

    const modalContent = document.createElement('div');
    modalContent.id = 'heatmapModalContent';
    modalContent.style.background = 'white';
    modalContent.style.borderRadius = '10px';
    modalContent.style.boxShadow = '0 2px 16px rgba(0,0,0,0.2)';
    modalContent.style.padding = '32px 24px';
    modalContent.style.minWidth = '600px';
    modalContent.style.maxWidth = '90vw';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';
    modalContent.style.position = 'relative';

    // Placeholder for modal content
    modalContent.innerHTML = `<div style="text-align:center;font-size:1.3em;">Country Details Modal (charts coming soon)</div>`;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Close modal when clicking outside content
    modalOverlay.addEventListener('mousedown', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });

    // Declare data maps in outer scope
    let gdpDataMap, internetDataMap;

    // Store selected countries globally for modal persistence
    let modalSelectedCountries = null;
    let modalShowOnlyRealCountries = true;

    // List of valid country names (from names.txt)
    const validCountryNames = [
        'Afghanistan','Albania','Algeria','Angola','Antarctica','Argentina','Armenia','Australia','Austria','Azerbaijan','Bangladesh','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Democratic Republic of the Congo','Denmark','Djibouti','Dominican Republic','East Timor','Ecuador','Egypt','El Salvador','England','Equatorial Guinea','Eritrea','Estonia','Ethiopia','Falkland Islands','Fiji','Finland','France','French Southern and Antarctic Lands','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Greenland','Guatemala','Guinea','Guinea Bissau','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Ivory Coast','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Lithuania','Luxembourg','Macedonia','Madagascar','Malawi','Malaysia','Mali','Mauritania','Mexico','Moldova','Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nepal','Netherlands','New Caledonia','New Zealand','Nicaragua','Niger','Nigeria','North Korea','Northern Cyprus','Norway','Oman','Pakistan','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Puerto Rico','Qatar','Republic of Serbia','Republic of the Congo','Romania','Russia','Rwanda','Saudi Arabia','Senegal','Sierra Leone','Slovakia','Slovenia','Solomon Islands','Somalia','Somaliland','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Swaziland','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Thailand','The Bahamas','Togo','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','USA','Uganda','Ukraine','United Arab Emirates','United Republic of Tanzania','Uruguay','Uzbekistan','Vanuatu','Venezuela','Vietnam','West Bank','Western Sahara','Yemen','Zambia','Zimbabwe'
    ];

    function isRealCountry(name) {
        const excludePatterns = [
            /World/i, /income/i, /area/i, /Union/i, /members/i, /total/i, /dividend/i, /Euro/i, /OECD/i, /IDA/i, /IBRD/i, /Post-demographic/i, /High income/i, /Low & middle income/i, /Middle income/i
        ];
        return !excludePatterns.some(re => re.test(name));
    }

    function formatGDP(val) {
        if (val == null) return 'No data';
        if (val >= 1e12) return '$' + (val / 1e12).toFixed(2) + 'T';
        if (val >= 1e9) return '$' + (val / 1e9).toFixed(2) + 'B';
        if (val >= 1e6) return '$' + (val / 1e6).toFixed(2) + 'M';
        if (val >= 1e3) return '$' + (val / 1e3).toFixed(2) + 'k';
        return '$' + d3.format(',.2f')(val);
    }

    try {
        // Load and process data
        const [geoData, gdpData, internetData] = await Promise.all([
            d3.json('data/world.geojson'),
            d3.csv('data/global_gdp.csv'),
            d3.csv('data/internet_usage.csv')
        ]);

        // Convert GDP data
        const processedGdpData = gdpData.flatMap(row => {
            const years = Object.keys(row).filter(key => !isNaN(+key) && +key >= 2000);
            return years.map(year => ({
                country: row['Country Name'],
                geoName: getCountryName(row['Country Name']),
                year: +year,
                value: row[year] === '..' ? null : +row[year]
            }));
        }).filter(d => d.value !== null);

        // Convert Internet data
        const processedInternetData = internetData.flatMap(row => {
            const years = Object.keys(row).filter(key => !isNaN(+key) && +key >= 2000);
            return years.map(year => ({
                country: row['Country Name'],
                geoName: getCountryName(row['Country Name']),
                year: +year,
                value: row[year] === '..' ? null : +row[year]
            }));
        }).filter(d => d.value !== null);

        // Calculate global percentiles for all years (for both datasets)
        const allGdpValues = processedGdpData.map(d => d.value).sort((a, b) => a - b);
        const gdpP10 = d3.quantile(allGdpValues, 0.1);
        const gdpP90 = d3.quantile(allGdpValues, 0.9);
        const allInternetValues = processedInternetData.map(d => d.value).sort((a, b) => a - b);
        const internetP10 = d3.quantile(allInternetValues, 0.1);
        const internetP90 = d3.quantile(allInternetValues, 0.9);

        // Create maps for quick lookup
        gdpDataMap = new Map();
        processedGdpData.forEach(d => {
            if (!gdpDataMap.has(d.geoName)) gdpDataMap.set(d.geoName, new Map());
            gdpDataMap.get(d.geoName).set(d.year, d.value);
        });
        internetDataMap = new Map();
        processedInternetData.forEach(d => {
            if (!internetDataMap.has(d.geoName)) internetDataMap.set(d.geoName, new Map());
            internetDataMap.get(d.geoName).set(d.year, d.value);
        });

        // Create projection
        const projection = d3.geoNaturalEarth1().fitSize([width, height], geoData);
        const path = d3.geoPath().projection(projection);

        // Draw countries
        const countries = svg.append('g')
            .selectAll('path')
            .data(geoData.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('stroke', '#222')
            .attr('stroke-width', 0.7);

        // Custom interpolator: green (low) to blue (high)
        const customInterpolator = d3.interpolateRgbBasis(["#b7e075", "#4fa49a", "#2171b5"]);
        let colorScaleGdp = d3.scaleSequential(customInterpolator).domain([gdpP10, gdpP90]);
        let colorScaleInternet = d3.scaleSequential(customInterpolator).domain([internetP10, internetP90]);

        // Function to update the visualization
        function update(year) {
            currentYear = year;
            let yearData, colorScale, valueLabel, legendMin, legendMax, legendFormat, tooltipValue, noDataFill, legendTitle;
            if (currentMode === 'gdp') {
                yearData = Array.from(gdpDataMap.entries()).map(([country, yearMap]) => ({
                    country,
                    value: yearMap.get(year)
                })).filter(d => d.value !== undefined);
                colorScale = colorScaleGdp;
                valueLabel = d => d ? ('$' + d3.format(',.2f')(d)) : 'No data';
                legendMin = gdpP10;
                legendMax = gdpP90;
                legendFormat = d => `$${d3.format(',.2f')(d)}`;
                tooltipValue = d => d ? ('$' + d3.format(',.2f')(d)) : 'No data';
                noDataFill = 'url(#no-data-pattern)';
                legendTitle = `GDP (US Dollars, ${currentYear})`;
            } else {
                yearData = Array.from(internetDataMap.entries()).map(([country, yearMap]) => ({
                    country,
                    value: yearMap.get(year)
                })).filter(d => d.value !== undefined);
                colorScale = colorScaleInternet;
                valueLabel = d => d ? (d3.format('.1f')(d) + '%') : 'No data';
                legendMin = internetP10;
                legendMax = internetP90;
                legendFormat = d => `${d3.format('.1f')(d)}%`;
                tooltipValue = d => d ? (d3.format('.1f')(d) + '%') : 'No data';
                noDataFill = 'url(#no-data-pattern)';
                legendTitle = `Internet Access (% of Population, ${currentYear})`;
            }

            // Update country colors
            countries
                .attr('fill', d => {
                    const countryData = yearData.find(c => c.country === getCountryName(d.properties.name));
                    return countryData ? colorScale(countryData.value) : noDataFill;
                });

            // Update tooltip content
            countries
                .on('mouseover', function(event, d) {
                    const countryData = yearData.find(c => c.country === getCountryName(d.properties.name));
                    const originalName = Object.entries(countryNameMap).find(([_, geoName]) => geoName === d.properties.name)?.[0] || d.properties.name;
                    
                    // Highlight hovered country
                    d3.select(this)
                        .attr('stroke', '#5525c4')
                        .attr('stroke-width', 2);
                    
                    tooltip.transition()
                        .duration(200)
                        .style('opacity', 0.95);
                    tooltip.html(`
                        <strong>${originalName}</strong><br/>
                        ${currentMode === 'gdp' ? 'GDP' : 'Internet Access'} (${year}): ${tooltipValue(countryData ? countryData.value : null)}<br/>
                        <span style="color: #2171b5; font-size: 0.9em; cursor: pointer;">Click to show more details</span>
                    `)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', function() {
                    // Remove highlight
                    d3.select(this)
                        .attr('stroke', '#222')
                        .attr('stroke-width', 0.7);
                        
                    tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                })
                .on('click', function(event, d) {
                    // Open modal overlay on country click
                    const originalName = Object.entries(countryNameMap).find(([_, geoName]) => geoName === d.properties.name)?.[0] || d.properties.name;
                    openModal(originalName, true); // force reset selection on new country
                });

            // Update legend
            updateLegend(legendMin, legendMax, legendFormat, legendTitle);
        }

        // Function to update the legend
        function updateLegend(min, max, format, legendTitle) {
            d3.select(container).selectAll('.legend-svg').remove();
            const legendWidth = 300;
            const legendHeight = 16;
            const legendSvg = d3.select(container)
                .append('svg')
                .attr('class', 'legend-svg')
                .attr('width', legendWidth + 80)
                .attr('height', legendHeight + 40)
                .style('display', 'block')
                .style('margin', '30px auto 0 auto');
            // Create gradient
            const defs = legendSvg.append('defs');
            const linearGradient = defs.append('linearGradient')
                .attr('id', 'legend-gradient');
            linearGradient.selectAll('stop')
                .data(d3.range(0, 1.01, 0.01))
                .enter().append('stop')
                .attr('offset', d => `${d * 100}%`)
                .attr('stop-color', d => customInterpolator(d));
            // Add gradient rectangle
            legendSvg.append('rect')
                .attr('x', 0)
                .attr('y', -4)
                .attr('width', legendWidth)
                .attr('height', legendHeight)
                .style('fill', 'url(#legend-gradient)');
            // Always add "No data" swatch
            legendSvg.append('rect')
                .attr('x', legendWidth + 40)
                .attr('y', -4)
                .attr('width', 24)
                .attr('height', legendHeight)
                .style('fill', 'url(#no-data-pattern)');
            legendSvg.append('text')
                .attr('x', legendWidth + 28)
                .attr('y', legendHeight + 12)
                .attr('text-anchor', 'start')
                .attr('font-size', '13px')
                .text('No data');
            // Add labels
            legendSvg.append('text')
                .attr('x', 0)
                .attr('y', legendHeight + 12)
                .attr('text-anchor', 'start')
                .attr('font-size', '13px')
                .text(format(min));
            legendSvg.append('text')
                .attr('x', legendWidth)
                .attr('y', legendHeight + 12)
                .attr('text-anchor', 'end')
                .attr('font-size', '13px')
                .text(format(max));
            legendSvg.append('text')
                .attr('x', legendWidth / 2)
                .attr('y', legendHeight + 28)
                .attr('text-anchor', 'middle')
                .attr('font-size', '14px')
                .attr('font-weight', 'bold')
                .text(legendTitle);
        }

        // Function to open modal (move here so it can access the data maps)
        function openModal(countryName, forceResetSelection = false) {
            // Get all available countries for the current mode, filtered by validCountryNames
            const countryList = (currentMode === 'gdp'
                ? Array.from(gdpDataMap.keys())
                : Array.from(internetDataMap.keys())
            ).filter(c => validCountryNames.includes(c));

            // Find GDP/Internet value for clicked country and sort by similarity (for the current year and metric)
            let selectedCountry = countryNameMap[countryName] || countryName;
            let countryValues = (currentMode === 'gdp' ? gdpDataMap : internetDataMap);
            let yearMap = countryValues.get(selectedCountry);
            let value = yearMap ? yearMap.get(currentYear) : null;
            // Sort by absolute difference in value for the current year
            let sortedCountries = countryList
                .map(c => ({
                    name: c,
                    val: (countryValues.get(c) && countryValues.get(c).get(currentYear)) || null
                }))
                .filter(d => d.val !== null && d.name !== selectedCountry)
                .sort((a, b) => Math.abs(a.val - value) - Math.abs(b.val - value));
            // Pick top 4 similar countries
            let similarCountries = sortedCountries.slice(0, 4).map(d => d.name);
            // Initial selection: clicked + similar (reset if forceResetSelection or no persistent selection)
            let initialSelected = (modalSelectedCountries && modalSelectedCountries.length > 0 && !forceResetSelection)
                ? modalSelectedCountries
                : [selectedCountry, ...similarCountries];
            let sidebarState = {
                search: '',
                sort: currentMode, // 'gdp', 'internet', or 'name'
                selected: new Set(initialSelected),
                showOnlyReal: modalShowOnlyRealCountries
            };

            // --- Modal time slider state ---
            // Get available years from data (restrict to 2000-2020)
            const allYears = Array.from(new Set([
                ...Array.from(gdpDataMap.values()).flatMap(m => Array.from(m.keys())),
                ...Array.from(internetDataMap.values()).flatMap(m => Array.from(m.keys())),
            ])).filter(y => y >= 2000 && y <= 2020).sort((a, b) => a - b);
            let sliderState = {
                start: allYears[0],
                end: allYears[allYears.length - 1]
            };

            // --- Render time slider (dual slider with number inputs) ---
            function renderTimeSlider() {
                const minYear = allYears[0];
                const maxYear = allYears[allYears.length - 1];
                // Inject slider styles (only once)
                if (!document.getElementById('modalRangeSliderStyles')) {
                    const style = document.createElement('style');
                    style.id = 'modalRangeSliderStyles';
                    style.textContent = `
                    .range_container { display: flex; flex-direction: row; align-items: center; width: 100%; margin: 0 0 18px 0; }
                    .sliders_control { position: relative; min-height: 50px; flex: 1; margin: 0 18px; }
                    .form_control { display: flex; flex-direction: row; align-items: center; gap: 8px; }
                    .form_control_container { display: flex; flex-direction: column; align-items: center; }
                    .form_control_container__time { font-size: 15px; color: #635a5a; margin-bottom: 2px; }
                    .form_control_container__time__input { color: #8a8383; width: 60px; height: 30px; font-size: 18px; border: none; text-align: center; background: #f7f7f7; border-radius: 6px; }
                    .modal-range-slider::-webkit-slider-thumb { -webkit-appearance: none; pointer-events: all; width: 20px; height: 20px; background-color: #fff; border-radius: 50%; box-shadow: 0 0 0 1px #C6C6C6; cursor: pointer; }
                    .modal-range-slider::-moz-range-thumb { pointer-events: all; width: 20px; height: 20px; background-color: #fff; border-radius: 50%; box-shadow: 0 0 0 1px #C6C6C6; cursor: pointer; }
                    .modal-range-slider::-webkit-slider-thumb:hover { background: #f7f7f7; }
                    .modal-range-slider::-webkit-slider-thumb:active { box-shadow: inset 0 0 3px #387bbe, 0 0 9px #387bbe; }
                    input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { opacity: 1; }
                    .modal-range-slider { -webkit-appearance: none; appearance: none; height: 2px; width: 100%; position: absolute; background-color: #C6C6C6; pointer-events: none; }
                    #fromSlider.modal-range-slider { height: 0; z-index: 1; }
                    `;
                    document.head.appendChild(style);
                }
                // HTML for single-row slider + inputs
                const sliderHtml = `
                    <div class="range_container">
                        <div class="form_control_container">
                            <div class="form_control_container__time">Start</div>
                            <input class="form_control_container__time__input" type="number" id="fromInput" value="${sliderState.start}" min="${minYear}" max="${maxYear - 1}">
                        </div>
                        <div class="sliders_control">
                            <input id="fromSlider" class="modal-range-slider" type="range" min="${minYear}" max="${maxYear}" value="${sliderState.start}" step="1">
                            <input id="toSlider" class="modal-range-slider" type="range" min="${minYear}" max="${maxYear}" value="${sliderState.end}" step="1">
                        </div>
                        <div class="form_control_container">
                            <div class="form_control_container__time">End</div>
                            <input class="form_control_container__time__input" type="number" id="toInput" value="${sliderState.end}" min="${minYear + 1}" max="${maxYear}">
                        </div>
                    </div>
                `;
                modalContent.querySelector('#modalTimeSliderContainer').innerHTML = sliderHtml;

                // Dual slider logic (same as before)
                function getParsed(currentFrom, currentTo) {
                    const from = parseInt(currentFrom.value, 10);
                    const to = parseInt(currentTo.value, 10);
                    return [from, to];
                }
                function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
                    const rangeDistance = to.max - to.min;
                    const fromPosition = from.value - to.min;
                    const toPosition = to.value - to.min;
                    controlSlider.style.background = `linear-gradient(
                      to right,
                      ${sliderColor} 0%,
                      ${sliderColor} ${(fromPosition)/(rangeDistance)*100}%,
                      ${rangeColor} ${((fromPosition)/(rangeDistance))*100}%,
                      ${rangeColor} ${(toPosition)/(rangeDistance)*100}%, 
                      ${sliderColor} ${(toPosition)/(rangeDistance)*100}%, 
                      ${sliderColor} 100%)`;
                }
                function setToggleAccessible(currentTarget) {
                    const toSlider = modalContent.querySelector('#toSlider');
                    if (Number(currentTarget.value) <= 0 ) {
                        toSlider.style.zIndex = 2;
                    } else {
                        toSlider.style.zIndex = 0;
                    }
                }
                function controlFromInput(fromSlider, fromInput, toInput, controlSlider) {
                    const [from, to] = getParsed(fromInput, toInput);
                    fillSlider(fromInput, toInput, '#C6C6C6', '#2171b5', controlSlider);
                    if (from > to) {
                        fromSlider.value = to;
                        fromInput.value = to;
                    } else {
                        fromSlider.value = from;
                    }
                    sliderState.start = Math.min(from, to - 1);
                    renderSidebar();
                    updateCharts();
                }
                function controlToInput(toSlider, fromInput, toInput, controlSlider) {
                    const [from, to] = getParsed(fromInput, toInput);
                    fillSlider(fromInput, toInput, '#C6C6C6', '#2171b5', controlSlider);
                    setToggleAccessible(toInput);
                    if (from <= to) {
                        toSlider.value = to;
                        toInput.value = to;
                    } else {
                        toInput.value = from;
                    }
                    sliderState.end = Math.max(to, from + 1);
                    renderSidebar();
                    updateCharts();
                }
                function controlFromSlider(fromSlider, toSlider, fromInput) {
                    const [from, to] = getParsed(fromSlider, toSlider);
                    fillSlider(fromSlider, toSlider, '#C6C6C6', '#2171b5', toSlider);
                    if (from > to) {
                        fromSlider.value = to;
                        fromInput.value = to;
                    } else {
                        fromInput.value = from;
                    }
                    sliderState.start = Math.min(from, to - 1);
                    renderSidebar();
                    updateCharts();
                }
                function controlToSlider(fromSlider, toSlider, toInput) {
                    const [from, to] = getParsed(fromSlider, toSlider);
                    fillSlider(fromSlider, toSlider, '#C6C6C6', '#2171b5', toSlider);
                    setToggleAccessible(toSlider);
                    if (from <= to) {
                        toSlider.value = to;
                        toInput.value = to;
                    } else {
                        toInput.value = from;
                        toSlider.value = from;
                    }
                    sliderState.end = Math.max(to, from + 1);
                    renderSidebar();
                    updateCharts();
                }
                // Attach event listeners
                const fromSlider = modalContent.querySelector('#fromSlider');
                const toSlider = modalContent.querySelector('#toSlider');
                const fromInput = modalContent.querySelector('#fromInput');
                const toInput = modalContent.querySelector('#toInput');
                fillSlider(fromSlider, toSlider, '#C6C6C6', '#2171b5', toSlider);
                setToggleAccessible(toSlider);
                fromSlider.oninput = () => controlFromSlider(fromSlider, toSlider, fromInput);
                toSlider.oninput = () => controlToSlider(fromSlider, toSlider, toInput);
                fromInput.oninput = () => controlFromInput(fromSlider, fromInput, toInput, toSlider);
                toInput.oninput = () => controlToInput(toSlider, fromInput, toInput, toSlider);
            }

            // --- Helper to get country value for display (end year for bar, current year for neighbor selection) ---
            function getCountryValueForBar(c) {
                let v;
                if (currentMode === 'gdp') {
                    v = (gdpDataMap.get(c) && gdpDataMap.get(c).get(sliderState.end)) || null;
                    return v == null ? 'No data' : formatGDP(v);
                } else {
                    v = (internetDataMap.get(c) && internetDataMap.get(c).get(sliderState.end)) || null;
                    return v == null ? 'No data' : (d3.format('.1f')(v) + '%');
                }
            }
            // For bar: get end year value (for all countries)
            function getBarValueForEndYear(c) {
                if (currentMode === 'gdp') {
                    return (gdpDataMap.get(c) && gdpDataMap.get(c).get(sliderState.end)) || null;
                } else {
                    return (internetDataMap.get(c) && internetDataMap.get(c).get(sliderState.end)) || null;
                }
            }
            // For bar: get min/max for end year (log scale)
            let allBarValuesEndYear = countryList.map(getBarValueForEndYear).filter(v => v != null && v > 0);
            let barMin = Math.min(...allBarValuesEndYear);
            let barMax = Math.max(...allBarValuesEndYear);
            const minBarWidth = 12; // percent, for nonzero values
            let logBarMin = Math.log10(barMin);
            let logBarMax = Math.log10(barMax);

            // --- Helper to get value for sorting ---
            function getSortValue(c, metric) {
                if (metric === 'gdp') {
                    let v = (gdpDataMap.get(c) && gdpDataMap.get(c).get(sliderState.end)) || null;
                    return v == null ? -Infinity : v;
                } else if (metric === 'internet') {
                    let v = (internetDataMap.get(c) && internetDataMap.get(c).get(sliderState.end)) || null;
                    return v == null ? -Infinity : v;
                }
                return c;
            }

            // --- Render Sidebar ---
            function renderSidebar() {
                // Filter by search and real country
                let filtered = countryList.filter(c => c.toLowerCase().includes(sidebarState.search.toLowerCase()));
                if (sidebarState.showOnlyReal) {
                    filtered = filtered.filter(isRealCountry);
                }
                // Map to objects with value
                let mapped = filtered.map(c => ({
                    name: c,
                    val: getBarValueForEndYear(c)
                }));
                // Sort
                if (sidebarState.sort === 'name') {
                    mapped.sort((a, b) => a.name.localeCompare(b.name));
                } else if (sidebarState.sort === 'gdp' || sidebarState.sort === 'internet') {
                    mapped.sort((a, b) => getSortValue(b.name, sidebarState.sort) - getSortValue(a.name, sidebarState.sort));
                }
                // Selected countries at top
                mapped.sort((a, b) => {
                    const aSel = sidebarState.selected.has(a.name);
                    const bSel = sidebarState.selected.has(b.name);
                    return (bSel - aSel);
                });
                // Sidebar HTML
                const sidebarHtml = `
                    <div id='modalSidebar' style="width:400px;min-width:180px;max-height:70vh;overflow-y:auto;padding-right:12px;border-right:1px solid #eee;">
                        <div style='font-weight:bold;margin-bottom:10px;'>Select Countries</div>
                        <div style='display:flex;gap:8px;margin-bottom:10px;'>
                            <input id='countrySearchInput' type='text' placeholder='Search...' style='flex:1;padding:4px 8px;border:1px solid #bbb;border-radius:4px;' value="${sidebarState.search}">
                            <select id='countrySortSelect' style='padding:4px 8px;border:1px solid #bbb;border-radius:4px;'>
                                <option value='name' ${sidebarState.sort === 'name' ? 'selected' : ''}>Name</option>
                                <option value='gdp' ${sidebarState.sort === 'gdp' ? 'selected' : ''}>GDP (${sliderState.end})</option>
                                <option value='internet' ${sidebarState.sort === 'internet' ? 'selected' : ''}>Internet Usage (${sliderState.end})</option>
                            </select>
                        </div>
                        <div style='margin-bottom:10px;display:flex;align-items:center;gap:10px;'>
                            <a href='#' id='clearCountries' style='font-size:0.98em;'>Clear</a>
                        </div>
                        <form id='countrySelectForm'>
                            <div style='max-height:55vh;overflow-y:auto;'>
                                ${mapped.map(c => {
                                    // Bar width (min 0, max 100%) using log scale
                                    let barVal = c.val;
                                    let barWidth = 0;
                                    if (barVal != null && barVal > 0 && logBarMax > logBarMin) {
                                        let logVal = Math.log10(barVal);
                                        barWidth = Math.max(minBarWidth, ((logVal - logBarMin) / (logBarMax - logBarMin)) * 100);
                                    } else if (barVal != null && barVal > 0) {
                                        barWidth = minBarWidth;
                                    }
                                    let barColor = currentMode === 'gdp' ? '#2171b5' : '#4fa49a';
                                    // Highlight main selected country
                                    let highlight = c.name === selectedCountry ? 'background: #e6f0fa; border-left: 4px solid #2171b5; font-weight: bold;' : '';
                                    return `
                                    <div style='display:flex;align-items:center;justify-content:space-between;padding:2px 0;${highlight}'>
                                        <label style='cursor:pointer;display:flex;align-items:center;gap:6px;'>
                                            <input type='checkbox' name='country' value='${c.name.replace(/'/g, "&apos;")}' ${sidebarState.selected.has(c.name) ? 'checked' : ''}>
                                            <span>${c.name}</span>
                                        </label>
                                        <span style='font-size:0.98em;color:#555;min-width:70px;display:inline-block;text-align:right;'>${getCountryValueForBar(c.name)}</span>
                                        <div style='flex:0 0 80px;height:10px;background:#eee;border-radius:5px;overflow:hidden;margin-left:8px;position:relative;'>
                                            <div style='height:100%;width:${barWidth}%;background:${barColor};'></div>
                                        </div>
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        </form>
                    </div>
                `;
                modalContent.querySelector('#modalSidebarContainer').innerHTML = sidebarHtml;
            }

            // --- Chart containers and update function ---
            function renderChartContainers() {
                modalContent.querySelector('#lineTabPlaceholder').innerHTML = `<div id='modalLineChart' style='width:100%;height:340px;'></div>`;
                modalContent.querySelector('#slopeTabPlaceholder').innerHTML = `<div id='modalSlopeChart' style='width:100%;height:340px;'></div>`;
                modalContent.querySelector('#streamTabPlaceholder').innerHTML = `<div id='modalStreamChart' style='width:100%;height:340px;'></div>`;
                modalContent.querySelector('#barTabPlaceholder').innerHTML = `<div id='modalBarChart' style='width:100%;height:340px;'></div>`;
            }
            function updateCharts() {
                const checked = Array.from(modalContent.querySelectorAll('input[name=country]:checked')).map(cb => cb.value);
                // --- LINE CHART ---
                const lineChartDiv = modalContent.querySelector('#modalLineChart');
                if (!lineChartDiv) return; // Guard against missing container
                lineChartDiv.innerHTML = '';
                
                if (checked.length === 0) {
                    lineChartDiv.innerHTML = `<div style='text-align:center;padding-top:120px;color:#888;'>Select at least one country</div>`;
                    return;
                }

                // Prepare data
                const years = allYears.filter(y => y >= sliderState.start && y <= sliderState.end);
                const countryData = checked.map(country => {
                    return {
                        country,
                        values: years.map(year => {
                            let val = (currentMode === 'gdp')
                                ? (gdpDataMap.get(country) && gdpDataMap.get(country).get(year))
                                : (internetDataMap.get(country) && internetDataMap.get(country).get(year));
                            return { year, value: val };
                        }).filter(v => v.value != null) // Filter out null values
                    };
                }).filter(d => d.values.length > 0); // Filter out countries with no data

                if (countryData.length === 0) {
                    lineChartDiv.innerHTML = `<div style='text-align:center;padding-top:120px;color:#888;'>No data available for selected countries in this time range</div>`;
                    return;
                }

                // Create line chart
                createLineChart(lineChartDiv, countryData, {
                    currentMode,
                    formatGDP,
                    sliderState
                });

                // --- SLOPE CHART ---
                const slopeChartDiv = modalContent.querySelector('#modalSlopeChart');
                if (!slopeChartDiv) return;
                slopeChartDiv.innerHTML = '';
                if (checked.length === 0) {
                    slopeChartDiv.innerHTML = `<div style='text-align:center;padding-top:120px;color:#888;'>Select at least one country</div>`;
                    return;
                }

                // Prepare data for slope chart
                const slopeData = checked.map(country => {
                    let startVal = (currentMode === 'gdp')
                        ? (gdpDataMap.get(country) && gdpDataMap.get(country).get(sliderState.start))
                        : (internetDataMap.get(country) && internetDataMap.get(country).get(sliderState.start));
                    let endVal = (currentMode === 'gdp')
                        ? (gdpDataMap.get(country) && gdpDataMap.get(country).get(sliderState.end))
                        : (internetDataMap.get(country) && internetDataMap.get(country).get(sliderState.end));
                    return {
                        country,
                        start: sliderState.start,
                        end: sliderState.end,
                        startVal,
                        endVal
                    };
                }).filter(d => d.startVal != null && d.endVal != null);

                if (slopeData.length === 0) {
                    slopeChartDiv.innerHTML = `<div style='text-align:center;padding-top:120px;color:#888;'>No data available for selected countries in this time range</div>`;
                    return;
                }

                // Create slope chart
                createSlopeChart(slopeChartDiv, slopeData, {
                    currentMode,
                    formatGDP,
                    sliderState
                });

                // --- STREAM GRAPH ---
                const streamChartDiv = modalContent.querySelector('#modalStreamChart');
                if (!streamChartDiv) return;
                streamChartDiv.innerHTML = '';
                if (checked.length === 0) {
                    streamChartDiv.innerHTML = `<div style='text-align:center;padding-top:120px;color:#888;'>Select at least one country</div>`;
                    return;
                }

                // Create stream graph
                createStreamGraph(streamChartDiv, countryData, {
                    currentMode,
                    formatGDP,
                    sliderState
                });

                // --- BAR CHART ---
                const barChartDiv = modalContent.querySelector('#modalBarChart');
                if (!barChartDiv) return;
                barChartDiv.innerHTML = '';
                if (checked.length === 0) {
                    barChartDiv.innerHTML = `<div style='text-align:center;padding-top:120px;color:#888;'>Select at least one country</div>`;
                    return;
                }

                // Create bar chart
                createBarChart(barChartDiv, countryData, {
                    currentMode,
                    formatGDP,
                    sliderState
                });
            }

            // --- Main content HTML (tabs) ---
            const mainContentHtml = `
                <div style='flex:1;min-width:1000px;max-width:1000px;padding-left:32px;'>
                    <div id='metricToggleContainer'></div>
                    <div id='modalTimeSliderContainer'></div>
                    <div id="modalTabs" style="display:flex;gap:16px;margin-bottom:18px;">
                        <button class="modal-tab active" data-tab="line" style="padding:8px 20px;border:none;border-bottom:2px solid #2171b5;background:none;font-size:1.1em;cursor:pointer;outline:none;">Line</button>
                        <button class="modal-tab" data-tab="slope" style="padding:8px 20px;border:none;border-bottom:2px solid transparent;background:none;font-size:1.1em;cursor:pointer;outline:none;">Slope</button>
                        <button class="modal-tab" data-tab="stream" style="padding:8px 20px;border:none;border-bottom:2px solid transparent;background:none;font-size:1.1em;cursor:pointer;outline:none;">Stream</button>
                        <button class="modal-tab" data-tab="bar" style="padding:8px 20px;border:none;border-bottom:2px solid transparent;background:none;font-size:1.1em;cursor:pointer;outline:none;">Bar</button>
                    </div>
                    <div id="modalTabContent">
                        <div data-tab-content="line">
                            <div id='lineTabPlaceholder' style='text-align:center;font-size:1.2em;'></div>
                        </div>
                        <div data-tab-content="slope" style="display:none;">
                            <div id='slopeTabPlaceholder' style='text-align:center;font-size:1.2em;'></div>
                        </div>
                        <div data-tab-content="stream" style="display:none;">
                            <div id='streamTabPlaceholder' style='text-align:center;font-size:1.2em;'></div>
                        </div>
                        <div data-tab-content="bar" style="display:none;">
                            <div id='barTabPlaceholder' style='text-align:center;font-size:1.2em;'></div>
                        </div>
                    </div>
                </div>
            `;

            // --- Layout: sidebar + main content ---
            modalContent.innerHTML = `
                <div style='display:flex;align-items:flex-start;'>
                    <div id='modalSidebarContainer' style='min-width:400px;'></div>
                    ${mainContentHtml}
                </div>
            `;
            modalOverlay.style.display = 'flex';

            // --- Render sidebar, time slider, and chart containers for the first time ---
            renderSidebar();
            renderTimeSlider();
            renderChartContainers();
            updateCharts();

            // --- Metric toggle (above tabs) ---
            const metricToggleHtml = `
                <div style='margin-bottom:18px;text-align:center;'>
                    <button id='modalMetricToggle' style='padding:7px 22px;font-size:1em;border-radius:18px;border:1px solid #2171b5;background:${currentMode === 'gdp' ? '#2171b5' : 'white'};color:${currentMode === 'gdp' ? 'white' : '#2171b5'};margin-right:8px;cursor:pointer;'>GDP</button>
                    <button id='modalMetricToggleInternet' style='padding:7px 22px;font-size:1em;border-radius:18px;border:1px solid #2171b5;background:${currentMode === 'internet' ? '#2171b5' : 'white'};color:${currentMode === 'internet' ? 'white' : '#2171b5'};cursor:pointer;'>Internet Usage</button>
                </div>
            `;
            modalContent.querySelector('#metricToggleContainer').innerHTML = metricToggleHtml;

            // --- Tab switching logic ---
            const tabButtons = modalContent.querySelectorAll('.modal-tab');
            const tabContents = modalContent.querySelectorAll('[data-tab-content]');
            tabButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active class and reset border from all buttons
                    tabButtons.forEach(b => {
                        b.classList.remove('active');
                        b.style.borderBottom = '2px solid transparent';
                    });
                    // Add active class and set border for clicked button
                    btn.classList.add('active');
                    btn.style.borderBottom = '2px solid #2171b5';
                    
                    // Show/hide content
                    tabContents.forEach(tc => {
                        tc.style.display = tc.getAttribute('data-tab-content') === btn.getAttribute('data-tab') ? '' : 'none';
                    });
                });
            });

            // --- Update placeholder text based on selected countries ---
            function updatePlaceholders() {
                const checked = Array.from(modalContent.querySelectorAll('input[name=country]:checked')).map(cb => cb.value);
                // Remove placeholder text and ensure chart containers exist
                modalContent.querySelector('#lineTabPlaceholder').innerHTML = `<div id='modalLineChart' style='width:100%;height:340px;'></div>`;
                modalContent.querySelector('#slopeTabPlaceholder').innerHTML = `<div id='modalSlopeChart' style='width:100%;height:340px;'></div>`;
                modalContent.querySelector('#streamTabPlaceholder').innerHTML = `<div id='modalStreamChart' style='width:100%;height:340px;'></div>`;
                modalContent.querySelector('#barTabPlaceholder').innerHTML = `<div id='modalBarChart' style='width:100%;height:340px;'></div>`;
                // Persist selection globally
                modalSelectedCountries = checked;
                modalShowOnlyRealCountries = sidebarState.showOnlyReal;
                // Update the charts
                updateCharts();
            }
            updatePlaceholders();

            // --- Sidebar event listeners ---
            // Search
            modalContent.querySelector('#modalSidebarContainer').addEventListener('input', e => {
                if (e.target.id === 'countrySearchInput') {
                    sidebarState.search = e.target.value;
                    renderSidebar();
                    updatePlaceholders();
                }
            });
            // Sort
            modalContent.querySelector('#modalSidebarContainer').addEventListener('change', e => {
                if (e.target.id === 'countrySortSelect') {
                    sidebarState.sort = e.target.value;
                    renderSidebar();
                    updatePlaceholders();
                }
                if (e.target.id === 'showOnlyRealCountries') {
                    sidebarState.showOnlyReal = e.target.checked;
                    renderSidebar();
                    updatePlaceholders();
                }
            });
            // Clear
            modalContent.querySelector('#modalSidebarContainer').addEventListener('click', e => {
                if (e.target.id === 'clearCountries') {
                    e.preventDefault();
                    sidebarState.selected.clear();
                    renderSidebar();
                    updatePlaceholders();
                }
            });
            // Checkbox change
            modalContent.querySelector('#modalSidebarContainer').addEventListener('change', e => {
                if (e.target.name === 'country') {
                    if (e.target.checked) {
                        sidebarState.selected.add(e.target.value);
                    } else {
                        sidebarState.selected.delete(e.target.value);
                    }
                    renderSidebar();
                    updatePlaceholders();
                    updateCharts();
                }
            });

            // --- Metric toggle logic ---
            modalContent.querySelector('#modalMetricToggle').addEventListener('click', () => {
                if (currentMode !== 'gdp') {
                    currentMode = 'gdp';
                    toggleBtn.textContent = 'Switch to Internet Usage';
                    update(currentYear); // update heatmap
                    modalOverlay.style.display = 'none';
                    setTimeout(() => openModal(countryName), 100); // reopen modal in new mode
                }
            });
            modalContent.querySelector('#modalMetricToggleInternet').addEventListener('click', () => {
                if (currentMode !== 'internet') {
                    currentMode = 'internet';
                    toggleBtn.textContent = 'Switch to GDP';
                    update(currentYear); // update heatmap
                    modalOverlay.style.display = 'none';
                    setTimeout(() => openModal(countryName), 100); // reopen modal in new mode
                }
            });
        }

        // Initial update
        update(currentYear);

        // Toggle button event
        toggleBtn.addEventListener('click', () => {
            currentMode = currentMode === 'gdp' ? 'internet' : 'gdp';
            toggleBtn.textContent = currentMode === 'gdp' ? 'Switch to Internet Usage' : 'Switch to GDP';
            update(currentYear);
        });

        // Return visualization object
        return {
            update: (data) => {
                if (data.year) {
                    update(data.year);
                }
            },
            resize: (newWidth, newHeight) => {
                projection.fitSize([newWidth, newHeight], geoData);
                countries.attr('d', path);
            }
        };
    } catch (error) {
        console.error('Error in heatmap initialization:', error);
        container.innerHTML = '<p>Error loading visualization. Please check the console for details.</p>';
        throw error;
    }
}