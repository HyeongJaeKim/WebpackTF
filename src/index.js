require('./index.css');
require('./test.scss');


var el = document.createElement('div');
document.body.appendChild(el);

el.className = 'hello';

console.log('hello', el);
