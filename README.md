# cocos creator gifLib
cocos creator gifLib 是一个cocos支持gif的库

cocos creator 版本2.0.10 （不保证其他版本支持哟）
效果如下

![image](https://github.com/baibai2013/cocos-creator-gifLib/blob/master/1.gif)
![image](https://github.com/baibai2013/cocos-creator-gifLib/blob/master/2.gif)

主要是添加 添加 cc.loader.load 支持gif加载，原生平台和web平台都可以解析了

```
cc.loader.addDownloadHandlers({ "gif": cc.loader.downloader["extMap"].binary });
cc.loader.addLoadHandlers({
     "gif": function (item, callback) {
        let gif = new GIF();
         gif.handle(item, callback)
     }
})
```

## 用法：

![image](https://github.com/baibai2013/cocos-creator-gifLib/blob/master/3.png)

1. giflib添加到工程里

![image](https://github.com/baibai2013/cocos-creator-gifLib/blob/master/5.png)

2. 在启动场景添加如下代码，主要是注册gif解析器。这样可以在下一个场景中用到gif解析啦
```
  onLoad(){
        GIFCache.getInstance()
 }
```

3. 在需要用到的节点上添加 GIFSprite Componet，把GIFSprite从资源管理器中拖到属性检查器中便可

![image](https://github.com/baibai2013/cocos-creator-gifLib/blob/master/4.png)

4. 设置gif路径和宽还有高度

## 设置：
* stayAtFirstFrame： 可以让gif停到第一帧 
* fitHeight：固定图片高与maxHeight一样高，否则与加载的gif一样高
* fitWidth：固定图片宽与maxWith一样宽，否则与加载的gif一样宽

是否添加到GIFCache中看项目中需求了






