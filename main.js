
const HEIGHT = 800;
const WIDTH = 800;

const margin = {
	top: 10,
	right: 30,
	left: 40,
	bottom: 20
}

Promise.all([
	d3.csv("_data/Execution.csv"),
	d3.svg("geo/Texas_map.html")
]).then(function(data){
	console.log(data[0]);
	console.log(data[1]);

	const vis_funcs = {
		"step1": {
			"f": vis_overview,
			"width": 400,
			"height": 400,
			"DOMs": [
				$('<svg id="vis_area"></svg>')
			],
			"prtDOMid": "#vis_area"
		},
		"step2": {
			"f": vis_map,
			"width": 800,
			"height": 800,
			"DOMs": [

			],
			"prtDOMid": "#Layer_1"
		},
		"step3": {
			"f": vis_dashboard,
			"width": 700,
			"height": 300,
			"DOMs": [
				$('<svg id="vis_area"></svg>')
			],
			"prtDOMid": "#vis_area"
		}
	}

	// initial display
	switchStep("step1");
	switchAnnotation("step1");
	switchVis("step1");

	function switchStep(newStep) {
		d3.selectAll(".step_link").classed("active", false);
		d3.selectAll("#" + newStep).classed("active", true);
	}

	function switchAnnotation(newStep) {
		d3.selectAll(".step_annotation")
			.style("display", "none")
			.style("opacity", 0);

		d3.select("#" + newStep + "_annotation")
			.style("display", "block")
			.transition()
			.delay(300).duration(500)
			.style("opacity", 1);
	}

	function switchVis(newStep) {
		let that = vis_funcs[newStep];
		let vis = $("#vis_canvas");
		vis.html('');
		for (let i = 0; i < that["DOMs"].length; i++) {
			vis.append(that["DOMs"][i])
		}
		let prtDOM  = d3.select(that["prtDOMid"]);
		prtDOM.attr("width", WIDTH + margin.left + margin.right)
			.attr("height", HEIGHT + margin.top + margin.bottom);
		that["f"](prtDOM, that["width"], that["height"], data[0]);

	}

	d3.selectAll(".step_link").on("click", function(d){
		let clickedStep = d3.select(this).attr("id");
		switchStep(clickedStep);
		switchAnnotation(clickedStep);
		switchVis(clickedStep);
		return false;
	});


});
