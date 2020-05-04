const l = console.log;
// root name
let classnameInput;

// button
let transformBtn;

// input
let jsobjInput;

// output
let built_valueOutput;
let serializersOutput;

// select
let selectEle;

// editor
let jsCodeMirror;
let dartCodeMirror;
let serializersCodeMirror;

// root dto name
let ROOtNAME;

function setup() {
  noCanvas();
  classnameInput = select("#classname");
  jsobjInput = select("#jsobj").value(objectText.trim());
  transformBtn = select("#transform");
  built_valueOutput = select("#built_value");
  serializersOutput = select("#serializers");
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

  serializersCodeMirror = CodeMirror.fromTextArea(serializersOutput.elt, {
    lineNumbers: true,
    mode: "javascript",
    theme: "dracula"
  });

  transformBtn.mouseClicked(transform);
  selectEle.changed(selectChanged);
}

// 点击转换按钮
function transform() {
  const value = jsCodeMirror.getValue().trim();
  const jsObject = JSON5.parse(value);
  ROOtNAME = classnameInput.value().trim();

  dartCodeMirror.setValue(new BuiltValue(jsObject, ROOtNAME).trim());
  serializersCodeMirror.setValue(new BuildSerializers(ROOtNAME).trim());
}

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
