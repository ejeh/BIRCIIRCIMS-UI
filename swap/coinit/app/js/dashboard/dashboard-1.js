(function($) {
    /* "use strict" */


 var dzChartlist = function(){
	
	var screenWidth = $(window).width();
	
	
		
	var activityBar = function(){
		var style = getComputedStyle(document.body);
		var chartCol = style.getPropertyValue('--primary');
		var activity = document.getElementById("activityLine");
		var inputs = {
			min: 20,
			max: 80,
			count: 8,
			decimals: 2,
			continuity: 1
		};
		if (activity !== null) {
			var activityData = [{
					first: [50, 75, 34, 55, 25, 70, 30, 80, 30, 90, 25, 65]
				},
				{
					first: [50, 35, 10, 45, 40, 50, 60, 35, 10, 70, 34, 35]
				},
				{
					first: [20, 35, 70, 45, 40, 35, 30, 35, 10, 40, 60, 20]
				}
			];
			
			activity.height = 350;
			
			var config = {
				type: "line",
				data: {
					labels: [
						"January",
						"February",
						"March",
						"April",
						"May",
						"June",
						"July",
						"August",
						"September",
						"October",
						"November",
						"December",
					],
					datasets: [
						{
							label: "My First dataset",
							data:  [50, 75, 34, 55, 25, 70, 30, 80, 30, 90, 25, 65],
							//borderColor: '#2130b8',
							borderColor: chartCol,
							borderWidth: "5",
							barThickness:'flex',
							backgroundColor: 'rgba(47, 76, 221, 0.05)',
							minBarLength:10,
							tension:0.5,
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins:{
						legend:false,	
					},
					
					legend: {
						display: false
					},
					scales: {
						y: {
							 gridColor: "navy",
							grid:{
								color: "rgba(0,0,0,0.1)",
								height: 50,
								drawBorder: true
							},
							ticks: {
								color: "#585858",
								max: 100,
								min: 0,
								stepSize: 20
							},
						},
						x: {
							barPercentage: 0.3,
							
							grid: {
								display: false,
								zeroLineColor: "transparent"
							},
							ticks: {
								stepSize: 20,
								fontColor: "#585858",
								fontFamily: "Nunito, sans-serif"
							}
						}
					},
					tooltips: {
						mode: "index",
						intersect: false,
						titleFontColor: "#888",
						bodyFontColor: "#555",
						titleFontSize: 12,
						bodyFontSize: 15,
						backgroundColor: "rgba(255,255,255,1)",
						displayColors: true,
						xPadding: 10,
						yPadding: 7,
						borderColor: "rgba(220, 220, 220, 1)",
						borderWidth: 1,
						caretSize: 6,
						caretPadding: 10
					}
				}
			};

			var ctx = document.getElementById("activityLine").getContext("2d");
			var myLine = new Chart(ctx, config);

			var items = document.querySelectorAll("#user-activity .nav-tabs .nav-item");
			items.forEach(function(item, index) {
				item.addEventListener("click", function() {
					config.data.datasets[0].data = activityData[index].first;
					myLine.update();
				});
			});
			$('input[name="primary_bg"]').on('click', function() {
				///console.log(chartCol);
				config.data.datasets[0].borderColor = chartCol;
				myLine.update();
			})
			
		}
	}
	
	
	
	
	var donutChart = function(){
		var options = {
			series: [25, 35, 45],
			colors:['#ff7a00', '#2130b8', '#21b830'],
			chart: {
				width: 220,
				height: 220,
				type: 'donut',
				sparkline: {
					enabled: true,
				},
				
			},
			plotOptions: {
				pie: {
					customScale: 1,
					donut: {
						size: '40%'
						
					}
				}
			},
			dataLabels: {
				enabled: false
			},
			responsive: [{
				breakpoint: 1300,
				options: {
					chart: {
						width: 120,
						height: 120
					},
				}
			}],
			legend: {
				show: false
			}
        };
        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
	}
	var ticketSoldChart = function(){
			//#ticketSold
		if(jQuery('#ticketSold').length > 0 ){
		const ticketSold = document.getElementById("ticketSold").getContext('2d');
		
		// ticketSold.height = 100;

		let barChartData = {
			defaultFontFamily: 'Poppins',
			labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			datasets: [{
				label: 'Expense',
				backgroundColor: '#2130b8',
				hoverBackgroundColor: '#142193', 
				barThickness:"18",

				data: [
					'20',
					'14',
					'18',
					'25',
					'27',
					'22',
					'12', 
					'24', 
					'20', 
					'14', 
					'18', 
					'16'
				]
			}, {
				label: 'Earning',
				backgroundColor: '#f0f0f0',
				hoverBackgroundColor: '#e6e6e6',
				barThickness:"15", 
				data: [
					'12',
					'18',
					'14',
					'7',
					'5',
					'10',
					'20', 
					'8', 
					'12', 
					'18', 
					'14', 
					'16'
				]
			}]

		};

		new Chart(ticketSold, {
			type: 'bar',
			data: barChartData,
			options: {
				plugins:{
					legend:false,	
				},
				legend: {
					display: false
				}, 
				title: {
					display: false
				},
				tooltips: {
					mode: 'index',
					intersect: false
				},
				responsive: true,
				maintainAspectRatio: false, 
				scales: {
					x: {
						display: true, 
						stacked: true,
						barPercentage: 0.25, 
						barThickness:15,
						ticks: {
							display: true
						}, 
						grid: {
							display: false, 
							drawBorder: false
						}
					},
					y: {
						display: true, 
						stacked: true, 
						grid: {
							display: false, 
							drawBorder: false
						}, 
						ticks: {
							display: false
						}
					}
				}
			}
		});
		}
	}
	var peityPrimary = function(){
		$(".peity-primary").peity("line", {
			fill: ["rgba(33, 48, 184, .2)"], 
			stroke: '#2130b8', 
			strokeWidth: '4', 
			width: "80",
			height: "50"
		});
	}
	var scheduleEvent = function(){
		if(screenWidth < 1400 ){
			/* jQuery('.schedule-event').on('click',function(){
				jQuery('.event-sidebar').toggleClass('active');				
			});
			jQuery('.event-sidebar').removeClass('active');	  */				
		}
	}
	
	
	/* Function ============ */
		return {
			init:function(){
			},
			
			
			
			load:function(){
				activityBar();
				donutChart();
				ticketSoldChart();
				peityPrimary();
				scheduleEvent();
			},
			
			resize:function(){
			}
		}
	
		jQuery(document).ready(function(){
			
		});
	}();

		
	jQuery(window).on('load',function(){
		setTimeout(function(){
			dzChartlist.load();
		}, 1000); 
		
	});

	jQuery(window).on('resize',function(){
		
		
	});     

})(jQuery);