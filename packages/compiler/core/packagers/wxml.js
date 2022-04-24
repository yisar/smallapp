const { titleCase } = require('./util')

module.exports = async function packWxml(asset) {
  // const walk = async (child) => {
  //   for (const dep of child.childAssets.values()) {
      // wiredBlock(dep.blocks, asset)
  //     if (dep.childAssets.size) {
  //       await walk(dep)
  //     }
  //   }
  // }
  asset.out = asset.code
  // wiredBlock(asset.blocks, asset)
  // walk(asset)
  const code =
    asset.parent.type === 'page'
      ? `export default (props) => {
    const [state, setState] = fre.useState(props.data)
    useEffect(()=>{
      setStates[${asset.parent.id}] = setState
    },[]);
      while(state){
        return <>${asset.out}</>
      }
  };\n`
      : `comp.${titleCase(asset.parent.tag)} = (props) =>{
    const [state, setState] = fre.useState({})
    useEffect(()=>{
      setStates[${asset.parent.id}] = setState
    },[]);
      while({...props,...state}){
        return <>${asset.out}</>
      }
  };\n`

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
