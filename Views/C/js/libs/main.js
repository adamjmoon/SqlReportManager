requirejs.config({
    baseUrl: "Views/C/js/libs"
});
require(['ace/ace',"ace/ext/language_tools"], function (ace) {
    // trigger extension
    ace.require("ace/ext/language_tools");
    window.sqlEditor = ace.edit("sqlEditor");
    sqlEditor.session.setMode("ace/mode/sql");
    sqlEditor.setTheme("ace/theme/terminal");
    // enable autocompletion and snippets
    sqlEditor.setOptions({
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true
    });
    
    
    
    require(['../mylibs/sqlReportManager.Module'], function(){
        
        require(['../mylibs/sqlReportManager.Table'], function(){
            SqlReportManager.Init();
            
            sqlEditor.commands.addCommand({
                    name: 'execute query',
                    bindKey: "ctrl+q",
                    exec: function (editor) {
                        SqlReportManager.PullReport();
                    },
                    readOnly: false
                });
        });
    });
});