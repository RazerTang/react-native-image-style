/**
 * Created by weiqingtang on 2017/8/8.
 */


var path = require('path');
var fs = require('fs')
var sizeOf = require('image-size');

/*
exclude these files
 */
const exclude_files = [
    '.DS_Store',
    '.svn',
    '.git',
    '.babelrc',
    '.js'
]
const dir = path.join(path.dirname(process.argv[1]), process.argv[2]);

var fileList = [];
/*
list all image file and insert to filelist array
@param dir the absolute directory
 */
function walk(dir) {
    if(!fs.existsSync(dir)){
        console.log("input path not exist");
        return;
    }
    var dirList = fs.readdirSync(dir);
    dirList.forEach(function (item) {
        var fileName = dir + '/' + item;
        if (fs.statSync(fileName).isFile() && (path.extname(fileName) != '' && exclude_files.indexOf(path.extname(fileName)) == -1)) {
            fileList.push(fileName);
        }
    });
    dirList.forEach(function (item) {
        var fileName = dir + '/' + item;
        if (fs.statSync(fileName).isDirectory()) {
            walk(fileName);
        }
    });
}

/*
 write uri and style to a file
 @files [] all image files
 */
function write(files,dir) {
    if(files.length ==0){
        console.log("files length is zero,no need write");
        return;
    }
    var imageFileName = path.join(dir, 'image_styles.js');
    if(fs.existsSync(path)){
        fs.unlinkSync(imageFileName);
    }
    var fd = fs.openSync(imageFileName, 'a');
    var offset = 0;
    files.forEach(function (item) {
        var dimensions = sizeOf(item);


        var relativePath = '.'+(item + dir).replace(/(.+)(.+)\1/, '$2\n').split('\n');
        relativePath = relativePath.replace(',','');

        var baseName =  relativePath.replace('./','');
        baseName =  baseName.replace('/','_');
        baseName =  baseName.replace(path.extname(baseName),'');
        baseName =  baseName.replace('-','_');


         console.log(baseName);
        var buffer = new Buffer('const '+baseName+' = {\n\
        uri:\'' +relativePath+'\',\n\
            style:{\n\
                 width:'+dimensions.width+',\n\
                 height:'+dimensions.height+'\n\
        }\n\
    }\n\
    module.exports.'+baseName+' = '+baseName+';\n\
    ');

        fs.writeSync(fd, buffer, 0, buffer.length, offset);
        offset += buffer.length;
    })
    fs.close(fd, function (err) {
    });
}

walk(dir);
write(fileList,dir);

