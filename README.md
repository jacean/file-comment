# file-comment README

给js文件添加文件头
```
/*  header-comment
/*  file   : aaa
/*  author : jacean
/*  date   : 2017-1-1 16:20:22
/*  last   : 2017-1-1 18:17:28
*/
```
## Features

vscode启动后，当打开js文件时插件自动启动
插入注释方法:
1. 当执行命令*add header* 
2. ctrl+alt+h

## Requirements


## Extension Settings

This extension contributes the following settings:

* `filecomment.author`: "jacean",
* `filecomment.headerTemplate`: "/*  header-comment\r\n/*  file   : &FILE&\r\n/*  author : &AUTHOR&\r\n/*  date   : &DATE&\r\n/*  last   : &LAST&\r\n*/\r\n"

## Known Issues


## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

第一版，完成基本功能.
- 添加文件头，包括:file,author,date,last
- 保存文件时更新file(避免code之外更改文件名造成不匹配)和last
- 绑定快捷键ctrl+alt+h实现文件头快速插入

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

-----------------------------------------------------------------------------------------------------------
