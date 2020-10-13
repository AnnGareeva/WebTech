const width = 1000;
const height = 500;
const margin = 30;
const svg  = d3.select('#scatter-plot')
            .attr('width', width)
            .attr('height', height);

let xParam = 'fertility-rate';
let yParam = 'child-mortality';
let radius = xParam;
let year = '2000';

const params = ['child-mortality', 'fertility-rate', 'gdp', 'life-expectancy', 'population'];
const colors = ['aqua', 'lime', 'gold', 'hotpink'];

// Шкалы для осей и окружностей
const x = d3.scaleLinear().range([margin*2, width-margin]);
const y = d3.scaleLinear().range([height-margin, margin]);

const xLable = svg.append('text').attr('transform', `translate(${width/2}, ${height})`);
const yLable = svg.append('text').attr('transform', `translate(${margin/2}, ${height/2}) rotate(-90)`);

// Part 1: задайте атрибуты 'transform' для осей
const yAxis = svg.append('g').attr('transform', `translate(${margin * 2}, 0)`);
const xAxis = svg.append('g').attr('transform', `translate(0, ${height - 30})`);

// Part 2: Шкалы для цвета и радиуса объектов
const color = d3.scaleOrdinal(colors);
const r = d3.scaleSqrt();
function iter(f) {
    return f;
}

// Part 2: для элемента select задайте options (http://htmlbook.ru/html/select) и установить selected для начального значения
var selected_options_rad = d3.select('#radius').selectAll('option').data(params).enter().append("option").text(iter);
var val_rad = selected_options_rad.attr("value", iter);
val_rad.attr("selected", function(f) {if (f === xParam) return true;});

// Part 3: select с options для осей
var selected_options_axisx =  d3.select('#axis_x').selectAll('option').data(params).enter().append("option").text(iter);
var selected_options_axisy =  d3.select('#axis_y').selectAll('option').data(params).enter().append("option").text(iter);
var val_axisx = selected_options_axisx.attr("value", iter);
var val_axisy = selected_options_axisy.attr("value", iter);
val_axisx.attr("selected", function(f) {if (f === xParam) return true;});
val_axisy.attr("selected", function(f) {if (f === yParam) return true;});

loadData().then(data => {

    console.log(data);

    // Part 2: получитe все уникальные значения из поля 'region' при помощи d3.nest и установите их как 'domain' цветовой шкалы
    color.domain(d3.nest().key(function(f) { return f['region']; }) .entries(data));

    d3.select('.slider').on('change', newYear);
    d3.select('#radius').on('change', newRadius);

    // Part 3: подпишитесь на изменения селекторов параметров осей
    d3.select('#axis_x').on('change', newXAxis);
    d3.select('#axis_y').on('change', newYAxis);

    function newYear(){
        year = this.value;
        updateChart()
    }

    function newRadius(){
        // Part 2: задайте логику обработки по аналогии с newYear
        radius = this.value;
        updateChart();
    }

    function newXAxis(){
        xParam = this.value;
        updateChart();
    }

    function newYAxis(){
        yParam = this.value;
        updateChart();
    }

    function updateChart(){
        xLable.text(xParam);
        yLable.text(yParam);
        d3.select('.year').text(year);

        // поскольку значения показателей изначально представленны в строчном формате преобразуем их в Number при помощи +
        let xRange = data.map(f =>+ f[xParam][year]);
        x.domain([d3.min(xRange), d3.max(xRange)]);
        xAxis.call(d3.axisBottom(x));

        // Part 1: реализуйте отображение оси 'y'
        let yRange = data.map(f =>+ f[yParam][year]);
        y.domain([d3.min(yRange), d3.max(yRange)]);
        yAxis.call(d3.axisLeft(y));

        // Part 2: реализуйте обновление шкалы радиуса
        let rRange = data.map(f =>+f[radius][year]);
        const min_size = 0;
        const max_size= 17;
        r.domain([d3.min(rRange), d3.max(rRange)]).range([min_size, max_size]);

        // Part 1, 2: реализуйте создание и обновление состояния точек
        var data_circle = svg.selectAll('circle').data(data).join("circle");
        var rad_circle = data_circle.attr("r", function(f) {return r(+f[radius][year]);});
        var coord_circle = rad_circle.attr("cx", function(f) {return x(+f[xParam][year]);})
                                     .attr("cy", function(f) {return y(+f[yParam][year]);});
        var set_color = coord_circle.attr("fill", function(f) {return color(f["region"]);});
    }

    updateChart();
});


async function loadData() {
    const population = await d3.csv('data/pop.csv');
    const rest = {
        'gdp': await d3.csv('data/gdppc.csv'),
        'child-mortality': await d3.csv('data/cmu5.csv'),
        'life-expectancy': await d3.csv('data/life_expect.csv'),
        'fertility-rate': await d3.csv('data/tfr.csv')
    };
    return population.map(d => {
        return {
            geo: d.geo,
            country: d.country,
            region: d.region,
            population: {...d},
            ...Object.values(rest).map(v => v.find(r => r.geo === d.geo)).reduce((o, d, i) => ({
                ...o,
                [Object.keys(rest)[i]]: d
            }), {})
        }
    })
}