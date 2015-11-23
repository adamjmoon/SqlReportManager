var SqlReportManager = (function (parent, $) {
    // add capabilities...

    parent.LoadTable = function () {
        
        var request = $.ajax({
            type: "POST",
            url: "/Report/Table",
            data: parent.Selected,
            dataType: "json",

            success: function (jsonTableArray) {

                $('#results').html("");
                
                var results = document.getElementById('results');
                
                
                jsonTableArray.forEach(processSqlResultTable);

                function processSqlResultTable(json, index, array) {
                    json = JSON.parse(json);
                    $('#results').append('<br/><div id="table' + index + 'Wrapper" ></div');
                    $('#table' + index + 'Wrapper').append('<table  class="table-hover" id="table' + index + '" ></table>');

                    if (json.aoColumns.length == 0) {
                        SqlReportManager.LoadSql();
                        $('a[href*="#results"]').click();
                        $("#loading").hide();
                        
                        $("div#table" + index + "Wrapper").block({
                            message: '<h1>Query Returned 0 Results</h1>',
                            css: {
                                border: 'none',
                                padding: '15px',
                                backgroundColor: '#428bca',
                                opacity: .8,
                                color: '#fff',
                                width: '100%',
                                height: (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 150 + "px",
                                'display': 'flex',
                                'align-items': 'center',
                                'justify-content': 'center'
                            }
                        });

                        

                    } else {

                        TableTools.DEFAULTS.aButtons = ["copy", "csv", "xls"];
                        if (json.aoColumns.length == 0) {

                            $("#loading").hide();
                        } else {
                            json.aaSorting = [
                                [0, "desc"]
                            ];
                            json.bDeferRender = true;
                            json.bPaginate = true;
                            json.bRetrieve = true;
                            json.bFilter = true;
                            json.bSort = true;
                            json.bInfo = true;
                            json.bDestroy = true;
                            json.bJQueryUI = true;
                            json.sPaginationType = "full_numbers";
                            json.iDisplayLength = 25;
                            json.aLengthMenu = [
                                [5, 10, 25, 50, -1],
                                [5, 10, 25, 50, "All"]
                            ],
                            json.sDom = 'T<"clear">lrtip';
                            json.oTableTools = {
                                sSwfPath: "/Views/C/js/TableTools-2.0.1/media/swf/copy_cvs_xls.swf"
                            };
                            json.sScrollX = "100%";
                            json.bAutoWidth = true;
                            json.bLengthChange = true;
                            json.bScrollCollapse = true;
                            json.sScrollY = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 150 + "px",
                            json.bDeferRender = true;


                            var oTable = $('#table' + index).dataTable(json);

                            var filterRow = "<tr>";

                            for (i = 0; i < json.aoColumns.length; i++) {
                                filterRow += '<th>' + json.aoColumns[i].sTitle + '</th>';
                            }

                            filterRow += '</tr>';
                            $(filterRow).prependTo('#table' + index + 'Wrapper .dataTables_scrollHeadInner thead');
                            $('#table' + index).dataTable().columnFilter();
                            $('select').trigger('change.DT');
                            //                            $("#loading").fadeOut(1000);

                            $('#table' + index + 'Wrapper .text_filter', this).change(function () {
                                oTable.fnFilter("^" + $(this).val() + "$", null, true); // &lt;--- add 3rd parameter "true" and add anchors
                            });


//                            $("#table0_wrapper .dataTables_scroll .dataTables_scrollBody").niceScroll({
//                                cursorcolor: "#f56715"
//                            });
                           
                        }
                    }
                }

                
            }
        });

        request.fail(function (xmlRequest, message, err) {
            $('a[href*="#results"]').click();
            $("#loading").fadeOut();
            
            $("div#results").unblock();
            $("div#results").block({
                message: "<h2>Error: " + parent.ParseError(xmlRequest) + "</h2>",
                css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: 'red',
                    opacity: .8,
                    color: '#fff',
                    width: '100%',
                    height: (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 150 + "px",
                    'display': 'flex',
                    'align-items': 'center',
                    'justify-content': 'center'

                }
            });

        });

        return false;
    };

    parent.LoadSql = function () {
        $.getJSON("/Report/Sql", {
            name: parent.Selected.DB + "." + parent.Selected.Report
        }, function (data) {
            parent.SqlReport.Sql = data.sql;
            parent.SqlReport.ReportName = SqlReportManager.Selected.Report;
            window.sqlEditor.getSession().getDocument().setValue(data.sql);
            $("#reportName").val(parent.SqlReport.ReportName);
        });

        return false;
    };

    parent.PullReport = function () {
        $("div#results").unblock();
        $('a[href*="#results"]').click();
        
        $("div#results").block(
            {
                message: "<h1 class=''>Executing&nbsp;Query&nbsp;...</h1>",

            });

        try {
            $("#filter").val("");
            SqlReportManager.LoadSql();
            SqlReportManager.LoadTable();
        } catch (err) {
            SqlReportManager.LoadSql();
            SqlReportManager.LoadTable();
        }

        return false;
    };

    parent.SaveReport = function () {

        parent.SqlReport.Sql = $("#sqlTextArea").val();
        parent.SqlReport.ReportName = $("#reportName").val();
        parent.SqlReport.DB = parent.Selected.DB;
        var request = $.ajax({
            type: "POST",
            url: "/Report/Save",
            data: parent.SqlReport,
            dataType: "json",

            success: function (json) {
                parent.Selected.Report = SqlReportManager.SqlReport.ReportName;
                SqlReportManager.LoadSqlReportList();
                $("#pullReport").click();
            }
        });

        request.fail(function (xmlRequest, message, err) {

            $("#loading").fadeOut();
            $("div#results").unblock();
            $("div#results").block({
                message: "Query failed with Error: " + parent.ParseError(xmlRequest),
                css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: '#000',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    opacity: .5,
                    color: '#fff'
                }
            });

            
        });


    };
    return parent;
}(SqlReportManager || {}, jQuery));