function codeGenerator(node) {
  
  switch (node.type) {
    case 'Program':
      return node.body.map(codeGenerator).join('\n');

    case 'FunctionDeclaration':
      return `function ${codeGenerator(node.id)} (${node.params.map(codeGenerator).join('\n')}) ${codeGenerator(node.body)}`;

    case 'AssignmentPattern':
      return `${codeGenerator(node.left)} = ${codeGenerator(node.right)}`;
    
    case 'BlockStatement':
      return `{ 
        ${node.body.map(codeGenerator).join('\n')} 
      }`;

    case 'VariableDeclaration':
      return `${node.kind} ${node.declarations.map(codeGenerator).join('\n')}`;

    case 'VariableDeclarator':
      return `${codeGenerator(node.id)} = ${codeGenerator(node.init)}`;

    case 'ConditionalExpression':
      return `${codeGenerator(node.test)} ? ${codeGenerator(node.consequent)} : ${codeGenerator(node.alternate)};`;

    case 'MemberExpression':
      let str;
      if (node.property.type === 'Literal') {
        str = `${codeGenerator(node.object)}[${codeGenerator(node.property)}]`;
      } else if (node.property.type === 'Identifier') {
        str = `${codeGenerator(node.object)}.${codeGenerator(node.property)}`;
      }
      return str;

    case 'Identifier':
      return `${node.name}`;
    
    case 'Literal':
      return `${node.raw}`;

    case 'LogicalExpression':
      return `${codeGenerator(node.left)} ${node.operator} ${codeGenerator(node.right)}`;

    case 'BinaryExpression':
      return `${codeGenerator(node.left)} ${node.operator} ${codeGenerator(node.right)}`;

    case 'ReturnStatement':
      return `return ${codeGenerator(node.argument)};`;

    case 'CallExpression':
      return `${codeGenerator(node.callee)}(${node.arguments.map(codeGenerator).join('\n')})`

    default:
      throw new TypeError('invalid node type: ', node.type);
  }

}

module.exports = codeGenerator;