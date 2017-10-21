function traverser (ast, visitor) {

  function traverseArray(array, parent) {
    array.forEach((node) => {
      traverseNode(node, parent);
    });
  }

  function traverseNode (node, parent) {

    let methods = visitor[node.type];
    if (methods && methods.enter) {
      methods.enter(node, parent);
    }


    switch (node.type) {
      case 'Program':
        traverseArray(node.body, node);
        break;
      case 'FunctionDeclaration':
        traverseArray(node.params, node);
        break;
      case 'BlockStatement':
        traverseArray(node.body, node);
        break;
      case 'CallExpression':
        traverseArray(node.arguments, node);
        break;
      case 'ReturnStatement':
      case 'Identifier':
      case 'AssignmentPattern':
      case 'MemberExpression':
      case 'Literal':
      case 'BinaryExpression':
        break;
      default:
        throw new TypeError('invalid type: ', node.type);
    }

    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  traverseNode(ast, null);

}

module.exports = traverser;