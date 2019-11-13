import { diff,h } from '../ignore/vdom'

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
    {[3, 1, 2].map(i => (
        <li>{i}</li>
      ))}
    </ul>
  </div>
)

const patches = diff(node1,node2)
console.log(patches)