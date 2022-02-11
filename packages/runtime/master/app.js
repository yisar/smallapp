let app = null

class _App{
    constructor(){
        this.graph = {}
    }
}

export function App(option){
    app = new _App()
}

export function getApp(){
    return app
}

export function getInsById(id){
    return app.graph[id]
}


App() // 暂时默认执行