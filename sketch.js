const l = console.log;
let classnameInput;
let transformBtn;
let jsobjInput;
let built_valueOutput;
let selectEle;
let jsCodeMirror;
let dartCodeMirror;

let textareaObjText = `{
      id: 1.2,
      date: "2017-07-21T10:30:34",
      date_gmt: "2017-07-21T17:30:34",
      type: "post",
      link: "https://example.com",
      title: {
          "rendered": "Json 2 dart built_value converter"
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
let textareaJsonText = `{
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

function setup() {
  noCanvas();
  classnameInput = select("#classname");
  jsobjInput = select("#jsobj");
  transformBtn = select("#transform");
  built_valueOutput = select("#built_value");
  selectEle = select("#select");

  jsCodeMirror = CodeMirror.fromTextArea(jsobjInput.elt, {
    lineNumbers: true,
    mode: "javascript",
    theme: "dracula"
  });

  dartCodeMirror = CodeMirror.fromTextArea(built_valueOutput.elt, {
    lineNumbers: true,
    mode: "javascript",
    theme: "dracula"
  });

  transformBtn.mouseClicked(transform);
  selectEle.changed(selectChanged);
}

// 点击转换按钮
function transform() {
  let jsObject = getParse();
  let rootName = classnameInput.value().trim();
  let builtValue = new BuiltValue(jsObject, rootName);
  dartCodeMirror.setValue(builtValue.trim());
}

// object string or JSON
function getParse() {
  let selectvalue = selectEle.value().trim();
  let value = jsCodeMirror.getValue().trim();
  let parse;
  if (selectvalue == 1) {
    parse = new Function("return " + value)();
  } else if (selectvalue == 2) {
    parse = JSON.parse(value);
  }
  return parse;
}

function selectChanged() {
  let v = selectEle.value().trim();
  if (v == 1) {
    textareaJsonText = jsCodeMirror.getValue().trim();
    jsCodeMirror.setValue(textareaObjText);
  } else if (v == 2) {
    textareaObjText = jsCodeMirror.getValue().trim();
    jsCodeMirror.setValue(textareaJsonText);
  }
}
