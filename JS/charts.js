// Raw °C data stored so we can convert without re-fetching
let _rawTempsC     = [];
let _rawFeelsLikeC = [];

function toF(c) { return Math.round(c * 9/5 + 32); }

function isDark() { return document.body.classList.contains('dark'); }

function chartColors() {
    const dark = isDark();
    return {
        text:     dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)',
        grid:     dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.08)',
        tempLine: dark ? 'rgba(255,255,255,0.9)'  : 'rgba(30,30,30,0.85)',
        tempFill: dark ? 'rgba(255,255,255,0.15)' : 'rgba(30,30,30,0.08)',
        tempDot:  dark ? '#fff'                   : '#222',
        feelsLine:'rgba(255,200,100,0.85)',
        humBar:   'rgba(100,180,255,0.3)',
        humBorder:'rgba(100,180,255,0.6)',
        humTick:  'rgba(100,180,255,0.9)',
    };
}

export function initChart(forecastData, isFahrenheit = false) {
    const ctx = document.getElementById('hourlyChart');
    if (!ctx) return;

    if (window.myChart) window.myChart.destroy();

    // Store raw °C values globally for later unit toggling
    _rawTempsC     = forecastData.slice(0, 8).map(f => f.main.temp);
    _rawFeelsLikeC = forecastData.slice(0, 8).map(f => f.main.feels_like);

    const labels   = forecastData.slice(0, 8).map(f =>
        new Date(f.dt * 1000).getHours() + ":00"
    );
    const humidity = forecastData.slice(0, 8).map(f => f.main.humidity);

    _buildChart(labels, humidity, isFahrenheit);
}

function _buildChart(labels, humidity, isFahrenheit) {
    const ctx = document.getElementById('hourlyChart');
    const c   = chartColors();
    const unit = isFahrenheit ? '°F' : '°C';

    const temps     = isFahrenheit ? _rawTempsC.map(toF)     : _rawTempsC.map(Math.round);
    const feelsLike = isFahrenheit ? _rawFeelsLikeC.map(toF) : _rawFeelsLikeC.map(Math.round);

    // Store humidity on window so updateChartUnits can reuse it
    window._chartHumidity = humidity || window._chartHumidity || [];

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: `Temperature (${unit})`,
                    data: temps,
                    borderColor: c.tempLine,
                    backgroundColor: c.tempFill,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: c.tempDot,
                    yAxisID: 'y'
                },
                {
                    label: `Feels Like (${unit})`,
                    data: feelsLike,
                    borderColor: c.feelsLine,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 3,
                    yAxisID: 'y'
                },
                {
                    label: 'Humidity (%)',
                    data: window._chartHumidity,
                    type: 'bar',
                    backgroundColor: c.humBar,
                    borderColor: c.humBorder,
                    borderWidth: 1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    labels: { color: c.text, font: { size: 11 } }
                }
            },
            scales: {
                x: {
                    ticks: { color: c.text },
                    grid:  { display: false }
                },
                y: {
                    position: 'left',
                    ticks: { color: c.text, callback: v => v + (isFahrenheit ? '°F' : '°') },
                    grid:  { color: c.grid }
                },
                y1: {
                    position: 'right',
                    min: 0, max: 100,
                    ticks: { color: c.humTick, callback: v => v + '%' },
                    grid:  { display: false }
                }
            }
        }
    });
}

// Called by ui.js when the °C/°F toggle changes
export function updateChartUnits(isFahrenheit) {
    if (!window.myChart || !_rawTempsC.length) return;

    const unit      = isFahrenheit ? '°F' : '°C';
    const temps     = isFahrenheit ? _rawTempsC.map(toF)     : _rawTempsC.map(Math.round);
    const feelsLike = isFahrenheit ? _rawFeelsLikeC.map(toF) : _rawFeelsLikeC.map(Math.round);
    const c         = chartColors();

    const chart = window.myChart;
    chart.data.datasets[0].label = `Temperature (${unit})`;
    chart.data.datasets[0].data  = temps;
    chart.data.datasets[1].label = `Feels Like (${unit})`;
    chart.data.datasets[1].data  = feelsLike;

    chart.options.scales.y.ticks.callback = v => v + (isFahrenheit ? '°F' : '°');
    chart.options.scales.y.ticks.color    = c.text;
    chart.options.plugins.legend.labels.color = c.text;
    chart.options.scales.x.ticks.color    = c.text;

    chart.update();
}

// Call this after theme toggles to refresh chart colors without changing data
export function refreshChartTheme(isFahrenheit) {
    updateChartUnits(isFahrenheit);
}