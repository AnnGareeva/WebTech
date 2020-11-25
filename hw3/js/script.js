const b_width = 1000;
const d_width = 500;
const b_height = 1000;
const d_height = 1000;
const colors = [
    '#DB202C','#a6cee3','#1f78b4',
    '#33a02c','#fb9a99','#b2df8a',
    '#fdbf6f','#ff7f00','#cab2d6',
    '#6a3d9a','#ffff99','#b15928']

const radius = d3.scaleLinear().range([0.5, 20]);
const color = d3.scaleOrdinal().range(colors);
const x = d3.scaleLinear().range([0, b_width]);

const bubble = d3.select('.bubble-chart')
    .attr('width', b_width).attr('height', b_height);
const donut = d3.select('.donut-chart')
    .attr('width', d_width).attr('height', d_height)
    .append("g")
        .attr("transform", "translate(" + d_width / 2 + "," + d_height / 2 + ")");

const donut_lable = d3.select('.donut-chart').append('text')
        .attr('class', 'donut-lable')
        .attr("text-anchor", "middle")
        .attr('transform', `translate(${(d_width/2)} ${d_height/2})`);
const tooltip = d3.select('.tooltip').style("opacity", 0.8);

const forceStrength = 0.03;

//  Part 1 - Создайте симуляцию с использованием forceCenter, forceX и forceCollide
const simulation = d3.forceSimulation()

d3.csv('data/netflix.csv').then(data=>{
    data = d3.nest().key(d=>d.title).rollup(d=>d[0]).entries(data).map(d=>d.value).filter(d=>d['user rating score']!=='NA');
    
    const rating = data.map(d=>+d['user rating score']);
    const years = data.map(d=>+d['release year']);
    let ratings = d3.nest().key(d=>d.rating).rollup(d=>d.length).entries(data);
    
    // Part 1 - задайте domain  для шкал
    const rating_range= [d3.min(rating), d3.max(rating)];
    const year_range= [d3.min(years), d3.max(years)];

    color.domain(ratings);
    radius.domain(rating_range);
    x.domain(year_range);


    // Part 1 - передайте данные в симуляцию и добавьте обработчик события tick
    function get_distance(obj) { 
        return x(+obj['release year']);
    }
    function calculate_radious(obj) {
        return radius(obj['user rating score']);
    }

    var sim_nodes = simulation.nodes(data).force(
        'x', d3.forceX().x(get_distance)).force(
        'center', d3.forceCenter(b_width / 2, b_height / 2)).force(
        'collision', d3.forceCollide().radius(calculate_radious)
        );
    
    sim_nodes.on('tick', tick_processing);
    
    
    function get_value(obj) {
        return obj.value.value; 
    }
    // Part 1 - Создайте шаблон при помощи d3.pie на основе ratings
    var pie = d3.pie().value(get_value)
    var data_ready = pie(d3.entries(ratings))

    function tick_processing() {
        // Part 1 - создайте circles на основе data
        var nodes = bubble.selectAll("circle");
        var bubble_nodes = nodes.data(data);

        var filled_nodes = bubble_nodes.enter().append('circle').attr(
                "r", function(d) {return radius(d['user rating score']);}).attr(
                "fill", function(d) { return color(d["rating"]); }).merge(bubble_nodes);
        
        // добавьте обработчики событий mouseover и mouseout
            // .on('mouseover', overBubble)
            // .on('mouseout', outOfBubble);
        setted_coords = filled_nodes.attr(
            'cx', function(d) {return d.x;}).attr(
            'cy', function(d) {return d.y;}).attr(
            'stroke', 'black').style(
            'stroke-width', '0px').on(
            'mouseover', overBubble).on(
            'mouseout', outOfBubble)

        bubble_nodes.exit().remove();
        }
    
    // Part 1 - Создайте генератор арок при помощи d3.arc
    var arc_generation = d3.arc().innerRadius(100).outerRadius(250)
    // Part 1 - постройте donut chart внутри donut
    var donutchart  = donut.selectAll('whatever').data(data_ready).enter().append('path').attr(
        'd', arc_generation).attr(
        'fill', function(d){return(color(d.data.value.key))}).attr(
        "stroke", "white")
        
    // добавьте обработчики событий mouseover и mouseout
        //.on('mouseover', overArc)
        //.on('mouseout', outOfArc);
    donutchart.style("stroke-width", "1px").style("opacity", 1)
        .on('mouseover', overArc)
        .on('mouseout', outOfArc);

    function overBubble(d){
        console.log(d)

        // Part 2 - задайте stroke и stroke-width для выделяемого элемента   
        d3.select(this).style('stroke-width', '1px');
        
        // // Part 3 - обновите содержимое tooltip с использованием классов title и year
        var shift_x = d.x + (+d3.select(this).attr('r'));
        tooltip.html("<b>" + d['title'] + "</b>" + 
                    "<br/>"  + d['release year']);	

        // Part 3 - измените display и позицию tooltip
        var top_val_px = d.y - 90;
        tooltip.style(
            "left", shift_x + "px").style(
            "top", top_val_px + "px").style(
            'display', 'block');
    }
    function outOfBubble(){
        // Part 2 - обнулите stroke и stroke-width
        d3.select(this).style('stroke-width', '0px');
            
        // Part 3 - измените display у tooltip
        tooltip.style('display', 'none');
    }

    function overArc(d){
        console.log(d);

        // Part 2 - измените содержимое donut_lable
        donut_lable.text(d.data.value.key);

        // Part 2 - измените opacity арки
        var opacity_selected_value = 0.7;
        d3.select(this).style('opacity', opacity_selected_value);
        var select_rating = d.data.value.key;
        
        // Part 3 - измените opacity, stroke и stroke-width для circles в зависимости от rating
        bubble.selectAll('circle').style(
            'opacity', function(d){
                if (d.rating == select_rating){
                    return 1;
                } else {
                    return (1 - opacity_selected_value);
                }
            }).style(
            'stroke-width', function(d){
                if (d.rating == select_rating) {
                    return '1px';
                } else {
                    return '0px';
                }
            });
    }

    function outOfArc(){
        // Part 2 - измените содержимое donut_lable
        donut_lable.text('');

        // Part 2 - измените opacity арки
        d3.select(this).style('opacity', 1);

        // Part 3 - верните opacity, stroke и stroke-width для circles
        bubble.selectAll('circle').style(
            'opacity', '1').style(
            'stroke-width', '0px');
    }
});