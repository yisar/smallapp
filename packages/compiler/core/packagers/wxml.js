const { titleCase } = require('./util')

module.exports = async function packWxml(asset) {
  const walk = async (child) => {
    for (const dep of child.childAssets.values()) {
      wiredBlock(dep.blocks, asset)
      if (dep.childAssets.size) {
        await walk(dep)
      }
    }
  }
  asset.out = ''
  wiredBlock(asset.blocks, asset)
  walk(asset)
  const code =
    asset.parent.type === 'page'
      ? `export default (props) => {
    const [state, setState] = fre.useState(props.data)
    fre.useEffect(()=>{
      window.components[${asset.parent.id}] = (data) => setState(data)
      $mount(${asset.parent.id})
      return () => $unmount(${asset.parent.id})
    },[])
      return <>${asset.out}</>
  };\n`
      : `const ${titleCase(asset.parent.tag)} = (props) =>{
    const [state, setState] = fre.useState({})
    fre.useEffect(()=>{
      window.components[${asset.parent.id}] = (data) => setState(data)
      $mount(${asset.parent.id})
      return () => $unmount(${asset.parent.id})
    },[])
      return <>${asset.out}</>
  };`

  return code
}

function wiredBlock(blocks, asset) {
  for (let key in blocks) {
    let value = blocks[key]
    if (isNaN(+key)) {
      asset.out = asset.out.replace(`$template$${key}$`, value).replace(`$slot$${key}$`, value) || ''
    } else {
      asset.out += value || ''
    }
  }
}
