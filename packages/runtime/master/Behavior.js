export function Behavior(option) {
    return option
}

export function walkBehaviors(behaviors, comp) {
    for (let i = 0; i < behaviors.length; i++) {
        const behavior = behaviors[i]
        if (behavior.lifetimes) { // 入栈
            comp.lifecycles.attached.unshift(behavior.lifetimes.attached)
            comp.lifecycles.detached.unshift(behavior.lifetimes.detached)
        }
        if (behavior.data) { // 合并
            comp.data = { ...comp.data, ...behavior.data }
        }
        if (behavior.propertits) { // 合并
            comp.propertits = { ...comp.propertits, ...behavior.propertits }
        }
        if (behavior.methods) { // 覆盖
            for (const key in behavior.methods) {
                comp.methods[key] = behavior.methods[key]
            }
        }
        if (behavior.behaviors) { // 递归
            walkBehaviors(behavior.behaviors, comp)
        }
    }
}