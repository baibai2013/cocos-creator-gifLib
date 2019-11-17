import { GIFCache } from "./lib/gif/GIF";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {



    onLoad(){
        GIFCache.getInstance()
    }

    start () {
        // init logic

        this.scheduleOnce(()=>{
            cc.director.loadScene('fff');
        },5)
    }
}
