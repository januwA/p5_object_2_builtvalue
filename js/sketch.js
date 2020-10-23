// root name
let rootNameInput;

// button
let transformBtn;

// input
let jsobjInput;

// output
let built_valueOutput;
let serializersOutput;

// select
let selectEle;

let saveBtn;

// editor
let jsCodeMirror;
let dartCodeMirror;
let serializersCodeMirror;

function setup() {
  noCanvas();
  rootNameInput = select("#classname");
  jsobjInput = select("#jsobj").value(objectText.trim());
  transformBtn = select("#transform");
  built_valueOutput = select("#built_value");
  serializersOutput = select("#serializers");
  selectEle = select("#select");
  saveBtn = select("#save");

  jsCodeMirror = CodeMirror.fromTextArea(jsobjInput.elt, {
    lineNumbers: true,
    mode: "javascript",
    theme: "dracula",
  });

  dartCodeMirror = CodeMirror.fromTextArea(built_valueOutput.elt, {
    lineNumbers: true,
    mode: "javascript",
    theme: "dracula",
  });

  serializersCodeMirror = CodeMirror.fromTextArea(serializersOutput.elt, {
    lineNumbers: true,
    mode: "javascript",
    theme: "dracula",
  });

  transformBtn.mouseClicked(transform);
  selectEle.changed(selectChanged);
  saveBtn.mouseClicked(saveDtoStr2File);
}

// 点击转换按钮
// output textarea
function transform() {
  const value = jsCodeMirror.getValue().trim();
  const jsObject = JSON5.parse(value);

  const rootName = getRootName();
  dartCodeMirror.setValue(new BuiltValue(jsObject, rootName).toString().trim());
  serializersCodeMirror.setValue(new BuildSerializers(rootName).toString().trim());
}

function getRootName() {
  return rootNameInput.value().trim();
}

// input textarea
function selectChanged() {
  switch (+selectEle.value().trim()) {
    case 1:
      jsonText = jsCodeMirror.getValue().trim();
      jsCodeMirror.setValue(objectText);
      break;
    case 2:
      objectText = jsCodeMirror.getValue().trim();
      jsCodeMirror.setValue(jsonText);
      break;

    default:
      break;
  }
}

// save output to file.
async function saveDtoStr2File() {
  if (!window.showDirectoryPicker) {
    return alert("not showDirectoryPicker API");
  }

  let dtoText = dartCodeMirror.getValue().trim();
  let serializersText = serializersCodeMirror.getValue().trim();

  if (!dtoText || !serializersText) {
    return alert("not data. to click transform button.");
  }

  let saveDirName = getRootName();
  let dtoFileName = _.snakeCase(saveDirName) + ".dart";
  let serializersFileName = "serializers.dart";

  // 获取目录句柄
  const hDir = await window.showDirectoryPicker();

  // 创建新目录，如果存在直接覆盖
  const hNewDir = await hDir.getDirectoryHandle(saveDirName, {
    create: true,
  });

  // dto文件
  let hNewFile = await hNewDir.getFileHandle(dtoFileName, {
    create: true,
  });
  let w$ = await hNewFile.createWritable();
  await w$.write(dtoText);
  await w$.close();

  // serializers文件
  hNewFile = await hNewDir.getFileHandle(serializersFileName, {
    create: true,
  });
  w$ = await hNewFile.createWritable();
  await w$.write(serializersText);
  await w$.close();
}
