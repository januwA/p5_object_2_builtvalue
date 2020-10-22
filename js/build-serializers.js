class BuildSerializers {
  constructor(rootName) {
    return new String(`
// serializers.dart

import 'package:built_collection/built_collection.dart';
import 'package:built_value/serializer.dart';
import 'package:built_value/standard_json_plugin.dart';
import '${_.snakeCase(rootName)}.dart';

part 'serializers.g.dart';

@SerializersFor([
  ${_.upperFirst(rootName)}
])
final Serializers serializers = (_$serializers.toBuilder()..addPlugin(StandardJsonPlugin())).build();

  `);
  }
}
