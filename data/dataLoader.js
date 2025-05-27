import * as d3 from 'd3';

export async function loadAndCleanData() {
    try {
        // Load both datasets
        const [gdpData, internetData] = await Promise.all([
            d3.csv('data/global_gdp.csv'),
            d3.csv('data/internet_usage.csv')
        ]);

        // Function to convert wide format to long format
        const convertToLongFormat = (data) => {
            const years = Object.keys(data[0]).filter(key => !isNaN(+key));
            return data.flatMap(row => 
                years.map(year => ({
                    country: row['Country Name'],
                    countryCode: row['Country Code'],
                    year: +year,
                    value: row[year] === '..' ? null : +row[year]
                }))
            ).filter(d => d.value !== null);
        };

        // Remove columns from 1960 to 1999 from GDP data
        const filteredGdpData = gdpData.map(row => {
            const filteredRow = {
                'Country Name': row['Country Name'],
                'Country Code': row['Country Code']
            };
            // Only keep columns from 2000 onwards
            Object.keys(row).forEach(key => {
                if (!isNaN(+key) && +key >= 2000) {
                    filteredRow[key] = row[key];
                }
            });
            return filteredRow;
        });

        // Clean and transform both datasets
        const cleanedGdpData = convertToLongFormat(filteredGdpData);
        const cleanedInternetData = convertToLongFormat(internetData);

        return {
            gdpData: cleanedGdpData,
            internetData: cleanedInternetData
        };
    } catch (error) {
        console.error('Error loading or cleaning data:', error);
        throw error;
    }
} 