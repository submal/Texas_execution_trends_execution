// http://www.txexecutions.org/history.asp

function vis_overview(parentDOM, width, height, data) {

	parentDOM.html("");

	const margin = {top: 10, right: 30, left: 40, bottom: 20}

	const chart = parentDOM.append("g")
		.attr("id", "overview")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	const axis_labels = chart.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	const legend = chart.append("g")
		.attr("transform", `translate(${width}, ${margin.top})`);

	const legend_line = legend.append("g")
		.attr("transform", `translate(0, ${margin.top})`);

	const legend_text = legend.append("g")
		.attr("transform", `translate(10, ${margin.top})`);

	function Time(dateString) {
		let arr = dateString.split("/")
		this.month = arr[0];
		this.date = arr[1];
		this.year = arr[2];
	}

	let x_scale = d3.scaleLinear()
		.domain([
			d3.min(data, function(d){
				let t = new Time(d["Date"]);
				return t.year;
			}),
			d3.max(data, function(d){
				let t = new Time(d["Date"]);
				return t.year;
			})
		])
		.range([0, width]);

	let y_scale = d3.scaleLinear()
		.range([height, 0])
		.domain([0, 22]); // Needs better solution!!!!!

	let color_scale = d3.scaleOrdinal(d3.schemeCategory10)
		.domain(["Hispanic", "Black", "White"]);

	let x_axis = chart.append("g");
	let y_axis = chart.append("g");

	// nest data by race
	nestedData = d3.nest()
		.key((d) => d["Race"])
		.map(data);

	nestedData.each(function(val, key) {
		if (key == "Other") return;

		// histogram: binning by year
		let histogram = d3.histogram()
			.value((d) => {
				let t = new Time(d["Date"]);
				return t.year;
			})
			.domain(x_scale.domain())
			.thresholds(x_scale.ticks(30)) // bin number

		let bins = histogram(val);

		var lineFunc = d3.line()
			.x(function(d){
				return (x_scale(d.x0) + x_scale(d.x1)) / 2;
			})
			.y(function(d){
				return y_scale(d.length);
			})
			//.curve(d3.curveMonotoneX)

		chart.append("path")
			.datum(bins)
			.attr("d", lineFunc)
			.attr("fill", "none")
			.attr("stroke", color_scale(key))
			.attr("stroke-width", 4)
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round");

        x_axis.attr("transform", `translate(0, ${height})`) // adjust x axis with new x scale
          .call(d3.axisBottom(x_scale))

        y_axis.call(d3.axisLeft(y_scale)); // adjust y axis with new y scale

		// axis labels
		axis_labels.append("text")
			.attr("text-anchor", "middle")
			.attr("transform", `translate(${width/2}, ${height + margin.bottom})`)
			.style("font-size", "10px")
			.attr("font-family", "sans-serif")
			.text("Year");

		axis_labels.append("text")
			.attr("text-anchor", "middle")
			.attr("transform",  `translate(${-(3*margin.left/4)}, ${height/2})rotate(-90)`)
			.style("font-size", "10px")
			.text("Execution Count");
	})

	// create legend
	legend_line.selectAll("rect")
		.data(["White", "Black", "Hispanic"])
		.enter()
		.append("rect")
		.attr("fill", (d) => color_scale(d))
		.attr("x", 0)
		.attr("y", (d, i) => i * 30)
		.attr("width", 40)
		.attr("height", 3);

	legend_text.selectAll("text")
		.data(["White", "Black", "Hispanic"])
		.enter()
		.append("text")
		.attr("x", 35)
		.attr("y", (d, i) => i * 30 + 5)
		.text((d) => d);


	/*---------------
	* Storytelling and interaction
	----------------*/

	// aux stands for auxiliary
	// contains auxiliary lines and texts
	const aux = parentDOM.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	yearArray = [1983, 1992, 1995, 1999, 1998, 2000, 2005, 2011] // years that have stories to tell

	// construct all lines that indicate stories
	// add text to indicate that year
	// initially all opaque. Only shown when the story reaches there
	for (let i = 0; i < yearArray.length; i++){
		aux.append("line")
			.attr("y1", 30)
			.attr("y2", height)
			.attr("x1", x_scale(yearArray[i]))
			.attr("x2", x_scale(yearArray[i]))
			.attr("stroke", "black")
			.attr("stroke-width", 5)
			.classed("boundary_line", true)
			.classed("opaque", true)
			.attr("id", "line_" + yearArray[i])
			.style("stroke-dasharray", ("6, 5"));

		aux.append("text")
			.attr("text-anchor", "center")
			.attr("x", x_scale(yearArray[i]))
			.attr("y", 25)
			.attr("fill", "black")
			.style("font-size", "15px")
			.classed("opaque", true)
			.classed("highlight_year", true)
			.attr("id", "text_" + yearArray[i])
			.text(yearArray[i]);
	}

	// the rectangle indicates a time range and shifts as the story goes
	aux.append("rect")
		.attr("x", x_scale(1983))
		.attr("y", 0)
		.attr("width", x_scale(1992) - x_scale(1983))
		.attr("height", height)
		.attr("fill", "#3D405B")
		.attr("opacity", 0.2)
		.attr("id", "rect1");

	// We planned to use them as scroll functions, but it did not work
	// anyway, the same thing for "stepper"
	const scr1 = function(){
		console.log("scr1")

		// set all lines opaque again
		aux.selectAll(".boundary_line")
			.classed("opaque", true)

		// show the relevant line
		aux.select("#line_1983")
			.classed("opaque", false)
			.attr("opacity", 0)
			.transition()
			.attr("opacity", 1)
			.duration(500)

		// set all texts opaque again
		aux.selectAll(".highlight_year")
			.classed("opaque", true)

		// show the relevant line
		aux.select("#text_1983")
			.classed("opaque", false)

		// shift the position of the time-range rectangle
		aux.select("#rect1")
			.transition()
			.attr("x",  x_scale(1983))
			.attr("y", 0)
			.attr("width", x_scale(1992) - x_scale(1983))
			.attr("height", height)
			.duration(500);
	}

	const scr2 = function(){
		console.log("scr2")
		// set all lines opaque again
		aux.selectAll(".boundary_line")
			.classed("opaque", true)

		aux.selectAll(".highlight_year").classed("opaque", true)

		aux.select('#line_1992')
			.classed("opaque", false)
			.attr("opacity", 0)
			.transition()
			.attr("opacity", 1)
			.duration(500)

		aux.selectAll("#text_1992").classed("opaque", false)

		aux.select("#rect1")
			.transition()
			.attr("x",  x_scale(1992))
			.attr("y", 0)
			.attr("width", x_scale(1999) - x_scale(1992))
			.attr("height", height)
			.duration(500);
	}

	const scr3 = function(){
		console.log("scr3")

		aux.selectAll(".boundary_line")
			.classed("opaque", true)

		aux.select('#line_1998')
			.classed("opaque", false)
			.attr("opacity", 0)
			.transition()
			.attr("opacity", 1)
			.duration(500)

		aux.selectAll(".highlight_year")
			.classed("opaque", true)

		aux.select("#text_1998")
			.classed("opaque", false)

		aux.select("#rect1")
			.transition()
			.attr("x",  x_scale(1992))
			.attr("y", 0)
			.attr("width", x_scale(1999) - x_scale(1992))
			.attr("height", height)
			.duration(500);
	}
	const scr4 = function(){
		console.log("scr4")

		aux.selectAll(".boundary_line")
			.classed("opaque", true)

		aux.select("#line_2000")
			.classed("opaque", false)
			.attr("opacity", 0)
			.transition()
			.attr("opacity", 1)
			.duration(500)

		aux.selectAll(".highlight_year")
			.classed("opaque", true)

		aux.select("#text_2000")
			.classed("opaque", false)

		aux.select("#rect1")
			.transition()
			.attr("x",  x_scale(2000))
			.attr("y", 0)
			.attr("width", x_scale(2005) - x_scale(2000))
			.attr("height", height)
			.duration(500);
	}
	const scr5 = function(){
		console.log("scr5")

		aux.selectAll(".boundary_line")
			.classed("opaque", true)

		aux.select('#line_2005')
			.classed("opaque", false)
			.attr("opacity", 0)
			.transition()
			.attr("opacity", 1)
			.duration(500)

		aux.selectAll(".highlight_year")
			.classed("opaque", true)

		aux.select("#text_2005")
			.classed("opaque", false)

		aux.select("#rect1")
			.transition()
			.attr("x",  x_scale(2000))
			.attr("y", 0)
			.attr("width", x_scale(2005) - x_scale(2000))
			.attr("height", height)
			.duration(500);
	}
	const scr6 = function(){
		console.log("scr6")

		aux.selectAll(".boundary_line")
			.classed("opaque", true)

		aux.select("#line_2011")
			.classed("opaque", false)
			.attr("opacity", 0)
			.transition()
			.attr("opacity", 1)
			.duration(500)

		aux.selectAll(".highlight_year")
			.classed("opaque", true)

		aux.select("#text_2011")
			.classed("opaque", false)

		aux.select("#rect1")
			.transition()
			.attr("x",  x_scale(2005))
			.attr("y", 0)
			.attr("width", x_scale(2018) - x_scale(2005))
			.attr("height", height)
			.duration(500);
	}

	let vis_scrolls = [scr1, scr2, scr3, scr4, scr5, scr6];

	// initial display
	scr1();

	// Switching different "pages" of stories 
	d3.selectAll(".step1_click").on("click", function(){
		targetID = d3.select(this).attr("href");
		d3.selectAll(".step1_section").classed("hidden", true);
		d3.select(targetID).classed("hidden", false);

		let index = +targetID.slice(4)
		vis_scrolls[index - 1]();
	});


	return function(){};


}
