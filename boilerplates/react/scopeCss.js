fs = require("fs");
css = require("css");

if (!fs.existsSync("./src/compiledCSS")) {
  fs.mkdirSync("./src/compiledCSS");
}

if (!fs.existsSync("./src/compiledJSX")) {
  fs.mkdirSync("./src/compiledJSX");
}

const readFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return data;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const writeToFile = (filePath, content) => {
  try {
    const data = fs.writeFileSync(filePath, content);
  } catch (err) {
    console.error(err);
  }
};

const reverseString = (str) => {
  return str === "" ? "" : reverseString(str.substr(1)) + str.charAt(0);
};

const scopeCSS = (cssPath, tag) => {
  let input = readFile(cssPath);
  let obj = css.parse(input);
  let sheet = obj.stylesheet;

  sheet.rules.forEach((rule, index) => {
    let rs = [];
    if (rule.selectors) {
      rule.selectors.forEach((s, ind) => {
        rs.push("." + tag + " " + s);
      });
    }
    rule.selectors = rs;
  });

  return css.stringify(obj);
};

function isBalanced(expr) {
  let stack = [];
  for (let i = 0; i < expr.length; i++) {
    let x = expr[i];
    let brackets = "[](){}'\"`";
    let brack = brackets.indexOf(x);
    if (brack == -1) continue;
    if (
      brack < brackets.indexOf("'") &&
      !(brackets.indexOf(stack[stack.length - 1]) < brackets.indexOf("'"))
    )
      continue;
    if (brack < brackets.indexOf("'")) {
      if (brack % 2 == 0) {
        stack.push(x);
        continue;
      }

      let check;
      check = brackets.indexOf(stack.pop());
      if (check != brack - 1) return false;
    } else {
      if (brackets.indexOf(stack[stack.length - 1]) < brackets.indexOf("'"))
        stack.push(x);
      else {
        let check;
        check = brackets.indexOf(stack.pop());
        if (check != brack) return false;
      }
    }
  }

  return stack.length == 0;
}

const scopeJSX = (jsPath, tag) => {
  let elemName = "Assets";
  let text = readFile(jsPath);
  let regex = new RegExp(`${elemName}.*{`);
  let start = text.search(regex);
  let end;
  start += text.substring(start, text.length - start).indexOf("{") + 1;
  for (let i = start; i < text.length; i++) {
    if (isBalanced(text.substring(start, i))) {
      if (text.substring(i, i + 6) == "return") {
        start = i;
        break;
      }
    }
  }
  start += text.substring(start, start + 30).indexOf("(") + 1;

  end = text.lastIndexOf(");");

  let code = text.substring(start, end);
  let point = code.search(/className.*=.*['"`]/g);
  point += code.substring(point, code.length).search(/['"`]/g) + 1;
  code =
    code.substring(0, point) + tag + " " + code.substring(point, code.length);
  text = text.substring(0, start) + code + text.substring(end, text.length);
  return text;
};

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

const listFiles = (dirPath) => {
  try {
    const arrayOfFiles = fs.readdirSync(dirPath);
    return arrayOfFiles;
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const preprocess = (el) => {
  let cssPath;
  let jsPath;
  if (jsOrCSS(el[0]) == "js") {
    cssPath = el[1];
    jsPath = el[0];
  } else if (jsOrCSS(el[0]) == "css") {
    cssPath = el[0];
    jsPath = el[1];
  } else {
    return;
  }
  const componentName = cssPath.substring(
    cssPath.lastIndexOf("/") + 1,
    cssPath.length - 4
  );
  if (componentName == "index") return;
  const componentTag = componentName + getRandomNumber(1, 10000000);
  const newCSS = scopeCSS(cssPath, componentTag);
  const newJS = scopeJSX(jsPath, componentTag);
  writeToFile("./src/compiledCSS/"+componentName+".css", newCSS);
  writeToFile("./src/compiledJSX/"+componentName+".js", newJS);
  console.log(componentName);
};

if (!fs.existsSync("./src")) {
  console.log("no src directory!");
  process.exit(1);
}

let fileMap = { "./src": [] };

const process = (dirPath) => {
  if (dirPath == "./src/compiledCSS") return;
  if (dirPath == "./src/compiledJSX") return;
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

let fileArray = [];
let cssFileArray = [];
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

coupletArray.forEach((elem, index) => {
  preprocess(elem);
});

