let abFilter = 25;
const width = window.innerWidth;
const height = window.innerHeight;

//for line graph
let lineLeft = 0, lineTop = 70;
let lineMargin = {top: 350, right: 0, bottom: 70, left: 1120},
    lineWidth = width-100 - lineMargin.left - lineMargin.right,
    lineHeight = height - lineMargin.top - lineMargin.bottom;


//replace with "gdp.csv"
d3.csv("ds_salaries.csv").then(rawData =>{
    console.log("rawData", rawData);

    rawData.forEach(function(d){
        d.salary_in_usd = Number(d.salary_in_usd);
        d.salary = Number(d.salary);
    });

    const filteredData = rawData.filter(d=>d.salary_in_usd > abFilter);
    const processedData = filteredData.map(d=>{
                          return {
                              "Buying_Power":d.salary/d.salary_in_usd,
                          };
    });
    console.log("processedData", processedData);


    rawData.forEach(function(d){
        d.salary_in_usd = Number(d.salary_in_usd);
        d.salary = Number(d.salary);
    });

    const svg = d3.select("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto;")
        .call(zoom);







    //this is currently a line graph for now. will shift over to slopechat soon







    //visual 3: plot line graph
    const yearCurrencyC = processedData.reduce((s, { year, salary_currency }) => {
        const key = `${year}+${salary_currency}`;
        s[key] = (s[key] || 0) + 1;
        return s;
    }, {});

    const numCurr = Object.keys(yearCurrencyC).map((key) => {
        const [year, salary_currency] = key.split('+');
        return { year, salary_currency, count: yearCurrencyC[key] };
    });
    console.log("Curr", yearCurrencyC);

    const g5 = svg.append("g")
                .attr("width", lineWidth + lineMargin.left + lineMargin.right)
                .attr("height", lineHeight + lineMargin.top + lineMargin.bottom)
                .attr("transform", `translate(${lineMargin.left}, ${lineMargin.top})`)
                .attr("class", "line-plot");

    //X label
    g5.append("text")
        .attr("x", lineWidth / 2)
        .attr("y", lineHeight + 60)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Year");

    //Y label
    g5.append("text")
        .attr("x", -(lineHeight / 2))
        .attr("y", -50)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Amount of currency");

    //X scale
    const x3 = d3.scaleLinear()
        .domain([d3.max(processedData, d => d.year), d3.min(processedData, d => d.year)])
        .range([lineHeight, 0])
        .nice();

    //Y scale
    const y3 = d3.scaleLinear()
        .domain([0, d3.max(numCurr, d => d.count)])
        .range([lineHeight, 0])
        .nice();

    //X axis
    const x3Axis = d3.axisBottom(x3).ticks(4);
    const x3AxisG = g5.append("g")
        .attr("transform", `translate(0, ${lineHeight})`)
        .call(x3Axis);

    // Y axis
    const y3Axis = d3.axisLeft(y3).ticks(8);
    const y3AxisG = g5.append("g").call(y3Axis);



    // Group data by currency
    const uniqueCurrencies = [...new Set(numCurr.map(d => d.salary_currency))];

    const currencyGroups = {};
    uniqueCurrencies.forEach(currency => {
        currencyGroups[currency] = numCurr.filter(d => d.salary_currency === currency);
    });
    console.log("groups", currencyGroups);
    // Color scale for different currencies
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Line generator
    const line = d3.line()
        .x(d => x3(d.year))
        .y(d => y3(d.count))
        .curve(d3.curveMonotoneX);


    const multiYearCurrencies = [];

    // Create lines for each currency
    uniqueCurrencies.forEach((currency) => {
        data = currencyGroups[currency];

        console.log("current", data);
        const uniqueYears = [];
        for (let i = 0; i < data.length; i++) {
            if (!uniqueYears.includes(data[i].year)) {
                uniqueYears.push(data[i].year);
            }
        }
        const appearsInMultipleYears = uniqueYears.length > 1;
        
        //console.log(`Currency ${currency}: appears in ${uniqueYears.length} years`, uniqueYears);
        
        // Only create line if currency appears in multiple years
        if (appearsInMultipleYears) {
            // Sort data by year for proper line drawing
            multiYearCurrencies.push(currency);
            data.sort((a, b) => a.year - b.year);
            
            // Add the line path
            g5.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", colorScale(currency))
                .attr("stroke-width", 2)
                .attr("d", line);

            // Add dots for data points
            g5.selectAll(`.dots-${currency}`)
                .data(data)
                .enter().append("circle")
                .attr("class", `dots-${currency}`)
                .attr("cx", d => x3(d.year))
                .attr("cy", d => y3(d.count))
                .attr("r", 3)
                .attr("fill", colorScale(currency))
                .attr("stroke", "white")
                .attr("stroke-width", 1);
        }
    });

    // Add legend for only currencies plotted
    const currencyLegend = g5.append("g")
        .attr("class", "currency-legend")
        .attr("transform", `translate(${lineWidth - 350}, -10)`);

    let legendIndex = 0;
    multiYearCurrencies.forEach((currency) => {
        const legendItem = currencyLegend.append("g")
            .attr("transform", `translate(0, ${legendIndex * 20})`);

            legendItem.append("circle")
                .attr("r", 4)
                .attr("fill", colorScale(currency));

            legendItem.append("text")
                .attr("x", 10)
                .attr("y", 4)
                .attr("font-size", "10px")
                .text(currency);

            legendIndex++;

            console.log("added: ", currency);
    });

});