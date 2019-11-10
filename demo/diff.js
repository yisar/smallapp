import { h,diff, patch, render } from '../ignore/vdom'

let node1 = (
  <div>
    <ul>
      {[1, 2, 3].map(i => (
        <li>{i}</li>
      ))}
    </ul>
  </div>
)

let node2 = (
  <div className="test">
    <ul>
      {[...Array(1000).keys()].map(i => (
        <li>{i}</li>
      ))}
    </ul>
  </div>
)

render(node1, '#app')

document.querySelector('.btn').onclick = () => {
  const patches = diff(node1, node2)
  console.log(patches)
  patch('#app', patches)
}