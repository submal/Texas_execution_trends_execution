function vis_overview(parentDOM, width, height, data) {

	parentDOM.html("");

	const margin = {top: 10, right: 30, left: 40, bottom: 20}

	const chart = parentDOM.append("g")
		.attr("id", "overview")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	const axis_labels = chart.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	const legend = chart.append("g")
		.attr("transform", `translate(${width - 50}, ${margin.top})`);

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
		.domain([0, 70]); // Needs better solution!!!!!

	let color_scale = d3.scaleOrdinal(d3.schemeCategory10)
		.domain(["Hispanic", "Black", "White", "Other"]);

	let x_axis = chart.append("g");
	let y_axis = chart.append("g");

	nestedData = d3.nest()
		.key((d) => d["Race"])
		.map(data);


	nestedData.each(function(val, key) {
		if (key == "Other") return; 

		let histogram = d3.histogram()
			.value((d) => {
				let t = new Time(d["Date"]);
				return t.year;
			})
			.domain(x_scale.domain())
			// .thresholds(x_scale.ticks(30)) // bin number

		let bins = histogram(val);

		var lineFunc = d3.line()
			.x(function(d){
				return (x_scale(d.x0) + x_scale(d.x1)) / 2;
			})
			.y(function(d){
				return y_scale(d.length);
			})
			.curve(d3.curveMonotoneX)

		chart.append("path")
			.datum(bins)
			.attr("d", lineFunc)
			.attr("fill", "none")
			.attr("stroke", color_scale(key))
			.attr("stroke-width", 4)
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round");

		x_scale.range([0, width]) // adjust x scale
          .domain([d3.min(data, function(d){
			  let t = new Time(d["Date"]);
			  return t.year;
		  }), d3.max(data, function(d){
			  let t = new Time(d["Date"]);
			  return t.year;
		  })]);

        y_scale.range([height, 0]) // adjust y scale
          .domain([0, 70]); // adjust to scale to max

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
			.text("Count");
	})

	// create legend
	legend_line.selectAll("rect")
		.data(["White", "Black", "Hispanic", "Other"])
		.enter()
		.append("rect")
		.attr("fill", (d) => color_scale(d))
		.attr("x", 0)
		.attr("y", (d, i) => i * 30)
		.attr("width", 40)
		.attr("height", 3);

	legend_text.selectAll("text")
		.data(["White", "Black", "Hispanic", "Other"])
		.enter()
		.append("text")
		.attr("x", 35)
		.attr("y", (d, i) => i * 30 + 5)
		.text((d) => d);

	return function(){};

}