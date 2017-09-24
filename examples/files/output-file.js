function hi() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Bo';
      var age = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '18';
      return console.log('hi there, it is ' + name + ' I am ' + age);
}