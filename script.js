//Google Maps API Implementation
var map;
function initMap(dlat, dlong) {
    if (typeof dlat != 'undefined') {
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: dlat, lng: dlong },
            mapTypeId: 'satellite',
            zoom: 18
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {

    const companyAPI = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php';
    const companyList = document.querySelector("#companyList");
    document.querySelector("#loader3").style.display = "block";
    document.querySelector(".c").style.display = "none";
    document.querySelector(".d").style.display = "none";
    document.querySelector(".e").style.display = "none";
    document.querySelector(".f").style.display = "none";
    let companies = retrieveCompanies();

    if (companies.length === 0) {
        console.log("You are not using local storage");
        fetch(companyAPI)
            .then(response => response.json().then(data => localStorage.setItem('companyListInternal', JSON.stringify(data))))
    } else {
        console.log("You are using local storage");
    }

    const viewButton = document.querySelector('#viewBtn');
    const closeBtn = document.querySelector("#closeButton");
    viewButton.addEventListener('click', changeView);
    closeBtn.addEventListener('click', changeViewBack);


    //Hides Credits After 5 Seconds
    const credits = document.querySelector(".tooltip");
    const creditsText = document.querySelector(".tooltiptext");
    
    credits.addEventListener('mouseover', () => {
        creditsText.style.visibility = "visible";
        timeout = setTimeout(function() {creditsText.style.visibility = "hidden"; }, 5000);
    });

    popList(companies);

    async function popList(companies) {
        const searchBox = document.querySelector('.search');
        const suggestions = document.querySelector('#filterList');
        searchBox.addEventListener('keyup', displayMatches);

        //Go Button
        goButton = document.querySelector("#go");
        goButton.addEventListener('click', () => letsGo());

        //Compares the value within the search box to the names of the companies within the array
        function letsGo() {

            const inputVal = document.querySelector("#searchbar").value;

            for (let i = 0; i < companies.length; i++) {
                if (companies[i].symbol === inputVal) {
                    infoFill(companies[i]);
                }
            }

        }

        //Creates List of Companies
        for (i of companies) {

            const currentComp = i;
            const infoAdd = document.createElement("li");
            infoAdd.textContent = currentComp.name;
            companyList.appendChild(infoAdd);


            infoAdd.addEventListener('click', () => infoFill(currentComp));

        }

        //Fills Company Information Section
        function infoFill(comp) {

            //List of Companies
            document.querySelector("#stockLogo").innerHTML = "<img src='logos/" + comp.symbol + ".svg' alt='" + comp.symbol + "'> <br>";
            document.querySelector("#stockSymbol").innerHTML = comp.symbol + "<br>";
            document.querySelector("#stockName").innerHTML = comp.name + "<br>";
            document.querySelector("#stockSector").innerHTML = comp.sector + "<br>";
            document.querySelector("#stockSubIndustry").innerHTML = comp.subindustry + "<br>";
            document.querySelector("#stockAddress").innerHTML = comp.address + "<br>";
            document.querySelector("#stockWebsite").innerHTML = comp.website + "<br>";
            document.querySelector("#stockWebsite").href = comp.website;
            document.querySelector("#stockExchange").innerHTML = comp.exchange + "<br>";
            document.querySelector("#stockDescription").innerHTML = comp.description + "<br>";

            document.querySelector("#companyList").style.display = "block";
            document.querySelector(".c").style.display = "block";
            document.querySelector(".c section").style.display = "block";

            //Map
            dlat = comp.latitude;
            dlong = comp.longitude;
            Number(dlong);
            Number(dlat);

            initMap(dlat, dlong);
            document.querySelector(".d").style.display = "block";
            //Stock Data
            document.querySelector(".e").style.display = "block";
            stockData(comp);
            document.querySelector("#viewBtn").style.display = "block";
            document.querySelector("#loader3").style.display = "none";

            //Calculations
            calculations(comp);
            document.querySelector(".f").style.display = "block";

            //Company Information (2nd Page)
            compInfo(comp);

            //Financial Data (2nd Page)
            financialData(comp);

            //Bar Chart
            makeBar(comp);

            //Candle Chart
            makeCandle(comp);

            //Line Chart
            makeLine(comp);
        }

        document.querySelector(".b section").style.display = "block";

        function displayMatches() {
            // don't start matching until user has typed in one letter
            if (this.value.length >= 1) {
                const matches = findMatches(this.value, companies);
                // first remove all existing options from list
                suggestions.innerHTML = "";
                // now add current suggestions to <datalist>
                matches.forEach(comp => {
                    var option = document.createElement('option');
                    option.textContent = comp.symbol;
                    suggestions.appendChild(option);
                });
            }
        }

        function findMatches(wordToMatch, companies) {
            return companies.filter(obj => {
                const regex = new RegExp('^' + wordToMatch, 'gi');
                return obj.symbol.match(regex);
            });
        }
    }
    //END OF POP LIST

    //Converts Number to Currency
    function currency(num) {
        return new Intl.NumberFormat('en-us', {
            style: 'currency',
            currency: 'USD'
        }).format(num);
    }

    //Fills Stock Data Section
    async function stockData(comp) {
        const stockAPI = "https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=" + comp.symbol;
        const getStock = await fetch(stockAPI)
        const stocks = await getStock.json();

        const mainTable = document.querySelector("#stockTable");

        if (stocks.length <= 1) {
            document.querySelector("#stockTable").innerHTML = "";
            const error = document.createElement("tr");
            error.textContent = "Error: Stock Data for this Company does not exist";
            mainTable.appendChild(error);
        } else {

            makeHeaders(stocks);
            showStocks(stocks);

            function makeHeaders(stocks) {
                document.querySelector("#stockTable").innerHTML = "";

                const headerRow = document.createElement("tr");
                headerRow.setAttribute("id", "headers");

                const date = document.createElement("td");
                const open = document.createElement("td");
                const close = document.createElement("td");
                const low = document.createElement("td");
                const high = document.createElement("td");
                const volume = document.createElement("td");

                date.textContent = "Date";
                date.style.fontWeight = "bold";
                headerRow.appendChild(date);
                date.addEventListener('click', () => filterList(date.textContent, stocks));

                open.textContent = "Open";
                open.style.fontWeight = "bold";
                headerRow.appendChild(open);
                open.addEventListener('click', () => filterList(open.textContent, stocks));

                close.textContent = "Close";
                close.style.fontWeight = "bold";
                headerRow.appendChild(close);
                close.addEventListener('click', () => filterList(close.textContent, stocks));


                low.textContent = "Low";
                low.style.fontWeight = "bold";
                headerRow.appendChild(low);
                low.addEventListener('click', () => filterList(low.textContent, stocks));


                high.textContent = "High";
                high.style.fontWeight = "bold";
                headerRow.appendChild(high);
                high.addEventListener('click', () => filterList(high.textContent, stocks));


                volume.textContent = "Volume";
                volume.style.fontWeight = "bold";
                headerRow.appendChild(volume);
                volume.addEventListener('click', () => filterList(volume.textContent, stocks));

                mainTable.appendChild(headerRow);
            }

            //Adds Stocks to Table
            function showStocks(data) {
                for (i of data) {
                    const mainTable = document.querySelector("#stockTable");
                    const tableRow = document.createElement("tr");
                    const tableDate = document.createElement("td");
                    const tableOpen = document.createElement("td");
                    const tableClose = document.createElement("td");
                    const tableLow = document.createElement("td");
                    const tableHigh = document.createElement("td");
                    const tableVolume = document.createElement("td");

                    tableDate.textContent = i.date;
                    tableRow.appendChild(tableDate);

                    tableOpen.textContent = currency(i.open);
                    tableRow.appendChild(tableOpen);

                    tableClose.textContent = currency(i.close);
                    tableRow.appendChild(tableClose);

                    tableLow.textContent = currency(i.low);
                    tableRow.appendChild(tableLow);

                    tableHigh.textContent = currency(i.high);
                    tableRow.appendChild(tableHigh);

                    tableVolume.textContent = i.volume;
                    tableRow.appendChild(tableVolume);

                    mainTable.appendChild(tableRow);

                    document.querySelector(".e table").style.display = "block";
                }
            }

            function filterList(index, stocks) {
                switch (index) {
                    case "Date":
                        const dateList = stocks.sort(function (a, b) {
                            if (a.date < b.date) {
                                return -1;
                            } else if (a.date > b.date) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });
                        makeHeaders(stocks);
                        showStocks(dateList);

                        break;
                    case "Open":
                        const openList = stocks.sort(function (a, b) {
                            if (a.open < b.open) {
                                return -1;
                            } else if (a.open > b.open) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });
                        makeHeaders(stocks);
                        showStocks(openList);

                        break;

                    case "Close":
                        const closeList = stocks.sort(function (a, b) {
                            if (a.close < b.close) {
                                return -1;
                            } else if (a.close > b.close) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });
                        makeHeaders(stocks);
                        showStocks(closeList);
                        break;
                    case "Low":
                        const lowList = stocks.sort(function (a, b) {
                            if (a.low < b.low) {
                                return -1;
                            } else if (a.low > b.low) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });
                        makeHeaders(stocks);
                        showStocks(lowList);
                        break;
                    case "High":
                        const highList = stocks.sort(function (a, b) {
                            if (a.high < b.high) {
                                return -1;
                            } else if (a.high > b.high) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });
                        makeHeaders(stocks);
                        showStocks(highList);
                        break;
                    case "Volume":
                        const volumeList = stocks.sort(function (a, b) {
                            if (a.volume < b.volume) {
                                return -1;
                            } else if (a.volume > b.volume) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });
                        makeHeaders(stocks);
                        showStocks(volumeList);
                        break;
                }
            }
            document.querySelector(".e table").style.display = "block";
        }
    }

    function retrieveCompanies() {
        return JSON.parse(localStorage.getItem('companyListInternal')) || [];
    }

    //Fills Extra Stock Information Section
    async function calculations(comp) {
        const stockAPI = "https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=" + comp.symbol;
        const getStock = await fetch(stockAPI)
        const stocks = await getStock.json();

        const extraStockInfoTable = document.querySelector("#extraStockInfo");

        if (stocks.length == 0) {
            document.querySelector("#extraStockInfo").innerHTML = "";
            const error = document.createElement("tr");
            error.textContent = "Error: Stock Data for this Company does not exist";
            extraStockInfoTable.appendChild(error);
        } else {

            //Calculate Averages
            document.querySelector("#Average").innerHTML = "";

            const average = document.querySelector("#Average");

            const avgHead = document.createElement("th");
            avgHead.textContent = "Average";
            avgHead.style.fontWeight = "bold";
            average.appendChild(avgHead);

            let openAvg = 0;
            let clsAvg = 0;
            let lowAvg = 0;
            let hiAvg = 0;
            let volAvg = 0;

            let openMin = 1000000000000000000000000000000000000000000000000000000;
            let clsMin = 1000000000000000000000000000000000000000000000000000000;
            let lowMin = 1000000000000000000000000000000000000000000000000000000;
            let hiMin = 1000000000000000000000000000000000000000000000000000000;
            let volMin = 1000000000000000000000000000000000000000000000000000000;

            let openMax = 0;
            let clsMax = 0;
            let lowMax = 0;
            let hiMax = 0;
            let volMax = 0;

            count = 0;

            for (i of stocks) {

                //Calculate Average Open
                ((openAvg += Number(i.open)));

                //Calculate Average Close
                ((clsAvg += Number(i.close)));

                //Calculate Average Low
                ((lowAvg += Number(i.low)));

                //Calculate Average High
                ((hiAvg += Number(i.high)));

                //Calculate Average Volume
                ((volAvg += Number(i.volume)));

                ((count += 1));



                //Calculate Minimum Open
                if (i.open < openMin) {
                    openMin = i.open;
                }

                //Calculate Minimum Close
                if (i.close < clsMin) {
                    clsMin = i.close;
                }

                //Calculate Minimum Low
                if (i.low < lowMin) {
                    lowMin = i.low;
                }

                //Calculate Minimum High
                if (i.high < hiMin) {
                    hiMin = i.high;
                }

                //Calculate Minimum Volume
                if (i.open < volMin) {
                    volMin = i.volume;
                }



                //Calculate Maximum Open
                if (i.open > openMax) {
                    openMax = i.open;
                }

                //Calculate Maximum Close
                if (i.close > clsMax) {
                    clsMax = i.close;
                }

                //Calculate Maximum Low
                if (i.low > lowMax) {
                    lowMax = i.low;
                }

                //Calculate Maximum High
                if (i.high > hiMax) {
                    hiMax = i.high;
                }

                //Calculate Maximum Volume
                if (i.open > volMax) {
                    volMax = i.volume;
                }


            }

            openAvg = openAvg / count;
            clsAvg = clsAvg / count;
            lowAvg = lowAvg / count;
            hiAvg = hiAvg / count;
            volAvg = volAvg / count;

            //Append Average
            const tableOpen = document.createElement("td");
            const tableClose = document.createElement("td");
            const tableLow = document.createElement("td");
            const tableHigh = document.createElement("td");
            const tableVolume = document.createElement("td");

            tableOpen.textContent = currency(openAvg);
            average.appendChild(tableOpen);

            tableClose.textContent = currency(clsAvg);
            average.appendChild(tableClose);

            tableLow.textContent = currency(lowAvg);
            average.appendChild(tableLow);

            tableHigh.textContent = currency(hiAvg);
            average.appendChild(tableHigh);

            tableVolume.textContent = Math.round(volAvg);
            average.appendChild(tableVolume);

            //Append Minimum
            document.querySelector("#stockMin").innerHTML = "";

            const minimum = document.querySelector("#stockMin");

            const minHead = document.createElement("th");
            minHead.textContent = "Minimum";
            minHead.style.fontWeight = "bold";
            minimum.appendChild(minHead);

            const tableOpenMin = document.createElement("td");
            const tableCloseMin = document.createElement("td");
            const tableLowMin = document.createElement("td");
            const tableHighMin = document.createElement("td");
            const tableVolumeMin = document.createElement("td");

            tableOpenMin.textContent = currency(openMin);
            minimum.appendChild(tableOpenMin);

            tableCloseMin.textContent = currency(clsMin);
            minimum.appendChild(tableCloseMin);

            tableLowMin.textContent = currency(lowMin);
            minimum.appendChild(tableLowMin);

            tableHighMin.textContent = currency(hiMin);
            minimum.appendChild(tableHighMin);

            tableVolumeMin.textContent = volMin;
            minimum.appendChild(tableVolumeMin);

            //Append Maximum
            document.querySelector("#stockMax").innerHTML = "";

            const maximum = document.querySelector("#stockMax");

            const maxHead = document.createElement("th");
            maxHead.textContent = "Maximum";
            maxHead.style.fontWeight = "bold";
            maximum.appendChild(maxHead);

            const tableOpenMax = document.createElement("td");
            const tableCloseMax = document.createElement("td");
            const tableLowMax = document.createElement("td");
            const tableHighMax = document.createElement("td");
            const tableVolumeMax = document.createElement("td");

            tableOpenMax.textContent = currency(openMax);
            maximum.appendChild(tableOpenMax);

            tableCloseMax.textContent = currency(clsMax);
            maximum.appendChild(tableCloseMax);

            tableLowMax.textContent = currency(lowMax);
            maximum.appendChild(tableLowMax);

            tableHighMax.textContent = currency(hiMax);
            maximum.appendChild(tableHighMax);

            tableVolumeMax.textContent = volMax;
            maximum.appendChild(tableVolumeMax);
        }
    }

    function changeView() {
        document.querySelector(".g").style.display = "block";
        document.querySelector(".h").style.display = "block";
        document.querySelector(".i").style.display = "block";
        document.querySelector(".j").style.display = "block";
        document.querySelector(".k").style.display = "block";
        document.querySelector(".b").style.display = "none";
        document.querySelector(".c").style.display = "none";
        document.querySelector(".d").style.display = "none";
        document.querySelector(".e").style.display = "none";
        document.querySelector(".f").style.display = "none";
    }

    function changeViewBack() {
        document.querySelector(".g").style.display = "none";
        document.querySelector(".h").style.display = "none";
        document.querySelector(".i").style.display = "none";
        document.querySelector(".j").style.display = "none";
        document.querySelector(".k").style.display = "none";
        document.querySelector(".b").style.display = "block";
        document.querySelector(".c").style.display = "block";
        document.querySelector(".d").style.display = "block";
        document.querySelector(".e").style.display = "block";
        document.querySelector(".f").style.display = "block";
    }

    //Displays the company info, allows for view toggling and speak synthesis
    function compInfo(data) {
        document.querySelector("#compNameInfo").textContent = data.name + " - " + data.symbol;
        document.querySelector("#compDescription").textContent = data.description;
        const speakBtn = document.querySelector("#speakButton");
        speakBtn.addEventListener('click',
            (e) => {
                const utterance = new SpeechSynthesisUtterance
                    (data.description);
                speechSynthesis.speak(utterance);
            });
    }

    //Creates the rows for the finance data table
    function financialData(info) {
        const financeTable = document.querySelector("#financeTable");
        if (info.financials == null) {
            financeTable.innerHTML = "";
            const financeError = document.createElement("p");
            financeError.textContent = "This company does not have any available financial data"
            financeTable.appendChild(financeError);
        } else {
            financeHeaders();
            for (let i = 2; i >= 0; i--) {
                const financeRow = document.createElement("tr");
                const financeDate = document.createElement("td");
                const financeRevenue = document.createElement("td");
                const financeEarnings = document.createElement("td");
                const financeAssets = document.createElement("td");
                const financeLiabilities = document.createElement("td");

                financeDate.textContent = info.financials.years[i];
                financeRow.appendChild(financeDate);

                financeRevenue.textContent = currency(info.financials.revenue[i]);
                financeRow.appendChild(financeRevenue);

                financeEarnings.textContent = currency(info.financials.earnings[i]);
                financeRow.appendChild(financeEarnings);

                financeAssets.textContent = currency(info.financials.assets[i]);
                financeRow.appendChild(financeAssets);

                financeLiabilities.textContent = currency(info.financials.liabilities[i]);
                financeRow.appendChild(financeLiabilities);

                financeTable.appendChild(financeRow);
            }
        }

    }

    //Creates the headers for the finance table
    function financeHeaders() {
        document.querySelector("#financeTable").innerHTML = "";
        const fTable = document.querySelector("#financeTable");

        const financeHeaders = document.createElement("tr");

        const fDate = document.createElement("th");
        const fRevenue = document.createElement("th");
        const fEarnings = document.createElement("th");
        const fAssets = document.createElement("th");
        const fLiability = document.createElement("th");

        fDate.textContent = "Date";
        financeHeaders.appendChild(fDate);
        fRevenue.textContent = "Revenue";
        financeHeaders.appendChild(fRevenue);
        fEarnings.textContent = "Earnings";
        financeHeaders.appendChild(fEarnings);
        fAssets.textContent = "Assets";
        financeHeaders.appendChild(fAssets);
        fLiability.textContent = "Liabilities";
        financeHeaders.appendChild(fLiability);

        fTable.appendChild(financeHeaders);
    }

    //Makes the Bar Chart
    var app = {};
    function makeBar(data) {
        var myChart = echarts.init(document.getElementById("box g"));
        myChart.clear();
        var option;
        var posList = [
            'left', 'right', 'top', 'bottom',
            'inside',
            'insideTop', 'insideLeft', 'insideRight', 'insideBottom',
            'insideTopLeft', 'insideTopRight', 'insideBottomLeft', 'insideBottomRight'
        ];
        const financeTable = document.querySelector(".g");
        if (data.financials == null) {
            console.log("Error: no financials exist");
            financeTable.innerHTML = "";
            const financeError = document.createElement("p");
            financeError.textContent = "This company does not have financial data to display here"
            financeTable.appendChild(financeError);
        } else {

            app.configParameters = {
                rotate: {
                    min: -90,
                    max: 90
                },
                align: {
                    options: {
                        left: 'left',
                        center: 'center',
                        right: 'right'
                    }
                },
                verticalAlign: {
                    options: {
                        top: 'top',
                        middle: 'middle',
                        bottom: 'bottom'
                    }
                },
                position: {
                    options: posList.reduce(function (map, pos) {
                        map[pos] = pos;
                        return map;
                    }, {})
                },
                distance: {
                    min: 0,
                    max: 100
                }
            };

            app.config = {
                rotate: 90,
                align: 'left',
                verticalAlign: 'middle',
                position: 'insideBottom',
                distance: 15,
                onChange: function () {
                    var labelOption = {
                        normal: {
                            rotate: app.config.rotate,
                            align: app.config.align,
                            verticalAlign: app.config.verticalAlign,
                            position: app.config.position,
                            distance: app.config.distance
                        }
                    };
                    myChart.setOption({
                        series: [{
                            label: labelOption
                        }, {
                            label: labelOption
                        }, {
                            label: labelOption
                        }, {
                            label: labelOption
                        }]
                    });
                }
            };


            var labelOption = {
                show: true,
                position: app.config.position,
                distance: app.config.distance,
                align: app.config.align,
                verticalAlign: app.config.verticalAlign,
                rotate: app.config.rotate,
                formatter: '{c}  {name|{a}}',
                fontSize: 16,
                color: 'rgb(255, 255, 255)',
                rich: {
                    name: {
                    }
                }
            };

            option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['Revenue', 'Earnings', 'Assets', 'Liabilities'],
                    textStyle: {
                        color: 'rgb(255, 255, 255)'
                    }
                },
                toolbox: {
                    show: true,
                    orient: 'vertical',
                    left: 'right',
                    top: 'center',
                    feature: {
                        mark: { show: true },
                        dataView: { show: true, readOnly: false },
                        magicType: { show: true, type: ['line', 'bar', 'stack', 'tiled'] },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                xAxis: [
                    {
                        type: 'category',
                        axisTick: { show: false },
                        data: ['2017', '2018', '2019'],
                        axisLabel: {
                            color: 'rgb(255, 255, 255)'
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        axisLabel: {
                            color: 'rgb(255, 255, 255)'
                        }
                    }
                ],
                series: [
                    {
                        name: 'Revenue',
                        type: 'bar',
                        barGap: 0,
                        label: labelOption,
                        emphasis: {
                            focus: 'series'
                        },
                        data: data.financials.revenue.reverse()
                    },
                    {
                        name: 'Earnings',
                        type: 'bar',
                        label: labelOption,
                        emphasis: {
                            focus: 'series'
                        },
                        data: data.financials.earnings.reverse()
                    },
                    {
                        name: 'Assets',
                        type: 'bar',
                        label: labelOption,
                        emphasis: {
                            focus: 'series'
                        },
                        data: data.financials.assets.reverse()
                    },
                    {
                        name: 'Liabilities',
                        type: 'bar',
                        label: labelOption,
                        emphasis: {
                            focus: 'series'
                        },
                        data: data.financials.liabilities.reverse()
                    }
                ]
            };

            option && myChart.setOption(option);
        }
    }

    //Make the Candle Chart
    async function makeCandle(data) {
        const stockAPI = "https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=" + data.symbol;
        const getStock = await fetch(stockAPI)
        const stocks = await getStock.json();

        var myChart = echarts.init(document.getElementById("box j"));
        var option;

        let openAvg = 0;
        let clsAvg = 0;
        let lowAvg = 0;
        let hiAvg = 0;
        let volAvg = 0;

        let openMin = 1000000000000000000000000000000000000000000000000000000;
        let clsMin = 1000000000000000000000000000000000000000000000000000000;
        let lowMin = 1000000000000000000000000000000000000000000000000000000;
        let hiMin = 1000000000000000000000000000000000000000000000000000000;
        let volMin = 1000000000000000000000000000000000000000000000000000000;

        let openMax = 0;
        let clsMax = 0;
        let lowMax = 0;
        let hiMax = 0;
        let volMax = 0;

        count = 0;

        for (i of stocks) {

            //Calculate Average Open
            ((openAvg += Number(i.open)));

            //Calculate Average Close
            ((clsAvg += Number(i.close)));

            //Calculate Average Low
            ((lowAvg += Number(i.low)));

            //Calculate Average High
            ((hiAvg += Number(i.high)));

            //Calculate Average Volume
            ((volAvg += Number(i.volume)));

            ((count += 1));



            //Calculate Minimum Open
            if (i.open < openMin) {
                openMin = i.open;
            }

            //Calculate Minimum Close
            if (i.close < clsMin) {
                clsMin = i.close;
            }

            //Calculate Minimum Low
            if (i.low < lowMin) {
                lowMin = i.low;
            }

            //Calculate Minimum High
            if (i.high < hiMin) {
                hiMin = i.high;
            }

            //Calculate Minimum Volume
            if (i.open < volMin) {
                volMin = i.volume;
            }



            //Calculate Maximum Open
            if (i.open > openMax) {
                openMax = i.open;
            }

            //Calculate Maximum Close
            if (i.close > clsMax) {
                clsMax = i.close;
            }

            //Calculate Maximum Low
            if (i.low > lowMax) {
                lowMax = i.low;
            }

            //Calculate Maximum High
            if (i.high > hiMax) {
                hiMax = i.high;
            }

            //Calculate Maximum Volume
            if (i.open > volMax) {
                volMax = i.volume;
            }


        }

        openAvg = openAvg / count;
        clsAvg = clsAvg / count;
        lowAvg = lowAvg / count;
        hiAvg = hiAvg / count;
        volAvg = volAvg / count;

        //parseFloat(openMin);

        const openMinChart = Number(openMin);
        const openMaxChart = Number(openMax);
        const openAvgChart = Number(openAvg);

        const clsMinChart = Number(clsMin);
        const clsMaxChart = Number(clsMax);
        const clsAvgChart = Number(clsAvg);

        const lowMinChart = Number(lowMin);
        const lowMaxChart = Number(lowMax);
        const lowAvgChart = Number(lowAvg);

        const highMinChart = Number(hiMin);
        const highMaxChart = Number(hiMax);
        const highAvgChart = Number(hiAvg);

        option = {
            title: {
                text: "Candlestick Chart",
                textStyle: {
                    color: 'rgb(255, 255, 255)'
                }
            },
            "xAxis": [{
                "type": "category",
                "data": ["Open", "Close", "Low", "High"],
                "scale": true,
                "boundaryGap": true,
                "axisTick": {
                    "show": false
                },
                "axisLabel": {
                    "show": true,
                    color: 'rgb(255, 255, 255)'
                },
                "axisPointer": {
                    "z": 100
                },

            }],
            "yAxis": [{
                scale: true,
                boundaryGap: true,
                axisLabel: {
                    formatter: '{value} $',
                    color: 'rgb(255, 255, 255)'
                }
            }],
            "series": [{
                "name": "stock",
                "type": "candlestick",
                "data": [
                    [openAvgChart, openAvgChart, openMinChart, openMaxChart],
                    [clsAvgChart, clsAvgChart, clsMinChart, clsMaxChart],
                    [lowAvgChart, lowAvgChart, lowMinChart, lowMaxChart],
                    [highAvgChart, highAvgChart, highMinChart, highMaxChart]
                ],
                "itemStyle": {
                    "normal": {
                        "color": "#fa6464",
                        "color0": "#32C896",
                        "borderColor": "#fa6464",
                        "borderColor0": "#32C896"
                    }
                },
                "markPoint": {
                    "label": {
                        "normal": {}
                    },
                    "data": []
                }
            }]
        };

        option && myChart.setOption(option);

    }

    //Makes the Line Chart
    async function makeLine(data) {
        const stockAPI = "https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=" + data.symbol;
        const getStock = await fetch(stockAPI)
        const stocks = await getStock.json();
        var chartDom = document.getElementById('box k');
        var myChart = echarts.init(chartDom);
        var option;
        const dates = [];
        const close = [];
        const volume = [];
        for (i of stocks) {
            dates.push(i.date);
            close.push(i.close);
            volume.push(i.volume);
        }

        option = {
            title: {
                text: 'Line Graph',
                textStyle: {
                    color: 'rgb(255, 255, 255)'
                }
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['Volume', 'Close'],
                textStyle: {
                    color: 'rgb(255, 255, 255)'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dates,
                //change 2 white
                axisLabel: {
                    color: 'rgb(255, 255, 255)'
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'Volume',
                    min: 0,
                    //max: 2000,
                    interval: 10000000,
                    axisLabel: {
                        formatter: '{value}',
                        color: 'rgb(255, 255, 255)'
                    },
                    nameTextStyle: {
                        color: 'rgb(255, 255, 255)'
                    }
                },
                {
                    type: 'value',
                    name: 'Close',
                    min: 0,
                    max: 1000,
                    interval: 50,
                    //Change text color to white
                    nameTextStyle: {
                        color: 'rgb(255, 255, 255)'
                    },
                    //Change text color to white
                    axisLabel: {
                        formatter: '{value} $',
                        color: 'rgb(255, 255, 255)'
                    }
                }
            ],
            series: [
                {
                    name: 'Volume',
                    type: 'line',
                    stack: '总量',
                    data: volume
                },
                {
                    name: 'Close',
                    type: 'line',
                    stack: '总量',
                    data: close
                }
            ]
        };
        option && myChart.setOption(option);


    }

});