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

function setup() {
  noCanvas();
  classnameInput = select('#classname');
  jsobjInput = select('#jsobj').value(objectText.trim());
  transformBtn = select('#transform');
  built_valueOutput = select('#built_value');
  serializersOutput = select('#serializers');
  selectEle = select('#select');

  jsCodeMirror = CodeMirror.fromTextArea(jsobjInput.elt, {
    lineNumbers: true,
    mode: 'javascript',
    theme: 'dracula',
  });

  dartCodeMirror = CodeMirror.fromTextArea(built_valueOutput.elt, {
    lineNumbers: true,
    mode: 'javascript',
    theme: 'dracula',
  });

  serializersCodeMirror = CodeMirror.fromTextArea(serializersOutput.elt, {
    lineNumbers: true,
    mode: 'javascript',
    theme: 'dracula',
  });

  transformBtn.mouseClicked(transform);
  selectEle.changed(selectChanged);
}

// 点击转换按钮
function transform() {
  let jsObject = getParse();
  let rootName = classnameInput.value().trim();

  dartCodeMirror.setValue(new BuiltValue(jsObject, rootName).trim());
  serializersCodeMirror.setValue(new BuildSerializers(rootName).trim());
}

// object string or JSON
function getParse() {
  let selectvalue = selectEle.value().trim();
  let value = jsCodeMirror.getValue().trim();
  let parse;
  if (selectvalue == 1) {
    parse = new Function('return ' + value)();
  } else if (selectvalue == 2) {
    parse = JSON.parse(value);
  }
  return parse;
}

function selectChanged() {
  let v = selectEle.value().trim();
  if (v == 1) {
    jsonText = jsCodeMirror.getValue().trim();
    jsCodeMirror.setValue(objectText);
  } else if (v == 2) {
    objectText = jsCodeMirror.getValue().trim();
    jsCodeMirror.setValue(jsonText);
  }
}
