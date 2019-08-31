// モジュール
const OverlapTester = require( './OverlapTester.js' );

// ゲームオブジェクトクラス
// ・タンク、壁、弾丸の親クラス
module.exports = class GameObject
{
    // コンストラクタ
    constructor( fWidth, fHeight, fX, fY, fAngle )
    {
        this.fWidth = fWidth;	// 幅
        this.fHeight = fHeight;	// 高さ
        this.fX = fX;	// 位置(X)
        this.fY = fY;	// 位置(Y)
        this.fAngle = fAngle;	// 向き（+x軸の方向が0。+y軸の方向がPI/2）

        this.rectBound = {};

        this.setPos( fX, fY );
    }

    toJSON()
    {
        return {
            fX: this.fX,
            fY: this.fY,
            fAngle: this.fAngle
        };
    }

    setPos( fX, fY )
    {
        this.fX = fX;
        this.fY = fY;
        this.rectBound = {
            fLeft: fX - this.fWidth * 0.5,
            fBottom: fY - this.fHeight * 0.5,
            fRight: fX + this.fWidth * 0.5,
            fTop: fY + this.fHeight * 0.5
        };
    }

    // 壁との干渉チェック
    overlapWalls( setWall )
    {
        return Array.from( setWall ).some(
            ( wall ) =>
            {
                if( OverlapTester.overlapRects( this.rectBound, wall.rectBound ) )
                {
                    return true;
                }
            } );
    }
};
