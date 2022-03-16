const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const exec = require('child_process').execSync;

try {

    if (!fs.existsSync(".github/package-info.yml")){
        console.log("::error file=prepare-package.js::'package-info.yml' not found, cannot proceed");
        return;
    }
    else
    {
        let fileContents = fs.readFileSync('.github/package-info.yml', 'utf8');
        let data = yaml.load(fileContents);

        if(!data['package-name'] || !data['visual-name']) {
            console.log("::error file=prepare-package.js::'package-name' or 'visual-name' missing from 'package-info.yml' not found, cannot proceed");
        }
        
        console.log('::set-output name=PACKAGE_NAME::' + data['package-name']);
        console.log('::set-output name=VISUAL_NAME::' + data['visual-name']);

        if(!data['destination-folder'] || !data['extra-generated-meta']) {
            console.log("Extra folders not found, using the root");
            return;
        }
        console.log("Using folder: " + data['destination-folder']);

        var files=fs.readdirSync("tmp");

        fs.mkdirSync("tmp/" + data['destination-folder'], { recursive: true });

        data['extra-generated-meta'].forEach(element => {
            fs.mkdirSync("tmp/" + element.path, { recursive: true });
            fs.writeFileSync("tmp/" + element.path + ".meta", "fileFormatVersion: 2\nguid: " + element.guid + "\nfolderAsset: yes\nDefaultImporter:\n  externalObjects: {}\n  userData: \n  assetBundleName: \n  assetBundleVariant: ");
        });

        for(var i=0;i<files.length;i++){
            if(!path.basename(files[i]).startsWith(".")) {
                fs.moveSync("tmp/" + files[i], "tmp/" + data['destination-folder'] + "/" + files[i], function (err) {
                    if (err) throw err
                    console.log('moved files')
                });
            }
        }
    }
} catch (e) {
    console.log(e);
}