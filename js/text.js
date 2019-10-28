let objectText = `{
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
