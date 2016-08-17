module powerbi.extensibility.visual {
    interface PieSlice {
        name: string;
        value: number;
        id: ISelectionId;
        color?: string;
    }

    export class Visual implements IVisual {
        private svg: d3.Selection<SVGElement>;
        private mainGroup: d3.Selection<SVGElement>;
        private mainGroupPos: d3.Selection<SVGElement>;
        private mainGroupPosWrap: d3.Selection<SVGElement>;
        private mainGroupNeg: d3.Selection<SVGElement>;
        private mainGroupNegWrap: d3.Selection<SVGElement>;
        private slices: PieSlice[][];
        private colorWheel: ColorWheel;
        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private tooltip: HTMLElement;        
        private currentFocalPoint: string;
        
        constructor(options: VisualConstructorOptions) {
            debugger
            this.colorWheel = new ColorWheel(options.host.colors);   
            this.svg = d3.select(options.element).append('svg');
            this.mainGroup = this.svg.append('g');
            this.mainGroupPosWrap = this.svg.append('a').attr('xlink:href','#');
            this.mainGroupPos = this.mainGroupPosWrap.append('g')
            this.mainGroupNegWrap = this.svg.append('a').attr('xlink:href','#');
            this.mainGroupNeg = this.mainGroupNegWrap.append('g')
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            //this.tooltip;

            let mainDesc = 'This is a report visual titled Bank Statement Amount by Transaction. There are two pie charts on this visual. Press Ctrl-Shift-N to hear the summary of the charts. Press Ctrl-Shift-L to go to the left chart, titled Percentage Earned By Categories. Press Ctrl-Shift-R to go to right chart, titled Percentage Spent By Categories.'

            $('button').remove();
            $('[tabindex]').attr('tabindex','-1');
            d3.select(options.element)
                .attr('aria-label', mainDesc)
                .attr('tabindex', '3')

            //let moneySpent  = $('.arc.left').find('a')[0].
            let insights = 'Overall you spent 179.18 dollars and earned 162.05 dollars. You spent the most on Dominoes. You spent 87.17 dollars on Dominoes and this was 49% of your total money spent. You earned the most from Automatic Payment from Chase. You earned 110.11 dollars and this was 68% of your total money earned. You spent a total of 117.73 dollars of food, 40.13 dollars on transportation, and 9.99 dollars on entertainment.'
            
            let imageWrap = $('<a>')
                .attr('aria-label', insights)
                .attr('height', '50')
                .attr('width', '50')
                .attr('left', '10')
                .attr('top', '10')
                .attr('z-index','0')
                .attr('tabindex','4')
                .prependTo(options.element);

            let image = $('<img>')
                .attr("src","https://cdn3.iconfinder.com/data/icons/glypho-generic-icons/64/user-man-speech-bubble-512.png")
                .attr('height', '50')
                .attr('width', '50')                
                .appendTo(imageWrap);

            console.log('blah');
            
            var that = this;
            function doc_keyUpWhole(e) {
                //debugger;
                if (e.ctrlKey && e.shiftKey && e.which == 78) {
                    $(image).eq(0).parent()[0].focus();
                }
                else if (e.ctrlKey && e.shiftKey && e.which == 76) {
                    that.currentFocalPoint = "left";
                    $(that.mainGroupPosWrap)[0][0].focus();
                }
                else if (e.ctrlKey && e.shiftKey && e.which == 82) {
                    that.currentFocalPoint = "right";
                    $(that.mainGroupNegWrap)[0][0].focus();
                }else if (e.which == 101 || e.which==69) {
                    //debugger;
                    e.stopPropagation();
                    switch(that.currentFocalPoint){
                        case "left":
                        //debugger;
                        $('.arc.left').find('a')[0].focus();
                        break;
                        case "right":
                        $('.arc.right').find('a')[0].focus();
                    }
                }
            }

            image.on('click', function() {
                console.log('click')
                this.focus();
            })


            //document.addEventListener('keyup', doc_keyUpWhole, false);

            this.mainGroupPosWrap
                .attr('aria-label', 'This pie is titled Percentage Earned by Categories. Press e to explore this chart.')
                .attr('tabindex', '5');

            this.mainGroupPos.on('click', function() {
                console.log('click')
                this.focus();
            })

            // function doc_keyUpLeft(e) {
            //     if (e.ctrlKey && e.shiftkey && e.which == 76) {
            //         this.mainGroupPosWrap.focus();
            //     }
            // }

            // document.addEventListener('keyup', doc_keyUpLeft, false);


            this.mainGroupNegWrap
                .attr('aria-label', 'This pie is titled Percentage Spent by Categories. Press e to explore this chart.')
                .attr('tabindex', '6');

            this.mainGroupNeg.on('click', function() {
                console.log('click')
                this.focus();
            })

            document.addEventListener('keyup', doc_keyUpWhole, false);

            // function doc_keyUpRight(e) {
            //     if (e.ctrlKey && e.shiftkey && e.which == 82) {
            //         this.mainGroupNegWrap.focus();
            //     }
            // }

            // document.addEventListener('keyup', doc_keyUpRight, false);


            /*var tooltip = d3.select(options.element)
                .append("div")
                .style("position", "absolute")
                .attr("text-align", "center")
                .attr("width", 60)
                .attr("height", 28)
                .attr("padding", 2)
                .style("z-index", "10")
                .style("visibility", "hidden")
                .style("background", "#000");*/
        }

        private getDatapointColor(column: DataViewCategoryColumn, index: number, defaultFill: Fill): Fill {
            let objects = column.objects;
            if (objects) {
                let object: DataViewObject = objects[index];
                if (object) {
                    let dataPoint: any = object['dataPoint'];
                    if (dataPoint)
                        return dataPoint.fill;
                }
            }

            return defaultFill;
        }
        
        private transform(dataViews: DataView[]): PieSlice[][] {
            let dataView = dataViews[0];
            let categorical = dataView.categorical;
            let category = categorical.categories[0];
            let categoryValues = category.values;
            let values = categorical.values;
            let colorWheel = this.colorWheel;
            let host = this.host;
            let posSlices: PieSlice[] = [];
            let negSlices: PieSlice[] = [];
            let firstSeries = values[0]; //actual inputted values

            for (let i = 0; i < categoryValues.length; i++)
            {
                let catVal = categoryValues[i]
                let fill = this.getDatapointColor(category, i, { solid: { color: colorWheel.getColor(catVal).value } }).solid.color;
                let val = firstSeries.values[i];

                if (val > 0)
                {
                    posSlices.push({
                        name: catVal,
                        value: val,
                        id: host.createSelectionIdBuilder().withCategory(category, i).createSelectionId(),
                        color: fill
                    })
                }
                else
                {
                    negSlices.push({
                        name: catVal,
                        value: val,
                        id: host.createSelectionIdBuilder().withCategory(category, i).createSelectionId(),
                        color: fill
                    })
                }
            }

            this.colorWheel.reset();
            return [posSlices, negSlices];
        }        



        public update(options: VisualUpdateOptions) {
            let viewport = options.viewport;
            let margin = { top: 20, right: 20, bottom: 30, left: 50};
            let width = viewport.width;
            let height = viewport.height;;
            let radius = Math.min(width, height) / 4;

            let shouldExecuteTransform = (options.type & VisualUpdateType.Data) == VisualUpdateType.Data;

            let data: PieSlice[][] = this.slices = shouldExecuteTransform ? this.transform(options.dataViews) : this.slices;

            let arc = d3.svg.arc<{ data: PieSlice }>()
                .outerRadius(radius * 0.9)
                .innerRadius(radius * 0.6)

            let pie = d3.layout.pie<PieSlice>()
                .sort(null)
                .value(d => d.value);

            this.svg.attr({ 'width': width, 'height': height });

            let mainGroupPos = this.mainGroupPos.attr('transform', 'translate(' + width / 4 + ',' + height / 2 + ')');
            let mainGroupNeg = this.mainGroupNeg.attr('transform', 'translate(' + (width / 4)*3 + ',' + height / 2 + ')');

            let selectionPos = mainGroupPos.selectAll('.arc')
                .data(pie(data[0]));
            let selectionNeg = mainGroupNeg.selectAll('.arc')
                .data(pie(data[1]));

            let selectionPosEnter = selectionPos.enter()
                .append('g')
                .attr('class', 'arc left')
                
            //this.image.attr('aria-label', 'label');

            selectionPosEnter
                .append('a')
                .attr('xlink:href','#')
                .attr('class','path-wrap')
                .append('path');

            selectionPosEnter.append('text')
                .attr('class', 'labels');

            mainGroupPos.append('text')
                .attr('class', 'title');

            let selectionNegEnter = selectionNeg.enter()
                .append('g')
                .attr('class', 'arc right');

            selectionNegEnter
                .append('a')
                .attr('xlink:href','#')
                .attr('class','path-wrap')
                .append('path');

            selectionNegEnter.append('text')
                .attr('class', 'labels');
            mainGroupNeg.append('text')
                .attr('class', 'title');

            this.svg
                .append('defs')
                .append('pattern')
                    .attr('id', 'diagonalHatch')
                    .attr('patternUnits', 'userSpaceOnUse')
                    .attr('width', 4)
                    .attr('height', 4)
                .append('path')
                    .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
                    .attr('stroke', '#000000')
                    .attr('stroke-width', 1);

            selectionPos
                .select('path')
                .attr('d', arc)
                .style('fill', d => d.data.color)
                .attr('fill', 'url(#diagonalHatch)');
                // .append('title')
                // .text(function (d) { return d.value; });
                // .on("mouseover", function(d) {
                //     //debugger;
                //     var coords = d3.mouse(this);
                //     this.tooltip.text(d.value); 
                //     this.tooltip.attr("x", coords[0]);
                //     this.tooltip.attr("y", coords[1]);
                //     return this.tooltip.style("visibility", "visible");
                // })
                // //.on("mousemove", function(){return this.tooltip.attr("y", ((<any>d3).event.pageY +100)).attr("x",((<any>d3).event.pageX+100));})
                // .on("mouseout", function(){return this.tooltip.style("visibility", "hidden");});
                

            selectionPos
                .select('a.path-wrap')
                .attr('aria-label', 
                    function(d, i) { return "You earned " + d.value + " dollars from " + d.data.name;});

            selectionNeg   
                .select('path')
                .attr('d', arc)
                .style('fill', d => d.data.color)

            selectionNeg
                .select('a.path-wrap')
                .attr('aria-label', 
                    function(d, i) { return "You spent " + (-d.value) + " dollars on " + d.data.name;});

            selectionPos   
                .select('text.labels')  
                .attr("transform", function (d) {
                    //d.data.innerRadius = 0;
                    //d.outerRadius = radius;
                    return "translate(" + arc.centroid(d) + ")";
                })
                .attr("text-anchor", "middle")
                .style("font-size", "18px")
                .text(function(d, i) { return d.data.name; });

            mainGroupPos   
                .select('text.title')    
                .attr("x", (0))             
                .attr("y", (-height/4))
                .attr("text-anchor", "middle")  
                .style("font-size", "24px") 
                .text("Percentage Earned By Categories");
            
            selectionNeg
                .select('text.labels')  
                .attr("transform", function (d) {
                    //d.data.innerRadius = 0;
                    //d.outerRadius = radius;
                    return "translate(" + arc.centroid(d) + ")";
                })
                .attr("text-anchor", "middle")
                .style("font-size", "18px")
                .text(function(d, i) { return d.data.name; });
            // debugger

            mainGroupNeg  
                .select('text.title')    
                .attr("x", (0))             
                .attr("y", (-height/4))
                .attr("text-anchor", "middle")  
                .style("font-size", "24px") 
                .text("Percentage Spent By Categories");

            let selectionManager = this.selectionManager;
            selectionPos.on('click', function (d) {
                selectionManager.select(d.data.id).then((ids) => {
                    selectionPos.style('opacity', ids.length > 0 ? 0.5 : 1);
                    d3.select(this).style('opacity', 1);
                    $(this).find('a.path-wrap').focus();
                });
            })
            selectionNeg.on('click', function (d) {
                selectionManager.select(d.data.id).then((ids) => {
                    selectionNeg.style('opacity', ids.length > 0 ? 0.5 : 1);
                    d3.select(this).style('opacity', 1);
                    $(this).find('a.path-wrap').focus();
                });
            })
            $('a.path-wrap').off().on('click', e => e.preventDefault());

            selectionPos.exit().remove();
            selectionNeg.exit().remove();

        }
    }
}
