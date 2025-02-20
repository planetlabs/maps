import {list} from 'virtual:directory-listing';

const element = document.getElementById('list');

list.forEach(item => {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = `./cases/${item}/`;
  a.textContent = item;
  li.appendChild(a);
  element.appendChild(li);
});
