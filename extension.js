// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');



var endChange = false;

function activate(context) {
    console.log('Congratulations,extension "file-comment" is now active!');

    var disposable = vscode.commands.registerCommand('extension.addHeader', function () {
        var editor = vscode.editor || vscode.window.activeTextEditor;
        var document = editor._documentData._document;
        var headerRange = getHeaderRange(document);
        if (!headerRange) {
            //第一次添加
            addHeader();
        } else {
            //进行更新
            updateHeader(headerRange);
        }
    });
    context.subscriptions.push(disposable);

    vscode.window.onDidChangeActiveTextEditor(function (editor) {
        // console.log("change editor");
    });
    vscode.workspace.onDidOpenTextDocument(function (document) {
        //如果文件被vscode之外的重命名了,执行重新更改文件名的操作
        // var headerRange = getHeaderRange(document);
        // if (!headerRange) {
        //     return;
        // } else {
        //     //进行更新
        //     updateHeader(headerRange,{file:true});
        // }       
        //可能是一个bug,1.8.1,document.isDirty一直是false
        // console.log("open "+document.fileName+":"+document.isDirty)
    });
    vscode.workspace.onDidChangeTextDocument(function (documentChange) {
        //file-comment替换掉文本内容也会触发更改事件
        // console.log(documentChange.document.fileName+":"+documentChange.contentChanges.length);
    });
    vscode.workspace.onDidSaveTextDocument(function (document) {
        if (!endChange) {
            var headerRange = getHeaderRange(document);
            if (!headerRange) {
                return;
            } else {
                //进行更新
                updateHeader(headerRange);
                endChange = true;
                document.save();
            }
        } else {
            document.save();
            endChange = false;
            // console.log("auto saved");
        }
    });

}

exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;

function getHeaderRange(document) {
    var lineCount = document.lineCount;//line start with 0
    var range = {
        start: -1,
        end: -1
    }
    var inHeader = false;
    for (var i = 0; i < lineCount; i++) {
        var line = document.lineAt(i).text;
        if (line.startsWith('/*  header-comment')) {
            range.start = i;
            inHeader = true;
        }
        if (line.startsWith('*/') && inHeader) {
            range.end = i;
        }
    }
    if (inHeader) {
        return range;
    } else {
        return false;
    }
}
function getFileName(document) {
    var fileInfo = document.fileName.split('\\');
    var file = fileInfo[fileInfo.length - 1].split('.')[0];
    return file;
}

function getHeaderInfo(document) {
    var config = vscode.workspace.getConfiguration("filecomment");
    if (typeof config.author == "undefined") {
        vscode.window.showErrorMessage("file-comment error:" + "please set 'filecomment.author:xxx at setting.json'");
        return false;
    }
    var file = getFileName(document);
    var date = new Date();
    var year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDay(),
        hour = date.getHours(),
        min = date.getMinutes(),
        sec = date.getSeconds();
    var time = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

    var comment = getHeaderTemplate();
    if (!comment) { return false; }
    comment = comment.template.replace("&FILE&", file).replace("&DATE&", time).replace("&AUTHOR&", config.author).replace("&LAST&", time);
    return {
        file: file,
        author: config.author,
        date: time,
        comment: comment
    }
}
function getHeaderTemplate() {
    var config = vscode.workspace.getConfiguration("filecomment");
    if (typeof config.headerTemplate == "undefined") {
        vscode.window.showErrorMessage("file-comment error:" + "please set 'filecomment.headerTemplate:xxx at setting.json'");
        return false;
    }
    var template = config.headerTemplate;
    var templateArray = template.split("\r\n");
    var startObject = new Object();
    for (var i = 0; i < templateArray.length; i++) {
        // startObject[templateArray[i].substr(2).split(":")[0].trim()] = templateArray[i].split(":")[0].trim();
        if (templateArray[i].indexOf("file") > 0) {
            startObject["file"] = templateArray[i].split(":")[0].trim();
            continue;
        }
        if (templateArray[i].indexOf("author") > 0) {
            startObject["author"] = templateArray[i].split(":")[0].trim();
            continue;
        }
        if (templateArray[i].indexOf("date") > 0) {
            startObject["date"] = templateArray[i].split(":")[0].trim();
            continue;
        }
        if (templateArray[i].indexOf("last") > 0) {
            startObject["last"] = templateArray[i].split(":")[0].trim();
            continue;
        }
    }
    return {
        template: template,
        fullArray: templateArray,
        startObject: startObject
    }
}
function addHeader() {
    var editor = vscode.editor || vscode.window.activeTextEditor;
    var document = editor._documentData._document;
    var comment = getHeaderInfo(document);
    if (!comment) { return; }
    editor.edit(function (editBuilder) {
        try {
            editBuilder.insert(new vscode.Position(0, 0), comment.comment);
        } catch (error) {
            vscode.window.showErrorMessage("file-comment error:" + error);
        }
    });
}
//当文件保存的时候，自动更新文件名onSave
function updateHeader(headerRange, _options) {
    var options = {
        file: false,
        author: false,
        date: false
    };
    if (typeof _options == "undefined") {
        options = {
            file: true,
            author: true,
            last: true
        };
    } else {
        Object.assign(options, _options);
    }
    var editor = vscode.editor || vscode.window.activeTextEditor;
    var document = editor._documentData._document;
    var header = getHeaderInfo(document);
    var template = getHeaderTemplate().startObject;
    var newHeader = {
        file: {
            range: null,
            text: null
        },
        author: {
            range: null,
            text: null
        },
        last: {
            range: null,
            text: null
        }
    }
    for (var i = headerRange.start; i < headerRange.end + 1; i++) {
        var line = document.lineAt(i).text;
        if (line.startsWith(template.file)) {
            newHeader.file.range = document.lineAt(i).range;
            newHeader.file.text = "/*  file   : " + header.file;
            continue;
        }
        if (line.startsWith(template.last)) {
            newHeader.last.range = document.lineAt(i).range;
            newHeader.last.text = "/*  last   : " + header.date;
            continue;
        }
    }
    editor.edit(function (edit) {
        if (options.file) {
            edit.replace(newHeader.file.range, newHeader.file.text);
        }
        if (options.last) {
            edit.replace(newHeader.last.range, newHeader.last.text);
        }

    });
}
