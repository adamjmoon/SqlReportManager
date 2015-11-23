var SqlReportManager = function ($) {
    var srm = {};

    srm.Selected = {};
    srm.Selected.Server = "localhost";
    srm.Selected.DB = "ApplicationLog";
    srm.Selected.Report = "Recent Errors 200";
    srm.Selected.WhereClause = "";
    srm.SqlReport = {};
    srm.SqlReport.Sql = "";
    srm.SqlReport.ReportName = "";
    srm.SqlReport.DB = "";
    srm.windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
    srm.windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;

    srm.pageHeight = (srm.windowHeight - 90);

    srm.ParseError = function (error) {
        var idx1 = error.responseText.indexOf("<title>");
        var idx2 = error.responseText.indexOf("</title>");
        var len = idx2 - idx1;
        return error.responseText.substr(idx1 + 7, len - 7);
    };

    srm.LoadSqlReportList = function () {
        $.getJSON("/Report/List", { report: srm.Selected.Report, db: srm.Selected.DB }, function (data) {
            $("#reportList").fillSelect(data);
            SqlReportManager.Selected.Report = $("#reportList option:selected").text();
            srm.UpdateUrlSearch();

        });
    };

    srm.getUrlVars = function () {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
            vars[key] = value;
        });
        return vars;
    };

    srm.UpdateUrlSearch = function () {
        window.history.replaceState({}, "", "/?server=" + srm.Selected.Server + "&db=" + srm.Selected.DB + "&report=" + srm.Selected.Report);
    };

    srm.Init = function () {

        $.ajaxSetup({ cache: false });
        // adjust div heights
        $("#reportTab").height(srm.pageHeight);
        $("#sqlTab").height(srm.pageHeight);

        $('#sqlTextArea').height(srm.pageHeight - 100);


        // selection onchange
        $("#dbList").change(function () {
            srm.Selected.DB = $("#dbList option:selected").text();
            srm.LoadSqlReportList();
            return false;
        });

        $("#serverList").change(function () {
            srm.Selected.Server = $("#serverList option:selected").text();
            srm.UpdateUrlSearch();
            return false;
        });

        $("#reportList").change(function () {
            srm.Selected.Report = $("#reportList option:selected").text();
            srm.LoadSql();
            srm.UpdateUrlSearch();
            return false;
        });
        
        $("#themes").change(function () {
            var theme = "ace/theme/" + $("#themes option:selected").text();
            sqlEditor.setTheme(theme);
            
            return false;
        });


        // pull report button
        $("#pullReport").click(function () {
            
            srm.PullReport();
           
        });

        // save report button
        $("#saveReport").click(function () {
            srm.SaveReport();
            return false;
        });

//        var uploader = new qq.FileUploader({
//            element: document.getElementById('fileupload'),
//            action: '/Report/Upload',
//            debug: false,
//            allowedExtensions: ['sql'],
//            onComplete: function (id, fileName, result) {
//                // pull down table of files now
//                if (result.toString().indexOf("Error") != -1) {
//                    alert(result);
//                } else {
//                    srm.LoadSqlReportList();
//                    $("#successStatus").val(fileName + " Uploaded Successfully");
//                    $("#successStatus").fadeIn().delay(2000).fadeOut();
//                }
//
//            }
//        });
//
        // evaluate url parameters
        var urlVars = srm.getUrlVars();
        var server = urlVars["server"];
        var db = urlVars["db"];
        var report = urlVars["report"];

        if (server && db && report) {
            // get url parameters passed
            srm.Selected.Server = server;
            srm.Selected.DB = db;
            srm.Selected.Report = report.replace(/%20/g, " ");

            $("#loading").show();
            // load sql and report for the url parameters provided
            srm.PullReport();

            $('div[id="results"]').click();
        }
        else {
            SqlReportManager.LoadSql();
            $("#loading").hide();
            $('a[href*="#sql"]').click();
        }

        // populate dropdowns
        $.getJSON("/json/ServerList.json", null, function (data) {
            $("#serverList").fillSelect(data);
            if (srm.Selected.Server) {
                $('#serverList').find('option[value="' + srm.Selected.Server + '"]').prop('selected', true);
            }
            else {
                srm.Selected.Server = $("#serverList option:selected").text();
            }
        });

        $.getJSON("/json/DBList.json", null, function (data) {
            $("#dbList").fillSelect(data);
            if (srm.Selected.DB) {
                $('#dbList').find('option[value="' + srm.Selected.DB + '"]').prop('selected', true);
            }
            else {
                srm.Selected.DB = $("#dbList option:selected").text();
            }
        });

        srm.LoadSqlReportList();

        return false;
    };

    return srm;
}(jQuery);
    
