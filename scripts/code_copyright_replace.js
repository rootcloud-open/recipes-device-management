/*
* Licensed Materials - Property of ROOTCLOUD
* THIS MODULE IS "RESTRICTED MATERIALS OF ROOTCLOUD"
* (c) Copyright ROOTCLOUD Inc. 2020 All Rights Reserved
*
* The source code for this program is not published or
* otherwise divested of its trade secrets
*/

const glob = require("glob");
const fs = require("fs");

const fileFolders = ['pages', 'utils'];

fileFolders.forEach(fileFolder => {
  addCodeCopyright(fileFolder, 'js');
  addCodeCopyright(fileFolder, 'wxss');
});

function addCodeCopyright(fileFolder, fileExtension) {
  if(fileFolder && fileExtension) {
    glob(`./${fileFolder}/**/*.${fileExtension}`, {
      nodir: true
    }, function (err, files) {
      console.log('glob err: ' + err);
      if (files && files.length) {
        files.forEach(file => {
          let data = fs.readFileSync(file, 'utf8');
          const copyrightData = `/*
* Licensed Materials - Property of ROOTCLOUD
* THIS MODULE IS "RESTRICTED MATERIALS OF ROOTCLOUD"
* (c) Copyright ROOTCLOUD Inc. 2020 All Rights Reserved
*
* The source code for this program is not published or
* otherwise divested of its trade secrets
*/

` + data;
          if(data.indexOf('Copyright ROOTCLOUD') === -1) {
            fs.writeFileSync(file, copyrightData);
          }
        });
        console.log('代码版权批量添加完成');
      }
    });
  }
}
