var fs = require("fs");

const fileOrDir = (name) => {
  if (name.indexOf(".") > -1) {
    return "file";
  } else {
    return "dir";
  }
};

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const jsOrCSS = (name) => {
  if (name.indexOf(".js") > -1) {
    return "js";
  } else if (name.indexOf(".css") > -1) {
    return "css";
  } else {
    return "none";
  }
};

const readFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return data;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const listFiles = (dirPath) => {
  try {
    const arrayOfFiles = fs.readdirSync(dirPath);
    return arrayOfFiles;
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const preprocess = (cssPath, jsPath) => {
  const componentName = cssPath.substring(
    cssPath.lastIndexOf("/") + 1,
    cssPath.length - 4
  );
  const componentTag = componentName + getRandomNumber(1,10000000);
  console.log(readFile(cssPath));
  console.log(readFile(jsPath));
};

if (!fs.existsSync("./src")) {
  console.log("no src directory!");
  process.exit(1);
}

let fileMap = { "./src": [] };

const process = (dirPath) => {
  let tempArr = listFiles(dirPath);
  tempArr.forEach((elem, index) => {
    if (fileOrDir(elem) == "file") fileMap[dirPath].push(elem);
    else if (fileOrDir(elem) == "dir") {
      fileMap[dirPath + "/" + elem] = [];
      process(dirPath + "/" + elem);
    }
  });
};
process("./src");

fileArray = [];
cssFileArray = [];
Object.values(fileMap).forEach((elem, index) => {
  fileArray = fileArray.concat(elem);
});

fileArray.forEach((elem, index) => {
  if (jsOrCSS(elem) == "css")
    cssFileArray.push(elem.substring(0, elem.length - 4));
});

let coupletArray = [];
cssFileArray.forEach((elem, index) => {
  const keys = Object.keys(fileMap);
  let couplet = [];
  keys.forEach((el, ind) => {
    if (couplet.length != 2) {
      if (fileMap[el].includes(elem + ".js"))
        couplet.push(el + "/" + elem + ".js");
      if (fileMap[el].includes(elem + ".css"))
        couplet.push(el + "/" + elem + ".css");
    }
  });
  if (couplet.length == 2) coupletArray.push(couplet);
});

console.log(coupletArray);
console.log("EOP");
