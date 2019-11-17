import { GIF, FileType, GIFCache } from "./GIF";

const { ccclass, property, requireComponent, disallowMultiple, executeInEditMode } = cc._decorator;


/**
 * native版gif支持
 */
@ccclass
@executeInEditMode
@disallowMultiple
@requireComponent(cc.Sprite)
export default class GIFSprite extends cc.Component {

    @property({ visible: false })
    private _path: cc.RawAsset = null;

    @property({ type: cc.Asset })
    get path() { return this._path; }
    set path(path: cc.RawAsset) {
        if (path == null) return;
        this._path = path;
        this.innerPath = path.toString()
        this.clear();
        this.applayChange();
    }

    public sprite: cc.Sprite = null;
    public _inited: boolean;
    private _length: number = 0;
    private _action: cc.ActionInterval;
    private _delays: Array<number>;
    private _index: number = 0;
    private _spriteFrames: Array<cc.SpriteFrame>;
    _positions: Array<cc.Vec2>
    //本地路径
    private innerPath: string

    /**
     * 图片显示最宽
     */
    @property(Number)
    private maxWith = 0;

    /**
     * 图片显示最高
     */
    @property(Number)
    private maxHeight = 0;

    /**
     * 是否停留在第一帧
     */
    @property(Boolean)
    private stayAtFirstFrame = false;

    /**
     * 固定新图片高度与默认图一样高
     */
    @property(Boolean)
    private fitHeight = true;

    /**
     * 固定新图片宽度与默认图一样宽
     */
    @property(Boolean)
    private fitWidth = true;

    public setInnerPath(path: string) {
        this.innerPath = path
        this.clear();
        this.applayChange();
    }

    protected onLoad() {
        this.sprite = this.node.getComponent(cc.Sprite);
        if (CC_EDITOR) {
            if (this.maxWith == 0)
                this.maxWith = this.node.width;

            if (this.maxHeight == 0)
                this.maxHeight = this.node.height;
        }

        
    }

    protected start() {
        if(this.path){
            this.setInnerPath(this.path.toString())
        }
    }

    // protected update(dt) {
    // }
    // onDestroy() {

    // }

    public setDefaultSpriteFrame(spriteFrame: cc.SpriteFrame) {
        let size = spriteFrame.getOriginalSize()
        var scale = 0
        var width = 0
        var height = 0
        if (this.fitHeight && !this.fitWidth) {
            //固定高缩放，按高的比例缩放到默认图片大小
            scale = this.maxHeight / size.height
            width = scale * size.width
            height = this.maxHeight
        } else if (!this.fitHeight && this.fitWidth) {
            //固定宽缩放，按宽的比例缩放到默认图片大小
            scale = this.maxWith / size.width
            width = this.maxWith
            height = scale * size.height
        } else {
            /**
             * 宽高比来缩放图片
             * scale 大于1横向 否则是竖向 图片
             * 默认图片scale大于新图片scale时，新图片按高的比例缩放到默认图片大小
             * 默认图片scale小于新图片scale时，新图片按宽的比例缩放到默认图片大小
             */
            let defaultWidthHeightScale = this.maxWith / this.maxHeight
            let newWidthHeightScale = size.width / size.height
            if (defaultWidthHeightScale > newWidthHeightScale) {
                scale = this.maxHeight / size.height
                width = scale * size.width
                height = this.maxHeight
            } else {
                scale = this.maxWith / size.width
                width = this.maxWith
                height = scale * size.height
            }

        }
        this.node.setContentSize(cc.size(width, height))
        this.sprite.spriteFrame = spriteFrame
    }

    /**
     * 初始化完成
     */
    inited() {
        this._index++
        if (this._index >= this._spriteFrames.length) {
            this._index = 0
        }
        let sp = this._spriteFrames[this._index];
        this.sprite.spriteFrame = sp;

        let delay = this._delays[this._index]
        if (!delay || delay < 0.01) {
            delay = 0.06
        } else {
            delay = delay * 0.01
        }

        this.scheduleOnce(() => {
            this.inited()
        }, delay)
    }


    /**
     * 文件类型
     */
    private getType(): FileType {
        let format = FileType.UNKNOWN
        if (CC_JSB) {
            if(this.innerPath.indexOf("/") == 0){
                let buffer = jsb.fileUtils.getDataFromFile(this.innerPath)
                let hexString = GIF.bytes2HexString(buffer.slice(0, 50))
                format = GIF.detectFormat(hexString)
            }

        }

        return format
    }

    /**
     * 应用更改
     * 判断文件类型，通过文件列席，是否用gif解析加载
     */
    private applayChange() {
        let gifCache = GIFCache.getInstance()
        let callback = (error, data) => {
            if (error) {
                cc.error("gif图片加载失败")
                return
            }
            if (data instanceof cc.Texture2D) {
                this.setDefaultSpriteFrame(new cc.SpriteFrame(data))
            } else {
                this._delays = data.delays;
                this._spriteFrames = data.spriteFrames;
                this._spriteFrames = data.spriteFrames;
                this._positions = data.positions
                this.setDefaultSpriteFrame(data.spriteFrames[0])
                if (!this.stayAtFirstFrame) {
                    // this.inited();
                    this.scheduleOnce(() => {
                        this.inited()
                    }, 0.1)
                }
                this._inited = true;
                gifCache.addItemFrame(this.innerPath, data)
            }
        }

        let format = FileType.UNKNOWN
        let item = gifCache.get(this.innerPath)
        if (item) {
            format = item.type
        } else {
            format = this.getType()
            gifCache.addItemType(this.innerPath, format)
        }

        if (format == FileType.GIF) {
            if (gifCache.hasFrame(this.innerPath)) {
                callback(null, item.frameData)
            } else {
                cc.loader.load({ url: this.innerPath, type: 'gif' }, callback)
            }
        } else {
            cc.loader.load(this.innerPath, callback)
        }

    }

    /**
     * 清空数据
     */
    private clear() {
        this.node.stopAllActions();
        this._index = 0;
        this._inited = null;
        this._delays = null;
        this._spriteFrames = null;
        this.unscheduleAllCallbacks()
    }

}


/**
 * GIFMessage消息传递接口
 */
export interface GIFMessage {
    target: GIFSprite,
    buffer: ArrayBuffer,
    initOneSpriteFrameFunc: {
        (
            data: {
                delays: Array<number>,
                spriteFrames: Array<cc.SpriteFrame>,
                length: number
            }
        )
    },
    initFinishedFunc: {
        (
            data: {
                delays: Array<number>,
                spriteFrames: Array<cc.SpriteFrame>,
                length: number
            }
        )
    }

}