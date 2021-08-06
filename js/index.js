import BuildSerializers from "./build-serializers.js";
import { BuiltValue } from "./built-value.js";

let objectText = `{
    id: 1.2,
    date: "2017-07-21T10:30:34",
    date_gmt: "2017-07-21T17:30:34",
    type: "post",
    link: "https://example.com",
    title: {
        rendered: "Json 2 dart built_value converter"
    },
    tags: [
        1798,
        6298
    ],
    arrobj: [
      {name: "a", age: 12, point: [{x: 100}]},
      {name: "b", age: 14, point: [{x: 14}]}
    ]
  }`;
let jsonText = `{
    "id": 1.2,
    "date": "2017-07-21T10:30:34",
    "date_gmt": "2017-07-21T17:30:34",
    "type": "post",
    "link": "https://example.com",
    "title": {
        "rendered": "Json 2 dart built_value converter"
    },
    "tags": [
        1798,
        6298
    ],
    "arrobj": [
      {"name": "a", "age": 12, "point": [{"x": 100}]},
      {"name": "b", "age": 14, "point": [{"x": 14}]}
    ]
  }`;

function select(selectors) {
  return document.querySelector(selectors);
}

const jsobjInput = select("#jsobj");
jsobjInput.value = objectText.trim();

const jsCodeMirror = CodeMirror.fromTextArea(jsobjInput, {
  lineNumbers: true,
  mode: "javascript",
  theme: "dracula",
});

const dartCodeMirror = CodeMirror.fromTextArea(select("#built_value"), {
  lineNumbers: true,
  mode: "javascript",
  theme: "dracula",
});

const serializersCodeMirror = CodeMirror.fromTextArea(select("#serializers"), {
  lineNumbers: true,
  mode: "javascript",
  theme: "dracula",
});

select("#transform").addEventListener("click", transform);

const selectEle = select("#select");
selectEle.addEventListener("change", selectChanged);

select("#save").addEventListener("click", saveDtoStr2File);

// 点击转换按钮
// output textarea
function transform() {
  const value = jsCodeMirror.getValue().trim();
  const jsObject = JSON5.parse(value);

  const rootName = getRootName();
  dartCodeMirror.setValue(new BuiltValue(jsObject, rootName).toString().trim());
  serializersCodeMirror.setValue(
    new BuildSerializers(rootName).toString().trim()
  );
}

function getRootName() {
  return select("#classname").value.trim();
}

// input textarea
function selectChanged() {
  switch (+selectEle.value.trim()) {
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
