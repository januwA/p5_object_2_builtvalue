const l = console.log;
let classnameInput;
let jsobjInput;

let transformBtn;

let built_valueOutput;
let selectEle;
let resultObj = {};
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
  resultObj = {};
  try {
    let parse = getParse();
    let rootName = classnameInput.value().trim();
    makeResultArr(parse, rootName);
    let resultString = makeResultString(resultObj);
    resultString = addHeader(resultString);
    // l(resultString);
    dartCodeMirror.setValue(resultString.trim());
  } catch (er) {
    alert(er);
  }
}

// 制作数据
function makeResultArr(data, name) {
  if (_.isPlainObject(data)) {
    name = _.upperFirst(name);
    resultObj[name] = {};
    resultObj[name]["keys"] = [];
    for (let k in data) {
      let v = data[k];
      let type = typeof v;
      if (type === "object") {
        if (_.isNull(v)) {
          // null
          let dartType = createDartType(v);
          resultObj[name]["keys"].push(
            new BuiltValueAttr(k, makeBuiltValueAttr(dartType, k))
          );
        } else if (_.isArray(v)) {
          // array
          if (_.isEmpty(v)) return alert("array is empty!");
          // value is array
          // get type of first a value
          let firstv = _.first(v);
          if (typeof firstv !== "object") {
            // string, number, boolean
            let dartType = createDartType(firstv);
            resultObj[name]["keys"].push(
              new BuiltValueAttr(k, makeBuiltValueAttr(dartType, k, true))
            );
          } else {
            let dartType = _.upperFirst(k + "Dto");
            resultObj[name]["keys"].push(
              new BuiltValueAttr(k, makeBuiltValueAttr(dartType, k, true))
            );
            makeResultArr(firstv, k + "Dto");
          }
        } else if (_.isPlainObject(v)) {
          // object
          let dartType = _.upperFirst(k + "Dto");
          resultObj[name]["keys"].push(
            new BuiltValueAttr(k, makeBuiltValueAttr(dartType, k))
          );
          makeResultArr(v, k + "Dto");
        }
      } else {
        // string, number, boolean, undefined
        let dartType = createDartType(v);
        resultObj[name]["keys"].push(
          new BuiltValueAttr(k, makeBuiltValueAttr(dartType, k))
        );
      }
    }
  } else {
    return alert("value is not plain object");
  }
}

// 制作string
function makeResultString(obj) {
  let resultString = ``;
  for (const k in obj) {
    let v = obj[k];

    let attrs = ``;
    for (const key of v.keys) {
      attrs += key["rs"];
    }

    resultString += `
/// ${k}
abstract class ${k} implements Built<${k}, ${k}Builder> {
  ${k}._();

  factory ${k}([updates(${k}Builder b)]) = _$${k};
  ${attrs}

  String toJson() {
    return jsonEncode(serializers.serializeWith(${k}.serializer, this));
  }

  static ${k} fromJson(String jsonString) {
    return serializers.deserializeWith(
        ${k}.serializer, jsonDecode(jsonString));
  }

  static Serializer<${k}> get serializer => _$${_.lowerFirst(k)}Serializer;
}\r\n`;
  }
  return resultString;
}

// make built_value attr
function makeBuiltValueAttr(dartType, k, isList = false) {
  return !isList
    ? `${dartType == "Null" ? "\r\n  @nullable" : ""}
  @BuiltValueField(wireName: '${k}')
  ${dartType} get ${_.camelCase(k)};
`
    : `
  @BuiltValueField(wireName: '${k}')
  BuiltList<${dartType}> get ${_.camelCase(k)};
`;
}

// file header
function addHeader(resultString) {
  let name = classnameInput.value().trim();
  name = _.snakeCase(name);
  let header = `
library ${name};

import 'dart:convert';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part '${name}.g.dart';
  `;

  return header + resultString;
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

// dart type
function createDartType(v) {
  let dartType = "";
  if (_.isInteger(v)) {
    dartType = "int";
  } else if (_.isString(v)) {
    dartType = "String";
  } else if (_.isBoolean(v)) {
    dartType = "bool";
  } else if (_.isNull(v) || _.isUndefined(v)) {
    dartType = "Null";
  } else {
    dartType = "double";
  }
  return dartType;
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

class BuiltValueAttr {
  constructor(k, resultValue) {
    this.k = k;
    this.rs = resultValue;
  }
}
