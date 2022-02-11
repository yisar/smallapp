let app = null

class _App{
    constructor(){

    }
}

export function App(option){
    app = new _App()
}

export function getApp(){
    return app
}

App() // 暂时默认执行